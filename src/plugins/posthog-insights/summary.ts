/**
 * The shape the dashboard widget reads, and the arithmetic on it. No server
 * import lives here: the widget and the endpoint both read this file.
 */

/** The widget's endpoint, under the API route: it fetches a window it did not render with. */
export const SUMMARY_PATH = '/posthog-insights/summary'

/** The windows the widget offers, in days. The endpoint accepts nothing else. */
export const WINDOWS = [7, 30] as const
export type WindowDays = (typeof WINDOWS)[number]

export const DEFAULT_WINDOW: WindowDays = 7

/** A query-string value as a window, or the default when it is not one. */
export const windowOf = (value: unknown): WindowDays =>
  WINDOWS.find((days) => String(days) === String(value)) ?? DEFAULT_WINDOW

export type Totals = { visitors: number; pageviews: number; leads: number }

export type Ranked = { label: string; count: number }

/**
 * One calendar day of the window beside the same position in the window
 * before, day 1 beside day 1. The chart averages the earlier days into one
 * reference line.
 */
export type TrendPoint = {
  /** `YYYY-MM-DD` in the PostHog project's time zone. The last point is today, so far. */
  date: string
  previousDate: string
  current: Totals
  previous: Totals
}

export type InsightsSummary = {
  days: WindowDays
  /** The window itself, and the same number of days before it. */
  current: Totals
  previous: Totals
  /** Day by day, oldest first, `days` points long. */
  trend: TrendPoint[]
  /** Most viewed paths, by pageviews. */
  pages: Ranked[]
  /** Referring domains, by visitors. */
  sources: Ranked[]
  /** Where the numbers can be read in full, in PostHog. */
  url: string
}

/** Percent change against the window before. Null when there is nothing to compare with. */
export const change = (now: number, before: number): number | null =>
  before === 0 ? null : Math.round(((now - before) / before) * 100)

/** Leads per visitor, as a fraction. Null with no visitors. */
export const leadRate = ({ leads, visitors }: Totals): number | null =>
  visitors === 0 ? null : leads / visitors

/** Every count the widget charts. Tiles, chart, tooltip and table all read this list. */
export type Metric = {
  key: 'visitors' | 'pageviews' | 'leads'
  label: string
  /** The count with its noun, as the tooltip reads it: "1 lead", "6 leads". */
  counted: (value: number) => string
  /** The day's or window's value. */
  value: (totals: Totals) => number
  /** How the value reads on a tile, an axis or in the tooltip. */
  format: (value: number) => string
  /** The change against the window before, signed for direction, and as it reads. */
  delta: (current: Totals, previous: Totals) => { value: number; text: string }
}

const count = new Intl.NumberFormat('en-US')
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

/** 1,284 below ten thousand, 12.9K above: a tile never has to wrap. */
export const formatCount = (value: number) =>
  Math.abs(value) < 10_000 ? count.format(value) : compact.format(value)

export const formatRate = (fraction: number) =>
  `${(fraction * 100).toFixed(fraction > 0 && fraction < 0.1 ? 1 : 0)}%`

const signed = (value: number) => `${value > 0 ? '+' : ''}${value}`

const countMetric = (key: Metric['key'], label: string, one: string, many: string): Metric => ({
  key,
  label,
  counted: (value) => `${formatCount(value)} ${value === 1 ? one : many}`,
  value: (totals) => totals[key],
  format: formatCount,
  delta: (current, previous) => {
    const now = current[key]
    const before = previous[key]
    // A percent of nothing is no number, but going from none to some still reads.
    if (before === 0) return now === 0 ? { value: 0, text: '0%' } : { value: 1, text: 'from 0' }
    const value = change(now, before) ?? 0
    return { value, text: `${signed(value)}%` }
  },
})

/**
 * The three counts, each a tab that charts its days. Leads per visitor is
 * not a tab: day by day, one lead from two visitors swings it to 50% and
 * back. It reads on the Leads tile instead (`leadRate`).
 */
export const METRICS: readonly Metric[] = [
  countMetric('visitors', 'Visitors', 'visitor', 'visitors'),
  countMetric('pageviews', 'Pageviews', 'pageview', 'pageviews'),
  countMetric('leads', 'Leads', 'lead', 'leads'),
]

export type MetricKey = Metric['key']

export const metricOf = (key: MetricKey): Metric =>
  METRICS.find((metric) => metric.key === key) ?? (METRICS[0] as Metric)
