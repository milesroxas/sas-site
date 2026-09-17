import type { PayloadRequest } from 'payload'

/** Rendering has its own function and memory budget, separate from Payload and page requests. */
export async function kickStudioWorker(req: PayloadRequest) {
  if (!process.env.VERCEL_URL) return
  const secret = process.env.STREAK_WORKER_SECRET || process.env.CRON_SECRET
  if (!secret) return
  const pending = await req.payload.count({
    collection: 'streak-renders',
    where: { state: { equals: 'queued' } },
    req,
  })
  if (!pending.totalDocs) return
  const run = async () => {
    const headers: Record<string, string> = { Authorization: `Bearer ${secret}` }
    if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET)
      headers['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
    const response = await fetch(`https://${process.env.VERCEL_URL}/api/streak-render/run`, {
      method: 'POST',
      headers,
    })
    if (!response.ok) req.payload.logger.error(`Streak worker kick failed: ${response.status}`)
  }
  const { after } = await import('next/server')
  after(run)
}
