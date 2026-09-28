'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export type FilterLink = {
  label: string
  /** The list query, without the leading `?`; empty for "all". */
  query: string
  count?: number
}

/**
 * A list query reduced to its filter: the `where[...]` pairs, in a fixed
 * order. Payload writes paging, sort and columns into the URL beside the
 * filter, and none of those change which preset is showing.
 */
export const whereOf = (query: string): string =>
  [...new URLSearchParams(query)]
    .filter(([key]) => key.startsWith('where'))
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('&')

/** The filter the list on screen is showing, in `whereOf` form. */
export function useListWhere(): string {
  return whereOf(useSearchParams().toString())
}

/**
 * A row of preset filters above a list: the few questions someone opens the
 * list to answer, one click each instead of the filter builder's four. The
 * active preset is the one whose filter the URL carries.
 */
export function FilterLinks({ filters, label }: { filters: FilterLink[]; label: string }) {
  const pathname = usePathname()
  const current = useListWhere()

  return (
    <nav aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
      {filters.map((filter) => {
        const isActive = current === whereOf(filter.query)
        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
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
