import type { Endpoint } from 'payload'
import { authenticated } from '@/access/authenticated'
import { cachedSummary } from './cache'
import { insightsSettings } from './client'
import { SUMMARY_PATH, windowOf } from './summary'

/**
 * GET /api/posthog-insights/summary?days=30: the dashboard widget's numbers
 * for a window it did not render with. Team only: an MCP API key is a
 * `req.user` too, and gets a 401. A 404 means the key is unset; a 502 means
 * PostHog did not answer.
 */
export const summaryEndpoint: Endpoint = {
  path: SUMMARY_PATH,
  method: 'get',
  handler: async (req) => {
    if (!authenticated({ req }))
      return Response.json({ error: 'Team sign-in required.' }, { status: 401 })
    const settings = insightsSettings()
    if (!settings) return Response.json({ error: 'PostHog insights are off.' }, { status: 404 })
    try {
      const summary = await cachedSummary(settings, windowOf(req.query?.days))
      return Response.json(summary, { headers: { 'Cache-Control': 'private, no-store' } })
    } catch (error) {
      req.payload.logger.error({ err: error }, 'PostHog insights: the summary query failed')
      return Response.json({ error: 'PostHog did not answer.' }, { status: 502 })
    }
  },
}
