import { whereIn } from '@/components/admin/rest'
import { INQUIRY_OPEN_STATUSES } from '@/shared/content/inquiry'

const OPEN = whereIn('status', INQUIRY_OPEN_STATUSES)

/**
 * The list queries the inbox is read through, shared by the filter row, the
 * counts, the dashboard card, the nav badge and the default-view redirect, so
 * a count and the list it links to always agree.
 */
export const INQUIRY_QUERIES = {
  /** Everything but spam: the list as it opens. */
  inbox: 'where[status][not_equals]=spam',
  new: 'where[status][equals]=new',
  open: OPEN,
  spam: 'where[status][equals]=spam',
} as const

/** Open and assigned to this person. */
export const assignedToQuery = (userId: number | string) =>
  `${OPEN}&where[assignedTo][equals]=${userId}`
