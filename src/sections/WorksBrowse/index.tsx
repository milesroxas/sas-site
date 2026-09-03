'use client'

import { IconChevronDown } from '@tabler/icons-react'
import type React from 'react'
import { type CSSProperties, useMemo } from 'react'
import { Container } from '@/components/Container'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HeroEyebrow } from '@/heros/shared'
import { FILTER_SWAP_MAX_STAGGER_STEPS, useFilterSwap } from '@/shared/ui/filter-swap'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
import type { WorksBrowseData, WorksBrowseFilterOption, WorksBrowseItem } from './queries'
import { CONTROL, FIGURE, LABEL } from './registers'
import { WorkRow } from './WorkRow'

/** Sentinel for an unset dropdown — Radix Select has no empty-string value. */
const ALL = 'all'

const publishedTime = (item: WorksBrowseItem) =>
  item.publishedAt ? new Date(item.publishedAt).getTime() : 0

/**
 * The index's orderings, stated once: the strip renders these labels in
 * declaration order and the list sorts by the matching comparator, so adding
 * an ordering is one entry here.
 */
const WORKS_SORTS = {
  newest: { label: 'Newest', compare: (a, b) => publishedTime(b) - publishedTime(a) },
  oldest: { label: 'Oldest', compare: (a, b) => publishedTime(a) - publishedTime(b) },
  az: { label: 'A–Z', compare: (a, b) => a.title.localeCompare(b.title) },
  featured: {
    label: 'Featured',
    compare: (a, b) =>
      Number(b.featured) - Number(a.featured) || publishedTime(b) - publishedTime(a),
  },
} satisfies Record<
  string,
  { label: string; compare: (a: WorksBrowseItem, b: WorksBrowseItem) => number }
>

type WorksSortKey = keyof typeof WORKS_SORTS

const SORT_KEYS = Object.keys(WORKS_SORTS) as WorksSortKey[]

type WorksQuery = { industry: string; capability: string; sort: WorksSortKey }

const INITIAL_QUERY: WorksQuery = { industry: ALL, capability: ALL, sort: 'newest' }

const matchesSlug = (options: WorksBrowseFilterOption[], slug: string) =>
  slug === ALL || options.some((option) => option.slug === slug)

export type Props = {
  /** Kicker above the index title — CMS hero copy. */
  eyebrow?: string | null
  title?: string | null
} & WorksBrowseData

/**
 * Editorial work index: a numbered list of case studies under a filter strip.
 * Filters and sort change the set in place — no navigation — and the first
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
        matchesSlug(item.industries, rendered.industry) &&
        matchesSlug(item.capabilities, rendered.capability),
    )
    return filtered.sort(WORKS_SORTS[rendered.sort].compare)
  }, [items, rendered])

  const set = (patch: Partial<WorksQuery>) => apply({ ...selected, ...patch })

  const renderedKey = `${rendered.industry}|${rendered.capability}|${rendered.sort}`
  const count = visibleItems.length

  return (
    <Container className="flex flex-col gap-12 pt-12 pb-24">
      <ScrollReveal as="div" className="flex flex-col gap-12" variant="intro">
        <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-start gap-6">
            {eyebrow && (
              <div data-reveal data-reveal-group="index-title">
                <HeroEyebrow eyebrow={eyebrow} />
              </div>
            )}
            {title && (
              <h1
                className="text-display text-foreground"
                data-reveal
                data-reveal-group="index-title"
              >
                {title}
              </h1>
            )}
          </div>
          <p className={cn(FIGURE, 'shrink-0 text-muted-foreground')} data-reveal>
            {`Index / ${count} ${count === 1 ? 'Project' : 'Projects'}`}
          </p>
        </header>

        {/* The strong rule sits on top: the strip closes the header and opens
            the list, so its lower edge is the list's own hairline weight. */}
        <div
          className="flex flex-col gap-4 border-t border-foreground border-b border-b-border py-3 lg:flex-row lg:items-center lg:justify-between"
          data-reveal
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className={cn(LABEL, 'text-muted-foreground')}>Filter</span>
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
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className={cn(LABEL, 'text-muted-foreground')}>Sort</span>
            {SORT_KEYS.map((key) => {
              const active = selected.sort === key
              return (
                <button
                  aria-pressed={active}
                  className={cn(
                    CONTROL,
                    'pressable underline-offset-4',
                    active
                      ? 'text-foreground underline'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  key={key}
                  onClick={() => set({ sort: key })}
                  type="button"
                >
                  {WORKS_SORTS[key].label}
                </button>
              )
            })}
          </div>
        </div>
      </ScrollReveal>

      <p aria-live="polite" className="sr-only">
        {`Showing ${count} of ${items.length} projects`}
      </p>

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
          <div>
            <p className="text-muted-foreground">No projects match these filters yet.</p>
            <button
              className="pressable mt-4 text-sm text-foreground underline underline-offset-4"
              onClick={() => apply(INITIAL_QUERY)}
              type="button"
            >
              Show all projects
            </button>
          </div>
        )}
      </div>
    </Container>
  )
}

/**
 * A filter dropdown drawn as strip text rather than a control: the Radix
 * trigger keeps the keyboard and screen-reader behaviour, the box is stripped
 * off it, and the value reads inline with its label (`Industry: All`).
 */
const FilterSelect: React.FC<{
  label: string
  options: WorksBrowseFilterOption[]
  value: string
  onValueChange: (value: string) => void
}> = ({ label, options, value, onValueChange }) => (
  <Select onValueChange={onValueChange} value={value}>
    <SelectTrigger
      aria-label={`Filter by ${label.toLowerCase()}`}
      className={cn(
        CONTROL,
        'h-auto gap-2 rounded-none border-0 bg-transparent p-0 text-foreground shadow-none data-[size=default]:h-auto',
        'focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4',
      )}
      icon={<IconChevronDown className="pointer-events-none size-3 text-foreground" />}
    >
      {`${label}: `}
      <SelectValue />
    </SelectTrigger>
    {/* Anchored under the trigger rather than over it: the strip's controls sit
        shoulder to shoulder, and an item-aligned menu covers its neighbour. */}
    <SelectContent align="start" position="popper">
      <SelectItem value={ALL}>All</SelectItem>
      {options.map((option) => (
        <SelectItem key={option.slug} value={option.slug}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)
