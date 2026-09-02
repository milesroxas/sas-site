'use client'

import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { INQUIRY_OPEN_STATUSES } from '@/shared/content/inquiry'
import { useInquiryCounts } from './useInquiryCounts'

const OPEN_QUERY = INQUIRY_OPEN_STATUSES.map(
  (status, index) => `where[status][in][${index}]=${status}`,
).join('&')

/**
 * The three questions someone opens the inbox to answer — what is new, what is
 * still owed an answer, and what is mine — as one row of links above the list.
 *
 * The list view already has a full filter builder; this is the shortcut past
 * it, so triage is one click rather than four.
 */
export function InboxFilters() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { counts } = useInquiryCounts()

  const current = searchParams.toString()

  const filters = [
    { label: 'All', query: '', count: undefined },
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

  return (
    <nav
      aria-label="Inbox filters"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}
    >
      {filters.map((filter) => {
        const isActive = current === filter.query
        return (
          <Link
            key={filter.label}
            href={filter.query ? `${pathname}?${filter.query}` : pathname}
            style={{
              alignItems: 'center',
              background: isActive ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 999,
              color: isActive ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-800)',
              display: 'inline-flex',
              fontSize: 12,
              gap: 6,
              padding: '4px 12px',
              textDecoration: 'none',
            }}
          >
            {filter.label}
            {typeof filter.count === 'number' && filter.count > 0 ? (
              <span style={{ opacity: 0.7 }}>{filter.count}</span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
