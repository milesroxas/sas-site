import { unstable_cache } from 'next/cache.js'
import { type InsightsSettings, loadSummary } from './client'
import type { WindowDays } from './summary'

/**
 * Every open of the dashboard would otherwise spend four PostHog queries.
 * These numbers move slowly, so one answer per window serves the whole team
 * for a quarter of an hour, whether the widget's first render or the endpoint
 * asked for it.
 */
const REVALIDATE_SECONDS = 900

export const cachedSummary = unstable_cache(
  (settings: InsightsSettings, days: WindowDays) => loadSummary(settings, days),
  // Bump the version whenever `InsightsSummary` changes shape: the data cache
  // outlives a deploy, and a widget must never read an answer it cannot parse.
  ['posthog-insights-summary', 'v2'],
  { revalidate: REVALIDATE_SECONDS },
)
