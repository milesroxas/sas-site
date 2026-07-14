import type { Endpoint, PayloadRequest } from 'payload'
import { ValidationError } from 'payload'
import { Webhook } from 'svix'
import type { Subscriber } from '@/payload-types'
import { sendNewsletterConfirmEmail } from '@/shared/email'
import { isValidEmailAddress, normalizeEmailAddress } from '@/utilities/emailAddress'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Public newsletter endpoints (mounted under /api by the Payload root config).
 *
 * Design notes for the security-minded reader:
 * - Subscribe always answers with the same success message for any state of a *given email* so it
 *   can't be used to probe which emails exist (enumeration), and a honeypot field silently
 *   swallows naive bots. Configuration problems (no public audience) are a real 4xx — hiding
 *   those would silently drop legitimate signups.
 * - New signups are double opt-in: nothing receives newsletters until the confirm link (emailed,
 *   token-authenticated) is clicked. Confirm-email re-sends are throttled per subscriber
 *   (`confirmSentAt`) so the endpoint can't be used to flood someone's inbox.
 * - Suppressed addresses (bounced/complained) can never re-enter via subscribe OR confirm —
 *   only a deliberate admin edit can lift a suppression.
 * - Unsubscribe is a POST (RFC 8058 one-click compatible) so link-prefetching mail scanners
 *   never unsubscribe anyone by accident; the GET surface is a normal page with a button.
 */

/** Minimum time between confirm-email re-sends for the same subscriber. */
const CONFIRM_RESEND_COOLDOWN_MS = 10 * 60 * 1000

const SUBSCRIBE_OK = {
  message: 'Almost there — check your inbox and confirm your subscription.',
}

const json = (body: unknown, status = 200) => Response.json(body, { status })

const confirmUrlFor = (token: string) =>
  `${getServerSideURL()}/api/newsletter/confirm?token=${encodeURIComponent(token)}`

const isSuppressed = (status: Subscriber['status']) =>
  status === 'bounced' || status === 'complained'

function queryParam(req: PayloadRequest, name: string): string | null {
  const value = req.query?.[name]
  return typeof value === 'string' && value.length > 0 ? value : null
}

/** Send the double-opt-in email and stamp the throttle clock. */
async function deliverConfirmEmail(req: PayloadRequest, subscriber: Subscriber) {
  if (!subscriber.token) return
  await sendNewsletterConfirmEmail({
    payload: req.payload,
    to: subscriber.email,
    confirmUrl: confirmUrlFor(subscriber.token),
  })
  await req.payload.update({
    collection: 'subscribers',
    id: subscriber.id,
    data: { confirmSentAt: new Date().toISOString() },
  })
}

const subscribe: Endpoint = {
  path: '/newsletter/subscribe',
  method: 'post',
  handler: async (req) => {
    try {
      const body = (await req.json?.().catch(() => null)) as Record<string, unknown> | null

      // Honeypot: humans never see the "company" field; bots that fill it get a fake success.
      if (typeof body?.company === 'string' && body.company.length > 0) {
        return json(SUBSCRIBE_OK)
      }

      const email = typeof body?.email === 'string' ? normalizeEmailAddress(body.email) : ''
      if (!isValidEmailAddress(email)) {
        return json({ error: 'Enter a valid email address.' }, 400)
      }
      const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 200) : undefined
      const audienceSlug = typeof body?.audience === 'string' ? body.audience : undefined

      // Only audiences explicitly opened for public signup can be joined from here — the form
      // can never add someone to a curated list like "clients".
      const [audienceResult, existingResult] = await Promise.all([
        req.payload.find({
          collection: 'audiences',
          where: {
            allowPublicSignup: { equals: true },
            ...(audienceSlug ? { slug: { equals: audienceSlug } } : {}),
          },
          limit: 1,
          sort: 'createdAt',
          depth: 0,
        }),
        req.payload.find({
          collection: 'subscribers',
          where: { email: { equals: email } },
          limit: 1,
          depth: 0,
        }),
      ])

      const audience = audienceResult.docs[0]
      if (!audience) {
        // A misconfiguration (form points at an audience that closed public signup) must be
        // loud — a fake success here would silently drop every signup on the page.
        req.payload.logger.warn(
          `Newsletter signup rejected: no public-signup audience${audienceSlug ? ` matching "${audienceSlug}"` : ''}`,
        )
        return json({ error: 'Newsletter signups are currently closed.' }, 400)
      }

      const existing = existingResult.docs[0]

      if (!existing) {
        let created: Subscriber
        try {
          created = await req.payload.create({
            collection: 'subscribers',
            data: {
              email,
              name,
              status: 'pending',
              source: 'site',
              audiences: [audience.id],
            },
          })
        } catch (err) {
          // A unique-index violation means we lost a race with a concurrent signup for the same
          // email — the winner got the confirm email, so this request is done. Anything else
          // (DB outage, relationship failure) must surface as a 500, not a fake success.
          if (err instanceof ValidationError || /unique|duplicate/i.test(String(err))) {
            return json(SUBSCRIBE_OK)
          }
          throw err
        }
        await deliverConfirmEmail(req, created)
        return json(SUBSCRIBE_OK)
      }

      // Suppressed addresses stay suppressed — resubscribing a bounced/complained address
      // damages sender reputation. Same generic response, no oracle.
      if (isSuppressed(existing.status)) {
        return json(SUBSCRIBE_OK)
      }

      // Already-subscribed emails get nothing — and are NOT silently enrolled into further
      // audiences: consent was given for what they confirmed, and this endpoint is unauthenticated
      // (anyone knowing an email could otherwise retarget it).
      if (existing.status === 'subscribed') {
        return json(SUBSCRIBE_OK)
      }

      // Pending / re-subscribing (previously unsubscribed) rows: merge the audience now — the
      // confirm click that follows is the consent for the merged set.
      const audienceIds = (existing.audiences ?? []).map((a) => (typeof a === 'object' ? a.id : a))
      if (!audienceIds.includes(audience.id)) {
        await req.payload.update({
          collection: 'subscribers',
          id: existing.id,
          data: { audiences: [...audienceIds, audience.id] },
        })
      }

      const canResendConfirm =
        !existing.confirmSentAt ||
        Date.now() - new Date(existing.confirmSentAt).getTime() > CONFIRM_RESEND_COOLDOWN_MS
      if (canResendConfirm) {
        await deliverConfirmEmail(req, existing)
      }

      return json(SUBSCRIBE_OK)
    } catch (err) {
      req.payload.logger.error({ msg: 'Newsletter subscribe failed', err })
      return json({ error: 'Something went wrong. Please try again later.' }, 500)
    }
  },
}

const confirm: Endpoint = {
  path: '/newsletter/confirm',
  method: 'get',
  handler: async (req) => {
    const base = getServerSideURL()
    const token = queryParam(req, 'token')

    try {
      if (token) {
        const result = await req.payload.find({
          collection: 'subscribers',
          where: { token: { equals: token } },
          limit: 1,
          depth: 0,
        })
        const subscriber = result.docs[0]
        // Suppressed addresses must not be resurrected by an old confirm link (tokens are
        // long-lived and this is a GET that mail scanners may prefetch).
        if (subscriber && !isSuppressed(subscriber.status)) {
          if (subscriber.status !== 'subscribed') {
            await req.payload.update({
              collection: 'subscribers',
              id: subscriber.id,
              data: { status: 'subscribed' },
            })
          }
          return Response.redirect(`${base}/newsletter/confirmed`, 302)
        }
      }
    } catch (err) {
      req.payload.logger.error({ msg: 'Newsletter confirm failed', err })
    }

    return Response.redirect(`${base}/newsletter/confirmed?state=invalid`, 302)
  },
}

const unsubscribe: Endpoint = {
  path: '/newsletter/unsubscribe',
  method: 'post',
  handler: async (req) => {
    const token = queryParam(req, 'token')
    // Unknown token still gets a 200: the endpoint is idempotent and reveals nothing about
    // token validity.
    const ok = json({ message: 'You have been unsubscribed.' })
    if (!token) return ok

    try {
      const result = await req.payload.find({
        collection: 'subscribers',
        where: { token: { equals: token } },
        limit: 1,
        depth: 0,
      })
      const subscriber = result.docs[0]
      if (subscriber && subscriber.status !== 'unsubscribed') {
        await req.payload.update({
          collection: 'subscribers',
          id: subscriber.id,
          data: { status: 'unsubscribed' },
        })
      }
      return ok
    } catch (err) {
      // A 500 makes RFC 8058 one-click callers retry — claiming success while the row is
      // still subscribed would guarantee a future spam complaint.
      req.payload.logger.error({ msg: 'Newsletter unsubscribe failed', err })
      return json({ error: 'Unsubscribe failed. Please try again.' }, 500)
    }
  },
}

interface ResendWebhookEvent {
  type?: string
  data?: {
    to?: string[]
    bounce?: { type?: string }
  }
}

/**
 * Resend delivery webhook: suppresses hard-bounced and complained addresses so they are never
 * mailed again. Signature-verified via Svix; without a valid signature nothing is processed.
 */
const resendWebhook: Endpoint = {
  path: '/newsletter/webhooks/resend',
  method: 'post',
  handler: async (req) => {
    const secret = process.env.RESEND_WEBHOOK_SECRET
    if (!secret) {
      req.payload.logger.error('RESEND_WEBHOOK_SECRET is not set; rejecting Resend webhook')
      return json({ error: 'Webhook not configured' }, 500)
    }

    let event: ResendWebhookEvent
    try {
      const body = (await req.text?.()) ?? ''
      event = new Webhook(secret).verify(body, {
        'svix-id': req.headers.get('svix-id') ?? '',
        'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
        'svix-signature': req.headers.get('svix-signature') ?? '',
      }) as ResendWebhookEvent
    } catch {
      return json({ error: 'Invalid signature' }, 400)
    }

    try {
      const suppressAs =
        event.type === 'email.complained'
          ? 'complained'
          : event.type === 'email.bounced' && event.data?.bounce?.type !== 'Transient'
            ? 'bounced'
            : null

      if (suppressAs) {
        const emails = (event.data?.to ?? [])
          .filter((to): to is string => typeof to === 'string')
          .map(normalizeEmailAddress)

        if (emails.length) {
          await req.payload.update({
            collection: 'subscribers',
            where: {
              email: { in: emails },
              status: { in: ['pending', 'subscribed'] },
            },
            data: { status: suppressAs },
          })
        }
      }

      return json({ received: true })
    } catch (err) {
      req.payload.logger.error({ msg: 'Resend webhook processing failed', err })
      // Non-2xx makes Resend retry with backoff — correct for a transient DB failure.
      return json({ error: 'Processing failed' }, 500)
    }
  },
}

export const newsletterPublicEndpoints: Endpoint[] = [
  subscribe,
  confirm,
  unsubscribe,
  resendWebhook,
]
