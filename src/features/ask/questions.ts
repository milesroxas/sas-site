import type { Payload, PayloadRequest } from 'payload'
import { afterResponse } from '@/utilities/afterResponse'
import type { AskHandoffReason } from './handoff'
import { redactFreeText } from './redact'
import type { RetrievedSource } from './retrieve'
import type {
  AskHandoffSignal,
  AskOutcome,
  AskRating,
  AskRatingReason,
  AskRetrievalPath,
} from './vocabulary'

/** A page path from the client: path only, no query, fragment, or protocol-relative host. */
const PAGE_PATH = /^\/(?!\/)\S{0,199}$/

/** An AI SDK id (the chat, or one of its messages): random, linked to nothing else. */
const SDK_ID = /^[A-Za-z0-9_-]{1,64}$/

/** The page a question was asked on, from the client, or null when it is not a plain path. */
export function pagePathFrom(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const path = value.split(/[?#]/)[0] ?? ''
  return PAGE_PATH.test(path) ? path : null
}

/** A chat or message id from the client, or null when it is not one. */
export function askIdFrom(value: unknown): string | null {
  return typeof value === 'string' && SDK_ID.test(value) ? value : null
}

export type AskTurnRecord = {
  question: string
  /** The user message's id: how the visitor's later feedback finds this row. */
  turn: string
  conversation: string | null
  pagePath: string | null
  followUp: boolean
  retrieval: AskRetrievalPath
  sources: RetrievedSource[]
  answer: string
  outcome: AskOutcome
  handoffReason: AskHandoffReason | null
  latencyMs: number
  /** Unknown until the model finishes; null for a turn that never reached it. */
  inputTokens?: number | null
  outputTokens?: number | null
}

/**
 * Store one Ask turn for the team (the `ask-questions` collection).
 *
 * Runs after the response, so it never adds to the answer's latency. The
 * question and the answer are redacted first (the model may echo a detail),
 * and nothing that identifies the visitor is kept: no IP, no analytics id.
 * The ids and the page path were checked for shape by the endpoint.
 */
export function recordAskQuestion(req: PayloadRequest, record: AskTurnRecord): void {
  afterResponse(async () => {
    try {
      await req.payload.create({
        collection: 'ask-questions',
        // Team-only collection, written as the system; no user is passed.
        overrideAccess: true,
        data: {
          status: 'new',
          question: redactFreeText(record.question),
          answer: record.answer ? redactFreeText(record.answer) : null,
          outcome: record.outcome,
          retrieval: record.retrieval,
          handoffReason: record.handoffReason,
          sources: record.sources.map(({ title, url, similarity }) => ({
            title,
            url,
            similarity,
          })),
          followUp: record.followUp,
          latencyMs: record.latencyMs,
          inputTokens: record.inputTokens ?? null,
          outputTokens: record.outputTokens ?? null,
          pagePath: record.pagePath,
          conversation: record.conversation,
          turn: record.turn,
        },
      })
    } catch (err) {
      req.payload.logger.error({ msg: 'Failed to store Ask question', err })
    }
  })
}

export type AskTurnFeedback = {
  rating?: AskRating
  ratingReason?: AskRatingReason
  handoff?: AskHandoffSignal
}

/**
 * The visitor's word on a stored turn: a rating (first one wins; its reason
 * may follow once, since the thumb posts before the reason is picked) and how
 * far they went toward a person. Finds the row by the ids the client holds;
 * an unknown pair changes nothing, so a caller learns nothing about what is
 * stored. Returns the row's outcome for the analytics event, or null.
 */
export async function markAskTurn(
  payload: Payload,
  ids: { conversation: unknown; turn: unknown },
  feedback: AskTurnFeedback,
): Promise<{ outcome: AskOutcome | null; sourceCount: number } | null> {
  const conversation = askIdFrom(ids.conversation)
  const turn = askIdFrom(ids.turn)
  if (!conversation || !turn) return null

  const { docs } = await payload.find({
    collection: 'ask-questions',
    where: { conversation: { equals: conversation }, turn: { equals: turn } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const row = docs[0]
  if (!row) return null

  const rates = feedback.rating && !row.rating
  const explains =
    feedback.ratingReason && !row.ratingReason && (rates || row.rating === feedback.rating)
  const data = {
    ...(rates ? { rating: feedback.rating } : {}),
    ...(explains ? { ratingReason: feedback.ratingReason } : {}),
    // A sent inquiry is the stronger signal and never steps back to a click.
    ...(feedback.handoff && row.handoff !== 'inquiry_sent' ? { handoff: feedback.handoff } : {}),
  }
  if (Object.keys(data).length > 0) {
    await payload.update({ collection: 'ask-questions', id: row.id, data, overrideAccess: true })
  }
  return { outcome: row.outcome ?? null, sourceCount: row.sources?.length ?? 0 }
}

/** `markAskTurn` after the response, best-effort: the caller's own work never waits on the Ask log. */
export function markAskTurnAfterResponse(
  req: PayloadRequest,
  ids: { conversation: unknown; turn: unknown },
  feedback: AskTurnFeedback,
): void {
  afterResponse(() =>
    markAskTurn(req.payload, ids, feedback)
      .then(() => undefined)
      .catch((err) => req.payload.logger.error({ msg: 'Failed to mark Ask turn', err })),
  )
}
