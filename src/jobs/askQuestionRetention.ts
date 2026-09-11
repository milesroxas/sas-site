import type { TaskConfig } from 'payload'
import { ASK_QUESTION_RETENTION_DAYS } from '@/features/ask/retention'

const DAY_MS = 86_400_000

/**
 * Deletes Ask questions older than the retention window, so the window the
 * visitor notice promises is enforced by the system rather than by policy.
 *
 * Scheduled for 05:00 in the server's timezone, which is UTC on Vercel. The
 * cron that already calls /api/payload-jobs/run daily at 06:00 UTC (vercel.json)
 * queues each run for the next 05:00 slot and executes the one that is due, so
 * no extra cron entry is needed. The first cleanup lands a day after deploy, and
 * a row can outlive the window by up to a day.
 */
export const askQuestionRetentionTask: TaskConfig = {
  slug: 'askQuestionRetention',
  retries: 2,
  schedule: [{ cron: '0 0 5 * * *', queue: 'default' }],
  outputSchema: [{ name: 'deleted', type: 'number' }],
  handler: async ({ req }) => {
    const cutoff = new Date(Date.now() - ASK_QUESTION_RETENTION_DAYS * DAY_MS).toISOString()
    const { docs, errors } = await req.payload.delete({
      collection: 'ask-questions',
      where: { createdAt: { less_than: cutoff } },
      overrideAccess: true,
      req,
    })
    if (errors.length > 0) {
      throw new Error(`Could not delete ${errors.length} expired Ask questions`)
    }
    return { output: { deleted: docs.length } }
  },
}
