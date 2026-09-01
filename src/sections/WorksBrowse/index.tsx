'use client'

import { IconArrowUpRight, IconChevronDown } from '@tabler/icons-react'
import Link from 'next/link'
import type React from 'react'
import { type CSSProperties, useMemo } from 'react'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cursorTarget } from '@/features/cursor'
import { HeroEyebrow } from '@/heros/shared'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import { FILTER_SWAP_MAX_STAGGER_STEPS, useFilterSwap } from '@/shared/ui/filter-swap'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
import type { WorksBrowseData, WorksBrowseFilterOption, WorksBrowseItem } from './queries'

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

const padIndex = (index: number) => String(index + 1).padStart(2, '0')

const matchesSlug = (options: WorksBrowseFilterOption[], slug: string) =>
  slug === ALL || options.some((option) => option.slug === slug)

/**
 * The index's three mono registers. Each carries a real lead rather than
 * `leading-none`: the strip wraps at narrow widths and the row facts line runs
 * long, and wide tracking on a collapsed lead closes up the moment it wraps.
 */
/** Section labels — `Filter`, `Sort`, and the row's facts line. */
const LABEL = 'font-mono text-xs/4 tracking-widest uppercase'
/** Values the reader acts on: dropdown text and the sort options. */
const CONTROL = 'font-mono text-xs/4 uppercase'
/** Figures — the index count and the row numbers — sit one step larger. */
const FIGURE = 'font-mono text-sm/none uppercase'

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

/**
 * One index row. Below `md` it stacks and the number and arrow ride a header
 * line; at `md` that wrapper dissolves (`display: contents`) so both become
 * direct children of the row — the same nodes in both layouts, so the reveal
 * markers and their beats never duplicate.
 */
const WorkRow: React.FC<{ item: WorksBrowseItem; index: number }> = ({ item, index }) => {
  const facts = [item.client, item.industries[0]?.label, item.year].filter(Boolean)

  return (
    <Link
      className="group pressable pressable-subtle flex flex-col gap-5 py-8 outline-none md:flex-row md:items-center md:gap-12"
      href={`/works/${item.slug}`}
      transitionTypes={[...forwardNavTransitionTypes]}
      {...cursorTarget({ variant: 'view' })}
    >
      <div className="flex items-center justify-between md:contents">
        <span
          className={cn(FIGURE, 'text-muted-foreground md:w-10 md:shrink-0')}
          data-reveal
          data-reveal-group="row-furniture"
        >
          {padIndex(index)}
        </span>
        <IconArrowUpRight
          aria-hidden="true"
          className="size-6 shrink-0 stroke-1 text-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none md:order-last"
          data-reveal
          data-reveal-group="row-furniture"
        />
      </div>

      <div
        className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted md:w-80 lg:w-96"
        data-reveal="media"
      >
        {item.media && (
          <Media
            fill
            htmlElement={null}
            imgClassName="object-cover"
            resource={item.media}
            size="(min-width: 1024px) 24rem, (min-width: 768px) 20rem, 100vw"
          />
        )}
      </div>

      <div className="flex min-w-0 grow flex-col gap-4">
        {facts.length > 0 && (
          <p
            className={cn(LABEL, 'text-muted-foreground')}
            data-reveal
            data-reveal-group="row-identity"
          >
            {facts.join(' · ')}
          </p>
        )}
        <h2
          className="text-heading-3 text-foreground group-hover:underline"
          data-reveal
          data-reveal-group="row-identity"
        >
          {item.title}
        </h2>
        {item.capabilities.length > 0 && (
          <ul className="flex flex-wrap items-center gap-2" data-reveal>
            {item.capabilities.map((capability) => (
              <li key={capability.slug}>
                <Badge className="rounded-full px-3 py-1 font-mono font-normal" variant="outline">
                  {capability.label}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  )
}
