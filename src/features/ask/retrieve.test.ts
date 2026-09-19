import { describe, expect, it } from 'vitest'
import { pageRetrievalQuery, retrievalQueries } from './retrieve'

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

describe('pageRetrievalQuery', () => {
  it('puts the page title where the question left its subject out', () => {
    expect(pageRetrievalQuery('What results did it get?', 'Interchecks')).toBe(
      'About Interchecks: What results did it get?',
    )
  })

  it('caps from the front, so the question always survives', () => {
    const query = pageRetrievalQuery('What results did it get?', 'x'.repeat(900))
    expect(query).toHaveLength(700)
    expect(query.endsWith(': What results did it get?')).toBe(true)
  })
})
