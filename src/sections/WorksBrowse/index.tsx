'use client'

import type React from 'react'
import { type CSSProperties, useMemo } from 'react'
import { ALL, BrowseIndex, FilterSelect, IndexEmpty, matchesOption } from '@/sections/Browse'
import { DATED_SORTS, newestFirst, type SortRegistry } from '@/sections/Browse/sorts'
import { FILTER_SWAP_MAX_STAGGER_STEPS, useFilterSwap } from '@/shared/ui/filter-swap'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import type { WorksBrowseData, WorksBrowseItem } from './queries'
import { WorkRow } from './WorkRow'

/**
 * `listed` is a no-op: Array.sort is stable, so filtered rows keep the
 * collection `_order` the query already applied.
 */
const WORKS_SORTS = {
  listed: { label: 'Default', compare: () => 0 },
  ...DATED_SORTS,
  featured: {
    label: 'Featured',
    compare: (a, b) => Number(b.featured) - Number(a.featured) || newestFirst(a, b),
  },
} satisfies SortRegistry<WorksBrowseItem>

type WorksSortKey = keyof typeof WORKS_SORTS

type WorksQuery = { industry: string; capability: string; sort: WorksSortKey }

const INITIAL_QUERY: WorksQuery = { industry: ALL, capability: ALL, sort: 'listed' }

const NOUN = { one: 'Project', other: 'Projects' }

export type Props = {
  /** Kicker above the index title: CMS hero copy. */
  eyebrow?: string | null
  title?: string | null
} & WorksBrowseData

/**
 * Editorial work index: a numbered list of case studies under a filter strip.
 * Filters and sort change the set in place (no navigation) and the first
 * paint plays the site's under-media reveal per row (each row gates on its own
 * scroll position, so the list cascades as it is read); afterwards a swap is
 * the faster in-place filter fade, never a replay of the entrance.
 */
export const WorksBrowse: React.FC<Props> = ({
  eyebrow,
  title,
  items,
  industries,
  capabilities,
}) => {
  const { selected, rendered, exiting, hasFiltered, apply } = useFilterSwap(INITIAL_QUERY)

  const visibleItems = useMemo(() => {
    const filtered = items.filter(
      (item) =>
        matchesOption(item.industries, rendered.industry) &&
        matchesOption(item.capabilities, rendered.capability),
    )
    return filtered.sort(WORKS_SORTS[rendered.sort].compare)
  }, [items, rendered])

  const set = (patch: Partial<WorksQuery>) => apply({ ...selected, ...patch })

  const renderedKey = `${rendered.industry}|${rendered.capability}|${rendered.sort}`
  const count = visibleItems.length

  return (
    <BrowseIndex
      count={count}
      eyebrow={eyebrow}
      filters={
        <>
          <FilterSelect
            label="Industry"
            onValueChange={(industry) => set({ industry })}
            options={industries}
            value={selected.industry}
          />
          <FilterSelect
            label="Capability"
            onValueChange={(capability) => set({ capability })}
            options={capabilities}
            value={selected.capability}
          />
        </>
      }
      noun={NOUN}
      sort={{ orders: WORKS_SORTS, value: selected.sort, onChange: (sort) => set({ sort }) }}
      title={title}
      total={items.length}
    >
      <div className="filter-swap" data-exiting={exiting || undefined} key={renderedKey}>
        {count > 0 ? (
          <ul className="flex flex-col">
            {visibleItems.map((item, index) => (
              <li className="border-b border-border" key={item.slug}>
                {hasFiltered ? (
                  <div
                    className="filter-swap-item"
                    style={
                      {
                        '--stagger': Math.min(index, FILTER_SWAP_MAX_STAGGER_STEPS),
                      } as CSSProperties
                    }
                  >
                    <WorkRow index={index} item={item} />
                  </div>
                ) : (
                  <ScrollReveal as="div" variant="underMedia">
                    <WorkRow index={index} item={item} />
                  </ScrollReveal>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <IndexEmpty
            action="Show all projects"
            message="No projects match these filters yet."
            onReset={() => apply(INITIAL_QUERY)}
          />
        )}
      </div>
    </BrowseIndex>
  )
}
