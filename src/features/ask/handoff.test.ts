import type { UIMessage } from 'ai'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { askHandoffFixture } from './fixtures'
import {
  type AskUIMessage,
  askHandoffEmail,
  askHandoffMessage,
  clearAskHandoff,
  handoffOf,
  readAskHandoff,
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

afterEach(() => {
  sessionStorage.clear()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('Ask handoff', () => {
  it('carries only what the visitor asked, never the answers', () => {
    saveAskHandoff([user('1', 'How do we start?'), assistant('2', 'We begin with a call.')])
    expect(readAskHandoff()).toBe('From my Ask conversation:\n- How do we start?\n\n')
  })

  it('survives repeated reads, so a remounted form still gets it', () => {
    saveAskHandoff([user('1', 'What does it cost?')])
    expect(readAskHandoff()).not.toBeNull()
    expect(readAskHandoff()).not.toBeNull()
  })

  it('is gone once the inquiry is sent', () => {
    saveAskHandoff([user('1', 'What does it cost?')])
    clearAskHandoff()
    expect(readAskHandoff()).toBeNull()
  })

  it('keeps the latest five questions', () => {
    saveAskHandoff(Array.from({ length: 7 }, (_, i) => user(String(i), `Question ${i + 1}`)))
    const text = readAskHandoff() ?? ''
    expect(text).not.toContain('Question 2')
    expect(text).toContain('Question 3')
    expect(text).toContain('Question 7')
  })

  it('leaves the visitor room to write', () => {
    saveAskHandoff([user('1', 'x'.repeat(500)), user('2', 'y'.repeat(500))])
    expect((readAskHandoff() ?? '').trimEnd().length).toBeLessThanOrEqual(600)
  })

  it('ignores a handoff left behind half an hour ago', () => {
    vi.useFakeTimers()
    saveAskHandoff([user('1', 'Who have you worked with?')])
    vi.advanceTimersByTime(31 * 60_000)
    expect(readAskHandoff()).toBeNull()
  })

  it('saves nothing when there is no question yet', () => {
    saveAskHandoff([assistant('1', 'Hello')])
    expect(readAskHandoff()).toBeNull()
  })

  it('opens the form empty when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => saveAskHandoff([user('1', 'How do we start?')])).not.toThrow()
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
    saveAskHandoff(messages)
    expect(askHandoffMessage(messages)).toBe('From my Ask conversation:\n- How do we start?')
    expect(readAskHandoff()).toBe(`${askHandoffMessage(messages)}\n\n`)
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
