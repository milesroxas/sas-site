/**
 * The shape the dashboard card reads, and the arithmetic on it. No server
 * import lives here: the card and the endpoint both read this file.
 */

/** The windows the card offers, in days. The endpoint accepts nothing else. */
export const WINDOWS = [7, 30] as const
export type WindowDays = (typeof WINDOWS)[number]

export const DEFAULT_WINDOW: WindowDays = 7

/** A query-string value as a window, or the default when it is not one. */
export const windowOf = (value: unknown): WindowDays =>
  WINDOWS.find((days) => String(days) === String(value)) ?? DEFAULT_WINDOW

export type Totals = { visitors: number; pageviews: number; leads: number }

export type Ranked = { label: string; count: number }

export type InsightsSummary = {
  days: WindowDays
  /** The window itself, and the same number of days before it. */
  current: Totals
  previous: Totals
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
