import { describe, expect, it } from 'vitest'
import { retrievalQueries } from './retrieve'

describe('retrievalQueries', () => {
  it('is the question alone on a first turn', () => {
    expect(retrievalQueries('How do we start?', null)).toEqual(['How do we start?'])
  })

  it('adds the previous turn as a second form on a follow-up, the default search', () => {
    expect(retrievalQueries('What about for nonprofits?', 'Do you work with startups?')).toEqual([
      'What about for nonprofits?',
      'Do you work with startups?\nWhat about for nonprofits?',
    ])
  })

  it('caps the combined form from the front, so the current question always survives', () => {
    const [, combined] = retrievalQueries('What results did it get?', 'x'.repeat(900))
    expect(combined).toHaveLength(700)
    expect(combined.endsWith('\nWhat results did it get?')).toBe(true)
  })
})
