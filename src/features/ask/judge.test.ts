import { describe, expect, it } from 'vitest'
import {
  ASK_JUDGE_THRESHOLDS,
  type AskTurnJudgment,
  askJudgeMode,
  dependsOnPrevious,
  judgePassages,
  judgeTurn,
  routeCardReason,
  routePassage,
  routeTurn,
} from './judge'

const T = ASK_JUDGE_THRESHOLDS

/** A confident `information` judgment; each test overrides what it is about. */
function judgment(overrides: Partial<AskTurnJudgment> = {}): AskTurnJudgment {
  return {
    request: 'information',
    confidence: 0.95,
    probabilities: {
      information: 0.95,
      estimate: 0.01,
      project: 0.01,
      person: 0.01,
      conversation: 0.01,
      other: 0.01,
    },
    ownProject: 0.05,
    generalQuestion: 0.9,
    namesWork: 0.05,
    dependsOnPrevious: null,
    model: 'jev-test',
    ms: 100,
    ...overrides,
  }
}

const firstTurn = { isFollowUp: false, handoffState: 'none' } as const
const followUp = { isFollowUp: true, handoffState: 'none' } as const

describe('askJudgeMode', () => {
  it('is off without a key, whatever ASK_JEV says', () => {
    expect(askJudgeMode({ ASK_JEV: 'on' })).toBe('off')
    expect(askJudgeMode({ ASK_JEV: 'on', TYPESAFE_API_KEY: '  ' })).toBe('off')
  })

  it('reads the mode with a key, and treats anything unknown as off', () => {
    const key = { TYPESAFE_API_KEY: 'key' }
    expect(askJudgeMode({ ...key })).toBe('off')
    expect(askJudgeMode({ ...key, ASK_JEV: 'shadow' })).toBe('shadow')
    expect(askJudgeMode({ ...key, ASK_JEV: ' ON ' })).toBe('on')
    expect(askJudgeMode({ ...key, ASK_JEV: 'true' })).toBe('off')
  })
})

describe('routeTurn', () => {
  it("falls back to today's path without a judgment or below the confidence floor", () => {
    expect(routeTurn(null, firstTurn)).toEqual({ kind: 'fallback' })
    expect(routeTurn(judgment({ confidence: T.low - 0.01 }), firstTurn)).toEqual({
      kind: 'fallback',
    })
  })

  it('shows the person card only on a confident pick', () => {
    expect(routeTurn(judgment({ request: 'person', confidence: T.act }), firstTurn)).toEqual({
      kind: 'card',
      reason: 'person',
    })
    expect(routeTurn(judgment({ request: 'person', confidence: T.act - 0.01 }), firstTurn)).toEqual(
      { kind: 'fallback' },
    )
  })

  it("makes an estimate the card alone only when it is plainly the visitor's own project", () => {
    const own = { request: 'estimate', ownProject: 0.95, generalQuestion: 0.1 } as const
    expect(routeTurn(judgment(own), firstTurn)).toEqual({ kind: 'card', reason: 'estimate' })
    // A general question in the same turn is the site's to answer first.
    expect(routeTurn(judgment({ ...own, generalQuestion: T.generalQuestion }), firstTurn)).toEqual({
      kind: 'evidence',
      reason: 'estimate',
    })
    // "What does it cost?" is not plainly their own project.
    expect(routeTurn(judgment({ ...own, ownProject: T.ownProject - 0.01 }), firstTurn)).toEqual({
      kind: 'evidence',
      reason: 'estimate',
    })
  })

  it('makes a project the card alone only when it names no kind of work', () => {
    const bare = { request: 'project', generalQuestion: 0.05, namesWork: 0.05 } as const
    expect(routeTurn(judgment(bare), firstTurn)).toEqual({ kind: 'card', reason: 'project' })
    // "Can you fix my Webflow site?": the site may speak to Webflow, then the card.
    expect(routeTurn(judgment({ ...bare, namesWork: T.namesWork }), firstTurn)).toEqual({
      kind: 'evidence',
      reason: 'project',
    })
  })

  it('keeps conversation for follow-ups and sends everything else to the evidence', () => {
    expect(routeTurn(judgment({ request: 'conversation' }), followUp)).toEqual({
      kind: 'conversation',
    })
    expect(routeTurn(judgment({ request: 'conversation' }), firstTurn)).toEqual({
      kind: 'evidence',
      reason: null,
    })
    for (const request of ['information', 'other'] as const) {
      expect(routeTurn(judgment({ request }), firstTurn)).toEqual({
        kind: 'evidence',
        reason: null,
      })
    }
  })

  it('never routes to a card once the visitor has sent their details', () => {
    const sent = { isFollowUp: true, handoffState: 'sent' } as const
    expect(routeTurn(judgment({ request: 'person' }), sent)).toEqual({ kind: 'fallback' })
    expect(
      routeTurn(judgment({ request: 'estimate', ownProject: 0.95, generalQuestion: 0.1 }), sent),
    ).toEqual({ kind: 'evidence', reason: null })
    expect(
      routeTurn(judgment({ request: 'project', generalQuestion: 0.05, namesWork: 0.05 }), sent),
    ).toEqual({ kind: 'evidence', reason: null })
  })
})

describe('routeCardReason', () => {
  it('names the card a route ends in, or none', () => {
    expect(routeCardReason({ kind: 'card', reason: 'person' })).toBe('person')
    expect(routeCardReason({ kind: 'evidence', reason: 'estimate' })).toBe('estimate')
    expect(routeCardReason({ kind: 'evidence', reason: null })).toBeNull()
    expect(routeCardReason({ kind: 'conversation' })).toBeNull()
    expect(routeCardReason({ kind: 'fallback' })).toBeNull()
  })
})

describe('dependsOnPrevious', () => {
  it('attaches the previous turn when unknown, as today', () => {
    expect(dependsOnPrevious(null)).toBe(true)
    expect(dependsOnPrevious(judgment({ dependsOnPrevious: null }))).toBe(true)
  })

  it('reads the threshold otherwise', () => {
    expect(dependsOnPrevious(judgment({ dependsOnPrevious: T.dependsOnPrevious }))).toBe(true)
    expect(dependsOnPrevious(judgment({ dependsOnPrevious: T.dependsOnPrevious - 0.01 }))).toBe(
      false,
    )
  })
})

describe('routePassage', () => {
  it('keeps a passage whose check failed', () => {
    expect(routePassage(null)).toBe('keep')
  })

  it('drops on relevance first, then keeps only usable evidence', () => {
    expect(routePassage({ isRelevant: T.relevant - 0.01, hasEvidence: 0.99 })).toBe('drop')
    expect(routePassage({ isRelevant: 0.9, hasEvidence: T.evidence + 0.01 })).toBe('keep')
    expect(routePassage({ isRelevant: 0.9, hasEvidence: T.evidence })).toBe('drop')
  })
})

describe('without a key', () => {
  it('answers null and never calls out', async () => {
    const key = process.env.TYPESAFE_API_KEY
    delete process.env.TYPESAFE_API_KEY
    try {
      expect(await judgeTurn({ question: 'How do we start?', previousQuestion: null })).toBeNull()
      expect(
        await judgePassages({
          query: 'How do we start?',
          chunks: [{ title: 'Home', headingPath: null, text: 'We start with a call.' }],
        }),
      ).toBeNull()
    } finally {
      if (key !== undefined) process.env.TYPESAFE_API_KEY = key
    }
  })
})
