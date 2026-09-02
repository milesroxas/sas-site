import type { Endpoint, PayloadRequest } from 'payload'
import type { Inquiry } from '@/payload-types'
import {
  INQUIRY_BUDGETS,
  INQUIRY_MESSAGE_MAX_LENGTH,
  INQUIRY_TIMELINES,
  INQUIRY_TYPES,
  type InquiryType,
} from '@/shared/content/inquiry'
import { isValidEmailAddress, normalizeEmailAddress } from '@/utilities/emailAddress'
import { deliverInquiryEmails } from './notify'

/**
 * Public inquiry intake (POST /api/inquiries/submit).
 *
 * Notes for the security-minded reader:
 * - The collection itself is team-only. This is the one door in, and it writes
 *   through the Local API server-side, so the shape of what gets stored is
 *   decided here rather than by whatever the browser posted.
 * - Every enum value is checked against the canonical list and every
 *   capability id against the taxonomy, so a crafted payload cannot widen the
 *   stored vocabulary.
 * - A honeypot field silently swallows naive bots, and a short per-email
 *   window absorbs double submits (an impatient second click must not create a
 *   second lead) without telling a prober anything.
 * - Free text is length-capped before it reaches the database, not after.
 */
const MAX_NAME_LENGTH = 200
const MAX_COMPANY_LENGTH = 200
const MAX_URL_LENGTH = 500

/** Repeat submissions from one address inside this window collapse into the first. */
const DEDUPE_WINDOW_MS = 60_000

const json = (body: unknown, status = 200) => Response.json(body, { status })

const trimmed = (value: unknown, max: number): string | undefined => {
  if (typeof value !== 'string') return undefined
  const next = value.trim().slice(0, max)
  return next.length > 0 ? next : undefined
}

const oneOf = <T extends string>(
  options: readonly { value: string }[],
  value: unknown,
): T | undefined =>
  typeof value === 'string' && options.some((option) => option.value === value)
    ? (value as T)
    : undefined

/**
 * Capability ids the visitor picked, reduced to the ones that actually exist.
 * Silently dropping unknown ids beats failing the submission: the brief is
 * what matters, and a stale id means the form was cached, not that the person
 * did anything wrong.
 */
async function resolveCapabilities(req: PayloadRequest, raw: unknown): Promise<number[]> {
  if (!Array.isArray(raw) || raw.length === 0) return []

  const ids = raw
    .map((value) => (typeof value === 'number' ? value : Number.parseInt(String(value), 10)))
    .filter((value) => Number.isInteger(value))
    .slice(0, 20)

  if (ids.length === 0) return []

  const { docs } = await req.payload.find({
    collection: 'capabilities',
    where: { id: { in: ids } },
    limit: ids.length,
    depth: 0,
    select: {},
    req,
  })

  return docs.map((doc) => doc.id)
}

/** Was this address here a moment ago? Then this is the same request twice. */
async function recentDuplicate(req: PayloadRequest, email: string): Promise<Inquiry | undefined> {
  const { docs } = await req.payload.find({
    collection: 'inquiries',
    where: {
      email: { equals: email },
      submittedAt: { greater_than: new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString() },
    },
    limit: 1,
    depth: 0,
    sort: '-submittedAt',
    req,
  })
  return docs[0]
}

const submit: Endpoint = {
  path: '/submit',
  method: 'post',
  handler: async (req) => {
    try {
      const body = (await req.json?.().catch(() => null)) as Record<string, unknown> | null

      // Honeypot: the field is off-screen, so only a bot ever fills it in.
      if (typeof body?.role === 'string' && body.role.length > 0) {
        return json({ reference: null, submittedAt: new Date().toISOString() })
      }

      const email = typeof body?.email === 'string' ? normalizeEmailAddress(body.email) : ''
      if (!isValidEmailAddress(email)) {
        return json({ error: 'Enter an email address we can reply to.' }, 400)
      }

      const name = trimmed(body?.name, MAX_NAME_LENGTH)
      if (!name) {
        return json({ error: 'Tell us who you are.' }, 400)
      }

      const message = trimmed(body?.message, INQUIRY_MESSAGE_MAX_LENGTH)
      if (!message) {
        return json({ error: 'Add a line or two about what you need.' }, 400)
      }

      const type = oneOf<InquiryType>(INQUIRY_TYPES, body?.type) ?? 'general'
      const isProject = type === 'project'

      const duplicate = await recentDuplicate(req, email)
      if (duplicate) {
        return json({ reference: duplicate.reference, submittedAt: duplicate.submittedAt })
      }

      const created = await req.payload.create({
        collection: 'inquiries',
        req,
        // Deliberate, and the reason this endpoint exists: the collection is
        // team-only, so the write has to run as the system. Every value above
        // has already been checked against the canonical vocabulary, which is
        // what makes bypassing access control safe here. No `user` is passed —
        // if one ever is, this must become `overrideAccess: false`.
        overrideAccess: true,
        data: {
          type,
          status: 'new',
          name,
          email,
          message,
          company: trimmed(body?.company, MAX_COMPANY_LENGTH),
          website: trimmed(body?.website, MAX_URL_LENGTH),
          sourceUrl: trimmed(body?.sourceUrl, MAX_URL_LENGTH),
          ...(isProject
            ? {
                capabilities: await resolveCapabilities(req, body?.capabilities),
                capabilitiesUnsure: body?.capabilitiesUnsure === true,
                budget: oneOf(INQUIRY_BUDGETS, body?.budget),
                timeline: oneOf(INQUIRY_TIMELINES, body?.timeline),
              }
            : {}),
        },
      })

      // After `create` resolves, and not a moment before: Payload runs
      // afterChange and afterOperation *inside* the transaction and commits
      // afterwards, so a hook that emails would promise the sender a receipt
      // for a row that could still roll back. Awaited rather than left
      // floating, because a serverless invocation ends with the response.
      await deliverInquiryEmails(req, created)

      return json({ reference: created.reference, submittedAt: created.submittedAt })
    } catch (err) {
      req.payload.logger.error({ msg: 'Inquiry submission failed', err })
      return json({ error: 'Something went wrong on our end. Try again in a moment.' }, 500)
    }
  },
}

export const inquiryEndpoints: Endpoint[] = [submit]
