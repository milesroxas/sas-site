import type { Ranked, Totals, TrendPoint, WindowDays } from './summary'

/**
 * The widget's four questions, in HogQL. Every string is fixed but for the
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

/**
 * One row per calendar day with traffic, over both windows: how many days ago
 * it was (0 is today), that day's visitors, pageviews and leads, and today's
 * date. Days run in the project's time zone, as PostHog's own charts do.
 */
export const dailyQuery = (days: WindowDays) => `
select
  dateDiff('day', toDate(timestamp), toDate(now())),
  uniqIf(person_id, event = '$pageview'),
  countIf(event = '$pageview'),
  countIf(${leads}),
  toString(toDate(now()))
from events
where timestamp >= toStartOfDay(now()) - interval ${days * 2 - 1} day
  and (event = '$pageview' or ${leads}) and ${PRODUCTION}
group by 1`

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

const ZERO: Totals = { visitors: 0, pageviews: 0, leads: 0 }

const DAY_MS = 86_400_000

/** `YYYY-MM-DD` minus whole days, in calendar arithmetic, with no time zone to slip on. */
const daysBefore = (date: string, offset: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) - offset * DAY_MS).toISOString().slice(0, 10)

/**
 * The daily rows as `days` points, oldest first, each beside the same day of
 * the window before. A day with no row reads as zeros. `fallbackToday` dates
 * the points when PostHog returned no rows to read today from.
 */
export function parseDaily(
  results: unknown,
  days: WindowDays,
  fallbackToday: string,
): TrendPoint[] {
  const byOffset = new Map<number, Totals>()
  let today = fallbackToday
  for (const row of rowsOf(results)) {
    const offset = count(row[0])
    byOffset.set(offset, {
      visitors: count(row[1]),
      pageviews: count(row[2]),
      leads: count(row[3]),
    })
    if (typeof row[4] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(row[4])) today = row[4]
  }
  return Array.from({ length: days }, (_, index) => {
    const offset = days - 1 - index
    return {
      date: daysBefore(today, offset),
      previousDate: daysBefore(today, offset + days),
      current: byOffset.get(offset) ?? ZERO,
      previous: byOffset.get(offset + days) ?? ZERO,
    }
  })
}
