export const formatDateTime = (timestamp: string): string => {
  const now = new Date()
  let date = now
  if (timestamp) date = new Date(timestamp)
  const months = date.getMonth()
  const days = date.getDate()
  // const hours = date.getHours();
  // const minutes = date.getMinutes();
  // const seconds = date.getSeconds();

  const MM = months + 1 < 10 ? `0${months + 1}` : months + 1
  const DD = days < 10 ? `0${days}` : days
  const YYYY = date.getFullYear()
  // const AMPM = hours < 12 ? 'AM' : 'PM';
  // const HH = hours > 12 ? hours - 12 : hours;
  // const MinMin = (minutes < 10) ? `0${minutes}` : minutes;
  // const SS = (seconds < 10) ? `0${seconds}` : seconds;

  return `${MM}/${DD}/${YYYY}`
}

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
