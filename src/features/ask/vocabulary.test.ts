import { describe, expect, it } from 'vitest'
import { askOutcome } from './vocabulary'

describe('askOutcome', () => {
  it('is answered when the sources carried the whole reply', () => {
    expect(askOutcome({ grounded: true, handoffReason: null })).toBe('answered')
  })

  it('is partial when the reply ended in a handoff', () => {
    expect(askOutcome({ grounded: true, handoffReason: 'estimate' })).toBe('partial')
  })

  it('is a content gap whenever the reply was the no-answer card', () => {
    expect(askOutcome({ grounded: true, handoffReason: 'no_answer' })).toBe('no_sources')
    expect(askOutcome({ grounded: false, handoffReason: 'no_answer' })).toBe('no_sources')
  })

  it('is chat only for a source-less follow-up, whatever else it offered', () => {
    expect(askOutcome({ grounded: false, handoffReason: null })).toBe('chat_only')
    expect(askOutcome({ grounded: false, handoffReason: 'person' })).toBe('chat_only')
  })
})
