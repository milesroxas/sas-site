import type { Payload, TaskConfig } from 'payload'
import { type CreateBatchOptions, Resend } from 'resend'
import { renderEmail } from '@/shared/email/lib/render'
import {
  buildNewsletterEmail,
  newsletterOneClickUnsubscribeUrl,
  UNSUBSCRIBE_TOKEN_PLACEHOLDER,
} from '@/shared/email/newsletter/build'
import { newsletterFromAddress } from '@/shared/email/newsletter/from'
import { getServerSideURL } from '@/utilities/getURL'

/** Resend's batch endpoint accepts at most 100 emails per call. */
const BATCH_SIZE = 100

/** Resend's default rate limit is 2 requests/second — pause between batch calls. */
const BATCH_PAUSE_MS = 600

/** Keyset page size when walking the subscriber table. */
const PAGE_SIZE = 500

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface Recipient {
  id: number
  email: string
  token: string
}

/**
 * Next keyset page of deliverable subscribers: subscribed members of the audiences with
 * `id > cursor`, in id order. No offsets and no COUNT queries — one index-range scan per page —
 * and because ids are stable, a resumed send can never skip or repeat someone merely because
 * the subscriber set changed between attempts.
 */
async function nextRecipientPage(
  payload: Payload,
  audienceIds: number[],
  cursor: number,
): Promise<Recipient[]> {
  const result = await payload.find({
    collection: 'subscribers',
    where: {
      status: { equals: 'subscribed' },
      audiences: { in: audienceIds },
      id: { greater_than: cursor },
    },
    select: { email: true, token: true },
    sort: 'id',
    limit: PAGE_SIZE,
    pagination: false,
    depth: 0,
  })

  const recipients: Recipient[] = []
  for (const doc of result.docs.slice(0, PAGE_SIZE)) {
    if (!doc.token) {
      // Without a token there is no working unsubscribe link — never send to such a row.
      payload.logger.warn(`Subscriber ${doc.email} has no token; skipped from newsletter send`)
      continue
    }
    recipients.push({ id: doc.id, email: doc.email, token: doc.token })
  }
  return recipients
}

/**
 * One Resend batch call with a stable idempotency key, so a batch that succeeded before a crash
 * is a no-op when replayed. Transient errors retry once WITH the same key (if Resend accepted
 * the original, the key dedupes); only an idempotency conflict — same key, changed payload,
 * which happens when the recipient set shifted between attempts — retries keyless.
 */
async function sendBatch(resend: Resend, batch: CreateBatchOptions, idempotencyKey: string) {
  let { error } = await resend.batch.send(batch, { idempotencyKey })
  if (error) {
    await sleep(1000)
    const isKeyConflict = /idempoten/i.test(`${error.name ?? ''} ${error.message ?? ''}`)
    ;({ error } = await resend.batch.send(batch, isKeyConflict ? undefined : { idempotencyKey }))
  }
  if (error) {
    throw new Error(`Resend batch failed: ${error.message}`)
  }
}

/**
 * Delivers a claimed newsletter via Resend's batch API.
 *
 * The email renders ONCE with a token placeholder; each recipient's token is substituted by
 * joining pre-split parts (no per-recipient re-render or re-scan). After every batch the job
 * persists `sendCursor` (highest subscriber id delivered) and `sendProgress` (count) via
 * `payload.db.updateOne` — including an explicit `updatedAt`, which is the heartbeat the
 * stale-send reclaim in `sendLock.ts` relies on; the adapter does not bump it otherwise.
 * Retries are 0 by design: failures mark the doc "failed" (via `payload.update`, so the admin
 * form shows the state) and a human retries from the admin, resuming at the cursor.
 */
export const newsletterSendTask: TaskConfig = {
  slug: 'newsletterSend',
  retries: 0,
  inputSchema: [{ name: 'newsletterId', type: 'text', required: true }],
  outputSchema: [{ name: 'sent', type: 'number' }],
  handler: async ({ input, req }) => {
    const { payload } = req
    const newsletterId = (input as { newsletterId: string }).newsletterId

    const newsletter = await payload.findByID({
      collection: 'newsletters',
      id: newsletterId,
      depth: 2,
    })

    // Only the send endpoint moves a newsletter into "sending"; anything else means this job is
    // stale (already finished, or reclaimed by a newer send) and must not send mail.
    if (newsletter.deliveryStatus !== 'sending') {
      return { output: { sent: 0 } }
    }

    // Full update (not db.updateOne) so a version is written and the admin form shows the
    // failure and its message instead of a stale "sending".
    const fail = async (message: string) => {
      await payload.update({
        collection: 'newsletters',
        id: newsletterId,
        data: { deliveryStatus: 'failed', sendError: message.slice(0, 500) },
        depth: 0,
      })
    }

    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not set')
      }

      const audienceIds = (newsletter.audiences ?? []).map((audience) =>
        typeof audience === 'object' ? audience.id : audience,
      )

      const baseUrl = getServerSideURL()
      const from = newsletterFromAddress()
      const { html, text } = await renderEmail(
        buildNewsletterEmail({
          newsletter,
          baseUrl,
          unsubscribeToken: UNSUBSCRIBE_TOKEN_PLACEHOLDER,
        }),
      )
      const htmlParts = html.split(UNSUBSCRIBE_TOKEN_PLACEHOLDER)
      const textParts = text.split(UNSUBSCRIBE_TOKEN_PLACEHOLDER)

      const resend = new Resend(process.env.RESEND_API_KEY)
      let cursor = newsletter.sendCursor ?? 0
      let sent = newsletter.sendProgress ?? 0
      const startedFresh = cursor === 0

      while (true) {
        const page = await nextRecipientPage(payload, audienceIds, cursor)
        if (page.length === 0) break

        for (let offset = 0; offset < page.length; offset += BATCH_SIZE) {
          const recipients = page.slice(offset, offset + BATCH_SIZE)
          const batch = recipients.map(({ email, token }) => {
            const encodedToken = encodeURIComponent(token)
            return {
              from,
              to: [email],
              subject: newsletter.subject,
              html: htmlParts.join(encodedToken),
              text: textParts.join(encodedToken),
              headers: {
                'List-Unsubscribe': `<${newsletterOneClickUnsubscribeUrl(baseUrl, token)}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              },
            }
          })

          // Keyed by position: a resumed send replays the same key for the same cursor.
          await sendBatch(resend, batch, `newsletter/${newsletterId}/${cursor}`)

          cursor = recipients[recipients.length - 1].id
          sent += recipients.length
          await payload.db.updateOne({
            collection: 'newsletters',
            id: newsletterId,
            data: {
              sendCursor: cursor,
              sendProgress: sent,
              // Heartbeat for the stale-send reclaim — see sendLock.ts.
              updatedAt: new Date().toISOString(),
            },
          })

          await sleep(BATCH_PAUSE_MS)
        }

        if (page.length < PAGE_SIZE) break
      }

      if (sent === 0 && startedFresh) {
        await fail('No subscribed recipients in the selected audiences.')
        return { output: { sent: 0 } }
      }

      await payload.update({
        collection: 'newsletters',
        id: newsletterId,
        data: {
          deliveryStatus: 'sent',
          sentAt: new Date().toISOString(),
          recipientCount: sent,
          sendError: null,
        },
        depth: 0,
      })

      return { output: { sent } }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      payload.logger.error({ msg: `Newsletter ${newsletterId} send failed`, err })
      await fail(message)
      throw err
    }
  },
}
