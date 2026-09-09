/**
 * "Sep 9, 3:12 PM": the moment a snapshot was taken, for the "last refreshed"
 * and "last rebuilt" notes in the Site Info › Ask panels. Date and time both,
 * because a snapshot can be days old and a bare time would read as today.
 */
export const formatWhen = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
