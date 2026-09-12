/**
 * The list queries the Ask inbox is read through, shared by the filter row
 * and the dashboard card so a count and the list it links to always agree.
 */
export const ASK_QUERIES = {
  new: 'where[status][equals]=new',
  gaps: 'where[outcome][equals]=no_sources',
  newGaps: 'where[status][equals]=new&where[outcome][equals]=no_sources',
  thumbsDown: 'where[rating][equals]=down',
  handedOff: 'where[handoff][exists]=true',
} as const

/** Rows from the last `days` days. */
export const sinceQuery = (days: number) =>
  `where[createdAt][greater_than]=${encodeURIComponent(new Date(Date.now() - days * 86_400_000).toISOString())}`
