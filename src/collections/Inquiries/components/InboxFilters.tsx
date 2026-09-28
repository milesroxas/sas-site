'use client'

import { useAuth } from '@payloadcms/ui'
import { type FilterLink, FilterLinks } from '@/components/admin/FilterLinks'
import { assignedToQuery, INQUIRY_QUERIES } from './queries'
import { useInquiryCounts } from './useInquiryCounts'

/**
 * The questions someone opens the inbox to answer (what is new, what is still
 * owed an answer, what is mine) as one row of links above the list, with
 * spam kept to its own view at the end. "All" means all but spam.
 */
export function InboxFilters() {
  const { user } = useAuth()
  const { counts } = useInquiryCounts()

  const filters: FilterLink[] = [
    { label: 'All', query: INQUIRY_QUERIES.inbox },
    { label: 'New', query: INQUIRY_QUERIES.new, count: counts.new },
    { label: 'Open', query: INQUIRY_QUERIES.open, count: counts.open },
    ...(user?.id
      ? [{ label: 'Assigned to me', query: assignedToQuery(user.id), count: counts.mine }]
      : []),
    { label: 'Spam', query: INQUIRY_QUERIES.spam, count: counts.spam },
  ]

  return <FilterLinks filters={filters} label="Inbox filters" />
}
