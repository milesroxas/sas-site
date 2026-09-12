'use client'

import { useAuth } from '@payloadcms/ui'
import { type FilterLink, FilterLinks } from '@/components/admin/FilterLinks'
import { whereIn } from '@/components/admin/rest'
import { INQUIRY_OPEN_STATUSES } from '@/shared/content/inquiry'
import { useInquiryCounts } from './useInquiryCounts'

const OPEN_QUERY = whereIn('status', INQUIRY_OPEN_STATUSES)

/**
 * The three questions someone opens the inbox to answer — what is new, what is
 * still owed an answer, and what is mine — as one row of links above the list.
 */
export function InboxFilters() {
  const { user } = useAuth()
  const { counts } = useInquiryCounts()

  const filters: FilterLink[] = [
    { label: 'All', query: '' },
    { label: 'New', query: 'where[status][equals]=new', count: counts.new },
    { label: 'Open', query: OPEN_QUERY, count: counts.open },
    ...(user?.id
      ? [
          {
            label: 'Assigned to me',
            query: `${OPEN_QUERY}&where[assignedTo][equals]=${user.id}`,
            count: counts.mine,
          },
        ]
      : []),
  ]

  return <FilterLinks filters={filters} label="Inbox filters" />
}
