import type { UIMessage } from 'ai'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { askHandoffFixture } from './fixtures'
import {
  ASK_HANDOFF_REASONS,
  ASK_HANDOFFS,
  type AskUIMessage,
  askHandoffEmail,
  askHandoffMessage,
  askHandoffState,
  clearAskHandoff,
  handoffOf,
  readAskHandoff,
  resolveAskHandoffTerms,
  saveAskHandoff,
} from './handoff'

const user = (id: string, text: string): UIMessage => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
})
const assistant = (id: string, text: string): UIMessage => ({
  id,
  role: 'assistant',
  parts: [{ type: 'text', text }],
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
  const answered = assistant('b', 'With a call.') as AskUIMessage
  const asked = user('q', 'How do we start?') as AskUIMessage

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
