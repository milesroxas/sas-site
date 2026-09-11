import { jsonSchema, tool } from 'ai'
import type { Payload } from 'payload'
import type { SiteInfo } from '@/payload-types'
import { type InquiryType, inquiryResponseTime } from '@/shared/content/inquiry'
import { surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'
import {
  ASK_HANDOFF_HREF,
  ASK_HANDOFF_REASONS,
  ASK_HANDOFFS,
  type AskHandoff,
  type AskHandoffReason,
} from './handoff'

/**
 * The published contact page whose form files `type` inquiries, as a site
 * path. Found by what the form does rather than by slug, so renaming a
 * contact page never strands the card. Read as an anonymous visitor
 * (published pages only); a miss or a failed read falls back to the general
 * contact page, which is always there.
 */
async function contactPathFor(payload: Payload, type: InquiryType): Promise<string> {
  const surface = surfaceByCollection.get('contact-pages')
  try {
    const { docs } = await payload.find({
      collection: 'contact-pages',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      select: { slug: true },
      sort: 'createdAt',
      where: { 'form.inquiryType': { equals: type } },
    })
    const slug = docs[0]?.slug
    if (surface && slug) return surfaceDocPath(surface, slug)
  } catch (err) {
    payload.logger.error({ msg: 'ask handoff: contact page lookup failed', err })
  }
  return ASK_HANDOFF_HREF
}

/** A handoff reason resolved into the card: its contact page and Site Info's promise. */
export async function resolveAskHandoff(
  payload: Payload,
  siteInfo: SiteInfo,
  reason: AskHandoffReason,
): Promise<AskHandoff> {
  return {
    reason,
    href: await contactPathFor(payload, ASK_HANDOFFS[reason].form),
    responseTime: inquiryResponseTime(siteInfo),
    scheduleUrl: siteInfo.inquiries?.scheduleUrl || null,
  }
}

/**
 * The one tool the Ask model has. It decides that a person should take it
 * from here and why; the card's words, links and reply time are resolved
 * here from the CMS, so the model can offer a handoff but never invent a
 * promise. One step, like every Ask reply (streamText's default): the
 * card lands after the answer's words, or alone. A second, tool-free step to
 * write around a card-only reply was tried and dropped: the model restated
 * the card and invented reply times, the exact promise the card exists to
 * keep out of its mouth.
 */
export function askHandoffTool(payload: Payload, siteInfo: SiteInfo) {
  return tool({
    description:
      'Shows the visitor a card under your reply that hands them to a person: a button to our contact form with their questions carried over, when we reply, and a link to book a call. Call it at most once, after any text. Most answers need no card.',
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
    execute: ({ reason }) => resolveAskHandoff(payload, siteInfo, reason),
  })
}
