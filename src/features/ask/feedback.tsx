'use client'

import { createContext, use } from 'react'
import type { AskHandoffSignal, AskRating, AskRatingReason } from './vocabulary'

export type AskRated = { rating: AskRating; reason?: AskRatingReason }

/**
 * The visitor's word on a turn, and the ids it is filed under. `turn` is the
 * user message's id, so the row is found without a row id ever reaching the
 * browser. Provided by the transcript; read by the rating control and the
 * handoff, wherever they sit in it.
 */
export type AskFeedback = {
  conversation: string
  ratings: Record<string, AskRated>
  rate: (turn: string, rated: AskRated) => void
  handoff: (turn: string, signal: AskHandoffSignal) => void
}

const AskFeedbackContext = createContext<AskFeedback | null>(null)

export const AskFeedbackProvider = AskFeedbackContext.Provider

export const useAskFeedback = (): AskFeedback => {
  const feedback = use(AskFeedbackContext)
  if (!feedback) throw new Error('useAskFeedback needs an AskFeedbackProvider')
  return feedback
}

/** Fire and forget: feedback never blocks the visitor and never surfaces a failure. */
export function postAskFeedback(body: {
  id: string
  turn: string
  rating?: AskRating
  reason?: AskRatingReason
  handoff?: AskHandoffSignal
}): void {
  void fetch('/api/ask/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => undefined)
}
