'use client'

import type React from 'react'
import { type CSSProperties, useMemo } from 'react'
import { ALL, BrowseIndex, FilterSelect, IndexEmpty, matchesOption } from '@/sections/Browse'
import { DATED_SORTS, newestFirst, type SortRegistry } from '@/sections/Browse/sorts'
import { FILTER_SWAP_MAX_STAGGER_STEPS, useFilterSwap } from '@/shared/ui/filter-swap'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { LabRow } from './LabRow'
import type { LabBrowseData, LabBrowseItem } from './queries'

/**
 * `listed` is a no-op: Array.sort is stable, so filtered rows keep the
 * featured-first, newest-first order the query already applied.
 */
const LAB_SORTS = {
  listed: { label: 'Default', compare: () => 0 },
  ...DATED_SORTS,
  featured: {
    label: 'Featured',
    compare: (a, b) => Number(b.featured) - Number(a.featured) || newestFirst(a, b),
  },
} satisfies SortRegistry<LabBrowseItem>

type LabSortKey = keyof typeof LAB_SORTS

type LabQuery = { kind: string; capability: string; sort: LabSortKey }

const INITIAL_QUERY: LabQuery = { kind: ALL, capability: ALL, sort: 'listed' }

/** The underlying record is a Lab Project, whatever kind it is. */
const NOUN = { one: 'Project', other: 'Projects' }

export type Props = {
  /** Kicker above the index title: CMS hero copy. */
  eyebrow?: string | null
  title?: string | null
} & LabBrowseData

/**
 * Editorial lab index: the work index's numbered row list over lab pages,
 * filtered by kind and capability. Filters and sort change the set in place
 * (no navigation) and the first paint plays the site's under-media reveal per
 * row (each row gates on its own scroll position, so the list cascades as it
 * is read); afterwards a swap is the faster in-place filter fade, never a
 * replay of the entrance.
 */
export const LabBrowse: React.FC<Props> = ({ eyebrow, title, items, kinds, capabilities }) => {
  const { selected, rendered, exiting, hasFiltered, apply } = useFilterSwap(INITIAL_QUERY)

  const visibleItems = useMemo(() => {
    const filtered = items.filter(
      (item) =>
        matchesOption(item.kind ? [item.kind] : [], rendered.kind) &&
        matchesOption(item.capabilities, rendered.capability),
    )
    return filtered.sort(LAB_SORTS[rendered.sort].compare)
  }, [items, rendered])

  const set = (patch: Partial<LabQuery>) => apply({ ...selected, ...patch })

  const renderedKey = `${rendered.kind}|${rendered.capability}|${rendered.sort}`
  const count = visibleItems.length

  return (
    <BrowseIndex
      count={count}
      eyebrow={eyebrow}
      filters={
        <>
          <FilterSelect
            label="Kind"
            onValueChange={(kind) => set({ kind })}
            options={kinds}
            value={selected.kind}
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
      sort={{ orders: LAB_SORTS, value: selected.sort, onChange: (sort) => set({ sort }) }}
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
                    <LabRow index={index} item={item} />
                  </div>
                ) : (
                  <ScrollReveal as="div" variant="underMedia">
                    <LabRow index={index} item={item} />
                  </ScrollReveal>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <IndexEmpty
            action="Show all lab projects"
            message="No lab projects match these filters yet."
            onReset={() => apply(INITIAL_QUERY)}
          />
        )}
      </div>
    </BrowseIndex>
  )
}
