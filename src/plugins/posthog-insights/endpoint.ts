import { unstable_cache } from 'next/cache.js'
import type { Endpoint } from 'payload'
import { authenticated } from '@/access/authenticated'
import { type InsightsSettings, insightsSettings, loadSummary } from './client'
import { type WindowDays, windowOf } from './summary'

export const SUMMARY_PATH = '/posthog-insights/summary'

/**
 * Every open of the dashboard would otherwise spend three PostHog queries.
 * These numbers move slowly, so one answer per window serves the whole team
 * for a quarter of an hour.
 */
const REVALIDATE_SECONDS = 900

const cachedSummary = unstable_cache(
  (settings: InsightsSettings, days: WindowDays) => loadSummary(settings, days),
  ['posthog-insights-summary'],
  { revalidate: REVALIDATE_SECONDS },
)

/**
 * GET /api/posthog-insights/summary?days=7: the dashboard card's numbers.
 * Team only: an MCP API key is a `req.user` too, and gets a 401. A 404 means
 * the key is unset and the card should stay away; a 502 means PostHog did not
 * answer.
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
