/**
 * A published date as editorial furniture reads it: `09 September 2026`.
 *
 * Fixed to UTC so a date-only value never slides a day across timezones and
 * the server and the client render the same string.
 */
const publishedDateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
})

export const formatPublishedDate = (timestamp: string | null | undefined): string | null => {
  if (!timestamp) return null
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : publishedDateFormat.format(date)
}
