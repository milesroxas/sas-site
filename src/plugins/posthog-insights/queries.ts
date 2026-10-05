import type { Ranked, Totals, WindowDays } from './summary'

/**
 * The card's three questions, in HogQL. Every string is fixed but for the
 * window, which is one of `WINDOWS` and never request text. Each reads
 * production only: the same `environment` property the PostHog dashboards
 * filter on.
 */

/** The events that count as a lead: see the event registry in the posthog-analytics skill. */
export const LEAD_EVENTS = ['inquiry_submitted', 'form_submitted'] as const

const TOP = 5

const PRODUCTION = "properties.environment = 'production'"
const leads = `event in (${LEAD_EVENTS.map((event) => `'${event}'`).join(', ')})`
const within = (days: number) => `timestamp >= now() - interval ${days} day`
const before = (days: number) => `timestamp < now() - interval ${days} day`

/** One row: the window's visitors, pageviews and leads, then the same for the window before. */
export const totalsQuery = (days: WindowDays) => `
select
  uniqIf(person_id, event = '$pageview' and ${within(days)}),
  countIf(event = '$pageview' and ${within(days)}),
  countIf(${leads} and ${within(days)}),
  uniqIf(person_id, event = '$pageview' and ${before(days)}),
  countIf(event = '$pageview' and ${before(days)}),
  countIf(${leads} and ${before(days)})
from events
where ${within(days * 2)} and (event = '$pageview' or ${leads}) and ${PRODUCTION}`

export const pagesQuery = (days: WindowDays) => `
select properties.$pathname, count()
from events
where event = '$pageview' and ${within(days)} and ${PRODUCTION}
group by 1 order by 2 desc limit ${TOP}`

/** A click from one of the site's own pages is not a source, so the site's host is left out. */
export const sourcesQuery = (days: WindowDays) => `
select properties.$referring_domain, uniq(person_id)
from events
where event = '$pageview' and ${within(days)} and ${PRODUCTION}
  and properties.$referring_domain != properties.$host
group by 1 order by 2 desc limit ${TOP}`

const rowsOf = (results: unknown): unknown[][] =>
  Array.isArray(results) ? results.filter((row): row is unknown[] => Array.isArray(row)) : []

const count = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

/** The totals row as the two windows. An empty result reads as zeros. */
export function parseTotals(results: unknown): { current: Totals; previous: Totals } {
  const row = rowsOf(results)[0] ?? []
  const totals = (offset: number): Totals => ({
    visitors: count(row[offset]),
    pageviews: count(row[offset + 1]),
    leads: count(row[offset + 2]),
  })
  return { current: totals(0), previous: totals(3) }
}

/** PostHog's name for a pageview with no referrer. */
const DIRECT = '$direct'

/** Label and count rows. A row with no label is dropped, and `$direct` is spelled out. */
export const parseRanked = (results: unknown): Ranked[] =>
  rowsOf(results)
    .filter((row) => typeof row[0] === 'string' && row[0] !== '')
    .map((row) => ({
      label: row[0] === DIRECT ? 'Direct' : String(row[0]),
      count: count(row[1]),
    }))
