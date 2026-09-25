import { describe, expect, it } from 'vitest'
import {
  ASK_JUDGE_THRESHOLDS,
  type AskTurnJudgment,
  askJudgeMode,
  dependsOnPrevious,
  isAside,
  judgePassages,
  judgeTurn,
  leansOnPage,
  offTopic,
  pickNextPage,
  routeCardReason,
  routePassage,
  routeTurn,
  wantsTheTeam,
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
    asksToSend: 0.02,
    aboutStudio: 0.95,
    hasSubstance: 0.95,
    acceptsOffer: null,
    answersReply: null,
    dependsOnPrevious: null,
    openReference: null,
    model: 'jev-test',
    inputTokens: 600,
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
  it('opens the person card when the visitor asks for their question to reach the team', () => {
    const asks = judgment({ request: 'other', confidence: 0.2, asksToSend: T.asksToSend })
    // An unsure `request` does not hold it back.
    expect(routeTurn(asks, firstTurn)).toEqual({ kind: 'card', reason: 'person' })
    // Once sent there is never a card.
    expect(routeTurn(asks, { isFollowUp: true, handoffState: 'sent' })).toEqual({
      kind: 'fallback',
    })
  })

  it('takes a yes to the offer on screen, unless it answers what the reply asked', () => {
    const yes = judgment({
      request: 'conversation',
      acceptsOffer: T.acceptsOffer,
      answersReply: 0.1,
    })
    expect(routeTurn(yes, followUp)).toEqual({ kind: 'card', reason: 'person' })
    expect(routeTurn(judgment({ ...yes, answersReply: T.answersReply }), followUp)).toEqual({
      kind: 'conversation',
    })
    expect(routeTurn(judgment({ ...yes, acceptsOffer: T.acceptsOffer - 0.01 }), followUp)).toEqual({
      kind: 'conversation',
    })
    // No offer check (none on screen, or it failed): the yes stays a conversation.
    expect(wantsTheTeam(judgment({ request: 'conversation' }))).toBe(false)
  })

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

describe('leansOnPage', () => {
  it('is no when unknown: the search as it was before the journey', () => {
    expect(leansOnPage(null)).toBe(false)
    expect(leansOnPage(judgment({ openReference: null }))).toBe(false)
  })

  it('adds the page search at the threshold and not under it', () => {
    expect(leansOnPage(judgment({ openReference: T.openReference }))).toBe(true)
    expect(leansOnPage(judgment({ openReference: T.openReference - 0.01 }))).toBe(false)
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

describe('offTopic', () => {
  it('reads a turn unrelated to the studio as off topic', () => {
    expect(offTopic(judgment({ request: 'other', aboutStudio: T.aboutStudio - 0.01 }))).toBe(true)
    expect(offTopic(judgment({ request: 'other', aboutStudio: T.aboutStudio }))).toBe(false)
  })

  it('never calls a thanks, an aside, or a turn with no judgment off topic', () => {
    expect(offTopic(judgment({ request: 'conversation', aboutStudio: 0.01 }))).toBe(false)
    expect(offTopic(judgment({ request: 'other', aboutStudio: 0.01, hasSubstance: 0.02 }))).toBe(
      false,
    )
    expect(offTopic(null)).toBe(false)
  })

  it('leaves a follow-up that leans on the turn before it to that turn', () => {
    const leaning = { request: 'other', aboutStudio: 0.01 } as const
    expect(offTopic(judgment({ ...leaning, dependsOnPrevious: T.dependsOnPrevious }))).toBe(false)
    expect(offTopic(judgment({ ...leaning, dependsOnPrevious: 0.1 }))).toBe(true)
  })
})

describe('isAside', () => {
  it('marks a turn that only agrees, thanks or asks to be put in touch', () => {
    expect(isAside(judgment({ hasSubstance: T.substance - 0.01 }))).toBe(true)
    expect(isAside(judgment({ hasSubstance: T.substance }))).toBe(false)
    expect(isAside(null)).toBe(false)
  })
})

describe('pickNextPage', () => {
  const pages = ['a', 'b', 'c']
  const judged = (pick: number | null, confidence: number) => ({
    pick,
    confidence,
    inputTokens: 80,
    ms: 120,
  })

  it("takes Jev's pick however sure, and no page when it confidently says none", () => {
    expect(pickNextPage(pages, judged(2, 0.9))).toBe('c')
    expect(pickNextPage(pages, judged(2, 0.1))).toBe('c')
    expect(pickNextPage(pages, judged(null, T.noNextPage))).toBeNull()
  })

  it("falls back to retrieval's top page without a judgment or on an unsure none", () => {
    expect(pickNextPage(pages, null)).toBe('a')
    expect(pickNextPage(pages, judged(null, T.noNextPage - 0.01))).toBe('a')
    expect(pickNextPage(pages, judged(7, 0.9))).toBe('a')
    expect(pickNextPage([], null)).toBeNull()
  })
})
