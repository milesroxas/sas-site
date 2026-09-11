import type { PayloadRequest } from 'payload'
import { afterResponse } from '@/utilities/afterResponse'
import { redactFreeText } from './redact'

/** A page path from the client: path only, no query, fragment, or protocol-relative host. */
const PAGE_PATH = /^\/(?!\/)\S{0,199}$/

/** The AI SDK chat id: random per open Ask box, linked to nothing else. */
const CONVERSATION_ID = /^[A-Za-z0-9_-]{1,64}$/

function pagePathFrom(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const path = value.split(/[?#]/)[0] ?? ''
  return PAGE_PATH.test(path) ? path : null
}

function conversationFrom(value: unknown): string | null {
  return typeof value === 'string' && CONVERSATION_ID.test(value) ? value : null
}

/**
 * Store one Ask question for the team (the `ask-questions` collection).
 *
 * Runs after the response, so it never adds to the answer's latency. The text
 * is redacted first, and nothing that identifies the visitor is kept: no IP, no
 * analytics id. `pagePath` and `conversation` arrive from the client and are
 * only kept if they have the expected shape.
 */
export function recordAskQuestion(
  req: PayloadRequest,
  record: {
    question: string
    answered: boolean
    followUp: boolean
    sourceCount: number
    pagePath: unknown
    conversation: unknown
  },
): void {
  afterResponse(async () => {
    try {
      await req.payload.create({
        collection: 'ask-questions',
        // Team-only collection, written as the system; no user is passed.
        overrideAccess: true,
        data: {
          question: redactFreeText(record.question),
          answered: record.answered,
          followUp: record.followUp,
          sourceCount: record.sourceCount,
          pagePath: pagePathFrom(record.pagePath),
          conversation: conversationFrom(record.conversation),
        },
      })
    } catch (err) {
      req.payload.logger.error({ msg: 'Failed to store Ask question', err })
    }
  })
}
