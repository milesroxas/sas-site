import type { Endpoint, PayloadRequest } from 'payload'
import type { Newsletter, User } from '@/payload-types'
import { renderEmail } from '@/shared/email/lib/render'
import { buildNewsletterEmail } from '@/shared/email/newsletter/build'
import { newsletterFromAddress } from '@/shared/email/newsletter/from'
import { getServerSideURL } from '@/utilities/getURL'
import { sendUnlockedWhere } from './sendLock'

const json = (body: unknown, status = 200) => Response.json(body, { status })

function requireIdParam(req: PayloadRequest): string | null {
  const id = req.routeParams?.id
  return typeof id === 'string' && id.length > 0 ? id : null
}

/**
 * Shared entry check for the `:id` newsletter endpoints: admin humans only
 * (`req.user` is also set for MCP API keys, which have no inbox and no
 * business queuing a send), a usable id, and a newsletter that exists.
 * Returns the error response to hand back, or the document and the admin.
 */
async function loadNewsletterForAdmin(
  req: PayloadRequest,
  find: { depth: number; draft?: boolean },
): Promise<{ error: Response } | { id: string; newsletter: Newsletter; user: User }> {
  if (req.user?.collection !== 'users') return { error: json({ error: 'Unauthorized' }, 401) }
  const id = requireIdParam(req)
  if (!id) return { error: json({ error: 'Missing newsletter id' }, 400) }

  const newsletter = await req.payload
    .findByID({ collection: 'newsletters', id, ...find })
    .catch(() => null)
  if (!newsletter) return { error: json({ error: 'Newsletter not found' }, 404) }

  return { id, newsletter, user: req.user }
}

/**
 * Kick the queued job right away instead of waiting for the cron backstop. `after()` extends the
 * function lifetime past the response on Vercel; outside a Next request scope (CLI, tests) it
 * throws and the job simply runs inline, un-awaited.
 */
async function runQueuedJobs(req: PayloadRequest) {
  const run = () =>
    req.payload.jobs.run().catch((err) => {
      req.payload.logger.error({ msg: 'Newsletter send job run failed', err })
    })

  try {
    const { after } = await import('next/server')
    after(run)
  } catch (err) {
    req.payload.logger.warn({ msg: 'next/server after() unavailable; running jobs inline', err })
    void run()
  }
}

/**
 * POST /api/newsletters/:id/send-test — email the current draft to the logged-in admin.
 * Uses the draft (not the published version) so the team can iterate before publishing.
 */
const sendTest: Endpoint = {
  path: '/:id/send-test',
  method: 'post',
  handler: async (req) => {
    // The draft, not the published version, so the team can iterate before publishing.
    const loaded = await loadNewsletterForAdmin(req, { depth: 2, draft: true })
    if ('error' in loaded) return loaded.error
    const { newsletter, user } = loaded

    const baseUrl = getServerSideURL()
    const { html, text } = await renderEmail(
      buildNewsletterEmail({ newsletter, baseUrl, unsubscribeToken: 'test-send' }),
    )

    await req.payload.sendEmail({
      from: newsletterFromAddress(),
      to: user.email,
      subject: `[Test] ${newsletter.subject}`,
      html,
      text,
    })

    return json({ message: `Test sent to ${user.email}` })
  },
}

/**
 * POST /api/newsletters/:id/send — claim the newsletter for sending and queue the send job.
 *
 * The claim is a conditional bulk update (only rows not already sending/sent match), which closes
 * the double-click window; a genuinely simultaneous claim by two admins is still theoretically
 * possible but acceptable for an internal tool. Stale "sending" rows (no progress for
 * STALE_SEND_MS) can be reclaimed so a crashed job never bricks a newsletter.
 */
const send: Endpoint = {
  path: '/:id/send',
  method: 'post',
  handler: async (req) => {
    const loaded = await loadNewsletterForAdmin(req, { depth: 0 })
    if ('error' in loaded) return loaded.error
    const { id, newsletter: current } = loaded

    if (current._status !== 'published') {
      return json({ error: 'Publish the newsletter before sending.' }, 400)
    }
    if (!current.audiences?.length) {
      return json({ error: 'Pick at least one audience before sending.' }, 400)
    }
    if (!current.content?.length) {
      return json({ error: 'Add content before sending.' }, 400)
    }

    // Failed/stale claims keep sendCursor/sendProgress, so a retry resumes instead of
    // double-sending; fresh documents carry their 0 defaults.
    const claim = await req.payload.update({
      collection: 'newsletters',
      where: { and: [{ id: { equals: id } }, sendUnlockedWhere()] },
      data: { deliveryStatus: 'sending', sendError: null },
      depth: 0,
    })

    if (!claim.docs.length) {
      return json({ error: 'This newsletter is already sending or was already sent.' }, 409)
    }

    await req.payload.jobs.queue({
      task: 'newsletterSend',
      input: { newsletterId: id },
    })

    // The Vercel cron hitting /api/payload-jobs/run remains the backstop if this fails.
    await runQueuedJobs(req)

    return json({ message: 'Send started. Progress appears in the sidebar.' })
  },
}

export const newsletterEndpoints: Endpoint[] = [sendTest, send]
