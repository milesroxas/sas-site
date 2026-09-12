import type { SelectOption } from '@/shared/content/options'
import type { AskHandoffReason } from './handoff'

/**
 * The words Ask and the team agree on: what a question can be, what a turn
 * became, and what the team may say about it. Client-safe (no server
 * imports), so the composer, the endpoint, the collection config and the
 * admin panels all read the same lists.
 */

/** What a question may be: the composer's and the endpoint's one rule. */
export const ASK_QUESTION_LENGTH = { min: 3, max: 500 } as const

/** The most messages one open Ask box can hold, as the endpoint accepts them and the admin reads them. */
export const ASK_MAX_MESSAGES = 30

/**
 * What the visitor got for a turn, derived from what the endpoint knows:
 * whether sources were retrieved, whether the reply ended in a handoff and
 * why, and whether the stream failed or was stopped. Not a quality signal
 * (that is `rating`); a content-gap list is `no_sources`.
 */
export const ASK_OUTCOMES = [
  { label: 'Answered', value: 'answered' },
  { label: 'Partial', value: 'partial' },
  { label: 'No sources', value: 'no_sources' },
  { label: 'Chat only', value: 'chat_only' },
  { label: 'Stopped', value: 'stopped' },
  { label: 'Error', value: 'error' },
] as const satisfies readonly SelectOption[]

export type AskOutcome = (typeof ASK_OUTCOMES)[number]['value']

/** Outcomes where the site had something to say. */
export const ASK_GROUNDED_OUTCOMES = [
  'answered',
  'partial',
] as const satisfies readonly AskOutcome[]

/** Which path in `retrieveSources()` produced a turn's sources. */
export const ASK_RETRIEVAL_PATHS = [
  { label: 'Embedding', value: 'embedding' },
  { label: 'Keyword', value: 'keyword' },
  { label: 'None', value: 'none' },
] as const satisfies readonly SelectOption[]

export type AskRetrievalPath = (typeof ASK_RETRIEVAL_PATHS)[number]['value']

export const ASK_RATINGS = [
  { label: 'Helpful', value: 'up' },
  { label: 'Not helpful', value: 'down' },
] as const satisfies readonly SelectOption[]

export type AskRating = (typeof ASK_RATINGS)[number]['value']

/** One tap after a thumbs down. */
export const ASK_RATING_REASONS = [
  { label: 'Wrong', value: 'wrong' },
  { label: 'Incomplete', value: 'incomplete' },
  { label: 'Off topic', value: 'off_topic' },
] as const satisfies readonly SelectOption[]

export type AskRatingReason = (typeof ASK_RATING_REASONS)[number]['value']

/** How far the visitor went toward a person after this turn. */
export const ASK_HANDOFF_SIGNALS = [
  { label: 'Opened the contact page', value: 'clicked' },
  { label: 'Sent an inquiry', value: 'inquiry_sent' },
] as const satisfies readonly SelectOption[]

export type AskHandoffSignal = (typeof ASK_HANDOFF_SIGNALS)[number]['value']

/** The team's work state for a question. */
export const ASK_TRIAGE_STATUSES = [
  { label: 'New', value: 'new' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Content planned', value: 'content_planned' },
  { label: 'Ignored', value: 'ignored' },
] as const satisfies readonly SelectOption[]

/**
 * The outcome of a turn, the one derivation for every path through the
 * endpoint. A `no_answer` handoff is a content gap whether nothing was
 * retrieved (the first-turn card) or the model found the sources
 * irrelevant; a source-less follow-up is conversation only; a reply that
 * ends in any other handoff was only partly the site's to answer.
 */
export function askOutcome({
  grounded,
  handoffReason,
}: {
  grounded: boolean
  handoffReason: AskHandoffReason | null
}): AskOutcome {
  if (handoffReason === 'no_answer') return 'no_sources'
  if (!grounded) return 'chat_only'
  return handoffReason ? 'partial' : 'answered'
}
