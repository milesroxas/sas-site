import { jsonSchema, tool } from 'ai'
import type { SiteInfo } from '@/payload-types'
import {
  ASK_HANDOFF_REASONS,
  type AskHandoff,
  type AskHandoffReason,
  resolveAskHandoffTerms,
} from './handoff'

/** A handoff reason resolved with Site Info's terms, as the transcript renders it. */
export function resolveAskHandoff(siteInfo: SiteInfo, reason: AskHandoffReason): AskHandoff {
  return { reason, ...resolveAskHandoffTerms(siteInfo) }
}

/**
 * The one tool the Ask model has. It decides that a person should take it
 * from here and why; the words of the offer and its promise come from code
 * and Site Info, so the model can offer a handoff but never invent a promise.
 * One step, like every Ask reply (streamText's default): the offer lands
 * after the answer's words, or, with the reason's own lead line, alone. A
 * second, tool-free step to write around an offer-only reply was tried and
 * dropped: the model restated the offer and invented reply times, the exact
 * promise the offer exists to keep out of its mouth.
 */
export function askHandoffTool(siteInfo: SiteInfo) {
  return tool({
    description:
      'Offers the visitor a way to send their question to the team: a line under your reply with a button that opens a name and email form, filed to our inbox, with our reply time on it. Call it at most once, after any text, and only when a person is the best next step. Most answers need no offer. Never call it for a question the sources answer, such as how we work, how projects start, who we have worked with, or what we offer.',
    inputSchema: jsonSchema<{ reason: AskHandoffReason }>(
      {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            enum: [...ASK_HANDOFF_REASONS],
            description:
              'estimate: what their own project would cost, how long it would take, or when we could start. project: they say they have a project, or ask us to do something for them (not a question about how we work or how projects start). person: they ask for a person by name or role, or to be called or emailed. contact_details: they shared an email address or phone number (a name alone is not a request). no_answer: nothing in the sources answers the question.',
          },
        },
        required: ['reason'],
        additionalProperties: false,
      },
      {
        // The schema is advice to the model, not a guarantee: a reason with
        // no copy fails the call (no offer beyond the quiet one) rather than
        // reaching `execute`.
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
