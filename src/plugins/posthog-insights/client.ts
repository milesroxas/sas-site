import { pagesQuery, parseRanked, parseTotals, sourcesQuery, totalsQuery } from './queries'
import type { InsightsSummary, WindowDays } from './summary'

/**
 * PostHog's query API, read with a personal API key that holds the query read
 * scope and nothing else. Server only: the key never reaches the browser, and
 * what leaves this module is counts.
 */

const DEFAULT_PROJECT_ID = '512227'
const DEFAULT_INGEST_HOST = 'https://us.i.posthog.com'

/** PostHog answers a cold query in a second or two. Past this the card gives up. */
const TIMEOUT_MS = 8_000

export type InsightsSettings = { key: string; projectId: string; appHost: string }

/** What the plugin needs from the environment, or null when the key is unset and the feature is off. */
export function insightsSettings(env: NodeJS.ProcessEnv = process.env): InsightsSettings | null {
  const key = env.POSTHOG_PERSONAL_API_KEY
  if (!key) return null
  return {
    key,
    projectId: env.POSTHOG_PROJECT_ID || DEFAULT_PROJECT_ID,
    // The private API lives on the app host, not the ingestion host the SDKs
    // use: us.i.posthog.com captures, us.posthog.com answers queries.
    appHost: (env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_INGEST_HOST).replace(
      '.i.posthog.com',
      '.posthog.com',
    ),
  }
}

/** One HogQL query, internal users filtered out. Throws on anything but an answer. */
async function runQuery(
  settings: InsightsSettings,
  query: string,
  fetcher: typeof fetch,
): Promise<unknown> {
  const res = await fetcher(`${settings.appHost}/api/projects/${settings.projectId}/query/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${settings.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: { kind: 'HogQLQuery', query, filters: { filterTestAccounts: true } },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`PostHog query failed with ${res.status}.`)
  const body = (await res.json()) as { results?: unknown }
  return body.results
}

/** The card's numbers for one window. Throws when PostHog does, so a failure is never cached. */
export async function loadSummary(
  settings: InsightsSettings,
  days: WindowDays,
  fetcher: typeof fetch = fetch,
): Promise<InsightsSummary> {
  const [totals, pages, sources] = await Promise.all([
    runQuery(settings, totalsQuery(days), fetcher),
    runQuery(settings, pagesQuery(days), fetcher),
    runQuery(settings, sourcesQuery(days), fetcher),
  ])
  return {
    days,
    ...parseTotals(totals),
    pages: parseRanked(pages),
    sources: parseRanked(sources),
    url: `${settings.appHost}/project/${settings.projectId}/web`,
  }
}
