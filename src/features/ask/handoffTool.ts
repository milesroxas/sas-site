import { jsonSchema, tool } from 'ai'
import type { SiteInfo } from '@/payload-types'
import { inquiryResponseTime } from '@/shared/content/inquiry'
import { ASK_HANDOFF_REASONS, type AskHandoff, type AskHandoffReason } from './handoff'

/** A handoff reason resolved into the card: Site Info's promise and booking link. */
export function resolveAskHandoff(siteInfo: SiteInfo, reason: AskHandoffReason): AskHandoff {
  return {
    reason,
    responseTime: inquiryResponseTime(siteInfo),
    scheduleUrl: siteInfo.inquiries?.scheduleUrl || null,
  }
}

/**
 * The one tool the Ask model has. It decides that a person should take it
 * from here and why; the card's words and promise come from code and Site
 * Info, so the model can offer a handoff but never invent a promise. One
 * step, like every Ask reply (streamText's default): the card lands after the
 * answer's words, or alone. A second, tool-free step to write around a
 * card-only reply was tried and dropped: the model restated the card and
 * invented reply times, the exact promise the card exists to keep out of its
 * mouth.
 */
export function askHandoffTool(siteInfo: SiteInfo) {
  return tool({
    description:
      'Shows the visitor a card under your reply where they can send their question to the team: their name and email go straight to our inbox, and the card says when we reply. Call it at most once, after any text. Most answers need no card.',
    inputSchema: jsonSchema<{ reason: AskHandoffReason }>(
      {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            enum: [...ASK_HANDOFF_REASONS],
            description:
              'estimate: what their own project would cost, how long it would take, or when we could start. project: they want to start or discuss a project with us. person: they ask for a person, or for something only a person can answer. contact_details: they shared an email address, phone number, or name. no_answer: nothing on the site answers the question.',
          },
        },
        required: ['reason'],
        additionalProperties: false,
      },
      {
        // The schema is advice to the model, not a guarantee: a reason with
        // no card fails the call (no card, the quiet row stands in) rather
        // than reaching `execute`.
        validate: (value) => {
          const reason = (value as { reason?: unknown } | null)?.reason
          return ASK_HANDOFF_REASONS.includes(reason as AskHandoffReason)
            ? { success: true, value: { reason: reason as AskHandoffReason } }
            : { success: false, error: new Error(`Unknown handoff reason: ${String(reason)}`) }
        },
      },
    ),
    execute: ({ reason }) => resolveAskHandoff(siteInfo, reason),
  })
}
