import { afterEach, describe, expect, it, vi } from 'vitest'
import { askHandoffFixture } from './fixtures'
import {
  ASK_HANDOFF_DRAFT_EMPTY,
  ASK_HANDOFF_REASONS,
  ASK_HANDOFFS,
  type AskHandoffDraft,
  type AskHandoffReason,
  type AskUIMessage,
  askHandoffEmail,
  askHandoffForm,
  askHandoffMessage,
  askHandoffOpen,
  askHandoffState,
  clearAskHandoff,
  contactFromMessage,
  handoffOf,
  readAskHandoff,
  resolveAskHandoffTerms,
  saveAskHandoff,
} from './handoff'

const user = (id: string, text: string): AskUIMessage => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
})
const assistant = (id: string, text: string): AskUIMessage => ({
  id,
  role: 'assistant',
  parts: [{ type: 'text', text }],
})
/** A reply whose question Jev read as an aside (`data-turn`). */
const afterAside = (id: string, text: string): AskUIMessage => ({
  id,
  role: 'assistant',
  parts: [
    { type: 'data-turn', id: `${id}-turn`, data: { aside: true } },
    { type: 'text', text },
  ],
})
/** A reply that is only the handoff card, or the card after `text`. */
const carding = (id: string, reason: AskHandoffReason, text = ''): AskUIMessage => ({
  id,
  role: 'assistant',
  parts: [
    ...(text ? [{ type: 'text' as const, text }] : []),
    {
      type: 'tool-handoff',
      toolCallId: `call-${id}`,
      state: 'output-available',
      input: { reason },
      output: askHandoffFixture(reason),
    },
  ],
})

/** The ids every handoff is filed under; the tests read them back. */
const ids = { conversation: 'chat_1', turn: '1' }

const readMessage = () => readAskHandoff()?.message ?? null

afterEach(() => {
  sessionStorage.clear()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('Ask handoff', () => {
  it('carries only what the visitor asked, never the answers', () => {
    saveAskHandoff([user('1', 'How do we start?'), assistant('2', 'We begin with a call.')], ids)
    expect(readAskHandoff()).toEqual({
      ids,
      message: 'From my Ask conversation:\n- How do we start?\n\n',
    })
  })

  it('survives repeated reads, so a remounted form still gets it', () => {
    saveAskHandoff([user('1', 'What does it cost?')], ids)
    expect(readAskHandoff()).not.toBeNull()
    expect(readAskHandoff()).not.toBeNull()
  })

  it('is gone once the inquiry is sent', () => {
    saveAskHandoff([user('1', 'What does it cost?')], ids)
    clearAskHandoff()
    expect(readAskHandoff()).toBeNull()
  })

  it('keeps the latest five questions', () => {
    saveAskHandoff(
      Array.from({ length: 7 }, (_, i) => user(String(i), `Question ${i + 1}`)),
      ids,
    )
    const text = readMessage() ?? ''
    expect(text).not.toContain('Question 2')
    expect(text).toContain('Question 3')
    expect(text).toContain('Question 7')
  })

  it('leaves the visitor room to write', () => {
    saveAskHandoff([user('1', 'x'.repeat(500)), user('2', 'y'.repeat(500))], ids)
    expect((readMessage() ?? '').trimEnd().length).toBeLessThanOrEqual(600)
  })

  it('ignores a handoff left behind half an hour ago', () => {
    vi.useFakeTimers()
    saveAskHandoff([user('1', 'Who have you worked with?')], ids)
    vi.advanceTimersByTime(31 * 60_000)
    expect(readAskHandoff()).toBeNull()
  })

  it('saves nothing when there is no question yet', () => {
    saveAskHandoff([assistant('1', 'Hello')], ids)
    expect(readAskHandoff()).toBeNull()
  })

  it('opens the form empty when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => saveAskHandoff([user('1', 'How do we start?')], ids)).not.toThrow()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readAskHandoff()).toBeNull()
  })
})

describe('handoffOf', () => {
  const reply = (parts: AskUIMessage['parts']): AskUIMessage => ({
    id: 'a',
    role: 'assistant',
    parts,
  })

  it('reads the card once the server has resolved it', () => {
    const output = askHandoffFixture('estimate')
    const message = reply([
      { type: 'text', text: 'We price per project.' },
      {
        type: 'tool-handoff',
        toolCallId: 'call-1',
        state: 'output-available',
        input: { reason: 'estimate' },
        output,
      },
    ])
    expect(handoffOf(message)).toEqual(output)
  })

  it('shows nothing while the call is still resolving', () => {
    const message = reply([
      {
        type: 'tool-handoff',
        toolCallId: 'call-1',
        state: 'input-available',
        input: { reason: 'estimate' },
      },
    ])
    expect(handoffOf(message)).toBeNull()
  })

  it('shows nothing for a reason this build has no card for', () => {
    const output = { ...askHandoffFixture('person'), reason: 'retired' } as unknown as ReturnType<
      typeof askHandoffFixture
    >
    const message = reply([
      {
        type: 'tool-handoff',
        toolCallId: 'call-1',
        state: 'output-available',
        input: { reason: 'person' },
        output,
      },
    ])
    expect(handoffOf(message)).toBeNull()
  })
})

describe('the card sends', () => {
  it("the visitor's questions in their own words, the same text the contact form opens with", () => {
    const messages = [user('1', 'How do we start?'), assistant('2', 'With a call.')]
    saveAskHandoff(messages, ids)
    expect(askHandoffMessage(messages)).toBe('From my Ask conversation:\n- How do we start?')
    expect(readMessage()).toBe(`${askHandoffMessage(messages)}\n\n`)
  })

  it('nothing before a question was asked', () => {
    expect(askHandoffMessage([assistant('1', 'Hello')])).toBeNull()
  })

  it('leaves out the asides Jev marked, unless they are all there is', () => {
    const messages = [
      user('1', 'My site is slow and hard to update'),
      assistant('2', 'We run performance audits.'),
      user('3', 'yes'),
      afterAside('4', 'Happy to put you in touch.'),
    ]
    expect(askHandoffMessage(messages)).toBe(
      'From my Ask conversation:\n- My site is slow and hard to update',
    )
    expect(
      askHandoffMessage([user('1', 'Can I talk to someone?'), afterAside('2', 'Happy to.')]),
    ).toBe('From my Ask conversation:\n- Can I talk to someone?')
  })

  it('starts the email field with an address written in the chat, latest first', () => {
    expect(
      askHandoffEmail([
        user('1', 'Try old@northwind.co'),
        assistant('2', 'Noted.'),
        user('3', "Actually I'm at jordan@northwind.co."),
      ]),
    ).toBe('jordan@northwind.co')
    expect(askHandoffEmail([user('1', 'What does it cost?')])).toBeNull()
  })
})

describe('askHandoffForm', () => {
  it('files a project inquiry once any reply was about their own project', () => {
    const asked = user('1', 'How much would a site cost?')
    expect(
      askHandoffForm([asked, carding('2', 'estimate'), user('3', 'ok'), carding('4', 'person')]),
    ).toBe('project')
    expect(askHandoffForm([asked, carding('2', 'person')])).toBe('general')
    expect(askHandoffForm([asked, assistant('2', 'We start with a call.')])).toBe('general')
  })
})

describe('askHandoffOpen', () => {
  const draft = (overrides: Partial<AskHandoffDraft> = {}) => ({
    ...ASK_HANDOFF_DRAFT_EMPTY,
    ...overrides,
  })

  it('opens by itself when the visitor asked for a person or shared their details', () => {
    expect(askHandoffOpen(carding('a', 'person'), draft())).toBe(true)
    expect(askHandoffOpen(carding('a', 'contact_details', 'Thanks.'), draft())).toBe(true)
  })

  it('opens for a price or a project only when the card is the whole reply', () => {
    expect(askHandoffOpen(carding('a', 'estimate'), draft())).toBe(true)
    expect(askHandoffOpen(carding('a', 'project'), draft())).toBe(true)
    expect(askHandoffOpen(carding('a', 'project', 'We build on Webflow.'), draft())).toBe(false)
  })

  it('stays an offer for a question the site does not cover, and closed where it was closed', () => {
    expect(askHandoffOpen(carding('a', 'no_answer'), draft())).toBe(false)
    expect(askHandoffOpen(assistant('a', 'We start with a call.'), draft())).toBe(false)
    expect(askHandoffOpen(carding('a', 'person'), draft({ closedUnder: 'a' }))).toBe(false)
  })

  it('stays open under any reply once the visitor opened it or typed in it', () => {
    expect(askHandoffOpen(assistant('b', 'We start with a call.'), draft({ open: true }))).toBe(
      true,
    )
  })
})

describe('contactFromMessage', () => {
  it('reads an address, and a name when the rest is one', () => {
    expect(contactFromMessage('jo@northwind.co')).toEqual({ email: 'jo@northwind.co', name: null })
    expect(contactFromMessage('Jo Park, jo@northwind.co')).toEqual({
      email: 'jo@northwind.co',
      name: 'Jo Park',
    })
    expect(contactFromMessage("sure, it's jo@northwind.co")).toEqual({
      email: 'jo@northwind.co',
      name: null,
    })
    expect(contactFromMessage('My name is Jo Park and my email is jo@northwind.co')).toEqual({
      email: 'jo@northwind.co',
      name: 'Jo Park',
    })
  })

  it('leaves a message that also asks or says something to the chat', () => {
    expect(contactFromMessage('jo@northwind.co, and what does a rebrand cost?')).toBeNull()
    expect(contactFromMessage('Email jo@northwind.co about our slow Webflow site')).toBeNull()
    expect(contactFromMessage('What does a rebrand cost?')).toBeNull()
  })
})

describe('the copy per kind', () => {
  it('gives every reason a lead line, so a handoff-only reply is never wordless', () => {
    for (const reason of ASK_HANDOFF_REASONS) {
      expect(ASK_HANDOFFS[reason].lead, reason).toBeTruthy()
      expect(ASK_HANDOFFS[reason].offer, reason).toBeTruthy()
    }
  })

  it('offers quietly, with no lead, after an answer that already has words', () => {
    expect(ASK_HANDOFFS.none.lead).toBeNull()
    expect(ASK_HANDOFFS.none.offer).toBeTruthy()
  })
})

describe('askHandoffState', () => {
  const offered: AskUIMessage = {
    id: 'a',
    role: 'assistant',
    parts: [
      {
        type: 'tool-handoff',
        toolCallId: 'call-1',
        state: 'output-available',
        input: { reason: 'estimate' },
        output: askHandoffFixture('estimate'),
      },
    ],
  }
  const answered = assistant('b', 'With a call.')
  const asked = user('q', 'How do we start?')

  it('is none until a reply offers', () => {
    expect(askHandoffState([asked, answered], false)).toBe('none')
  })

  it('stays offered for the rest of the conversation', () => {
    expect(askHandoffState([asked, offered], false)).toBe('offered')
    expect(askHandoffState([asked, offered, asked, answered], false)).toBe('offered')
  })

  it('is sent once the visitor has sent, whatever the transcript says', () => {
    expect(askHandoffState([asked, answered], true)).toBe('sent')
  })
})

describe('resolveAskHandoffTerms', () => {
  it('carries the reply time and booking link from Site Info', () => {
    expect(
      resolveAskHandoffTerms({
        inquiries: { responseTime: 'within 3 business days', scheduleUrl: 'https://cal.example' },
      }),
    ).toEqual({ responseTime: 'within 3 business days', scheduleUrl: 'https://cal.example' })
  })

  it('keeps a reply promise and no booking link without Site Info', () => {
    expect(resolveAskHandoffTerms(null)).toEqual({ responseTime: 'shortly', scheduleUrl: null })
  })
})
