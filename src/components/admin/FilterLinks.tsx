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
 * A row of preset filters above a list: the few questions someone opens the
 * list to answer, one click each instead of the filter builder's four. The
 * active preset is the one whose query the URL carries.
 */
export function FilterLinks({ filters, label }: { filters: FilterLink[]; label: string }) {
  const pathname = usePathname()
  // Serialized params percent-encode the brackets a preset writes literally.
  const current = decodeURIComponent(useSearchParams().toString())

  return (
    <nav aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
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
