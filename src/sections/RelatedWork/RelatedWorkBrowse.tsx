'use client'

import { IconArrowUpRight } from '@tabler/icons-react'
import Link from 'next/link'
import type React from 'react'
import { type CSSProperties, useMemo } from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { HeroEyebrow } from '@/heros/shared'
import type { WorksBrowseFilterOption, WorksBrowseItem } from '@/sections/WorksBrowse/queries'
import { LABEL } from '@/sections/WorksBrowse/registers'
import { WorkRow, type WorkRowHighlight } from '@/sections/WorksBrowse/WorkRow'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import { FILTER_SWAP_MAX_STAGGER_STEPS, useFilterSwap } from '@/shared/ui/filter-swap'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

/** The taxonomy a segment page is defined by, and that its related work is matched on. */
export type RelatedWorkKind = keyof WorkRowHighlight

export type RelatedWorkCopy = {
  heading: string
  description: string
  /** Names the control and the axis: `Filter by industry`. */
  filterLabel: string
  /** The list's empty state under a term none of the rows carry. */
  empty: string
}

/**
 * The filter earns its place only once it can narrow something: two or more
 * terms to choose between, over enough rows that a choice changes the read.
 * Below either, the aside shows the heading and the link alone.
 */
const MIN_FILTER_TERMS = 2
const MIN_FILTER_ROWS = 3

const highlightFor = (kind: RelatedWorkKind, slugs: readonly string[]): WorkRowHighlight =>
  kind === 'capabilities' ? { capabilities: slugs } : { industries: slugs }

/**
 * The related-work closer's interactive body: the aside offers the page's own
 * terms as filters and the list is the works index's own row. Only terms at
 * least one row carries are offered, in the page's order: the Positioning
 * tab says what a segment spans, the rows say what has been proven, and a
 * filter that empties the list on first click proves nothing. With nothing
 * selected the list shows every related project and each row lights every
 * page term it carries; picking a term narrows the list to that term in place
 * (the index's filter swap, no navigation) and lights only it, and picking it
 * again clears the filter. Active styling follows the selection alone, so
 * nothing reads as pressed on first paint.
 *
 * Layout sits on `BlockGrid`: from `2xl` the aside takes two columns and the
 * list the other six, the narrowest column that still seats the index row
 * (number lane, thumbnail, arrow) with a two-line title beside it. Below that
 * the list takes the full width and the aside sits above it as a subgrid of
 * the same eight columns: the heading cluster keeps to half of them, while the
 * filter terms run inline across all eight so the aside spends its height on
 * the heading rather than on wrapped terms or one hairline row each. Motion
 * is the site's two reveals and the filter swap, nothing else: the aside
 * plays the intro reveal as one cluster, each row plays the under-media
 * reveal gated on its own position on first paint, and a filter change is
 * the faster in-place swap the index uses.
 */
export const RelatedWorkBrowse: React.FC<{
  kind: RelatedWorkKind
  copy: RelatedWorkCopy
  /** The page's own terms: the filter candidates, and the slugs every row is read against. */
  terms: WorksBrowseFilterOption[]
  items: WorksBrowseItem[]
}> = ({ kind, copy, terms, items }) => {
  const { selected, rendered, exiting, hasFiltered, apply } = useFilterSwap<string | null>(null)

  const filters = useMemo(() => {
    if (items.length < MIN_FILTER_ROWS) return []
    const carried = new Set(items.flatMap((item) => item[kind].map((term) => term.slug)))
    const offered = terms.filter((term) => carried.has(term.slug))
    return offered.length >= MIN_FILTER_TERMS ? offered : []
  }, [items, kind, terms])

  const visibleItems = useMemo(
    () =>
      rendered ? items.filter((item) => item[kind].some((term) => term.slug === rendered)) : items,
    [items, kind, rendered],
  )

  const toggle = (slug: string) => apply(selected === slug ? null : slug)

  /* Rows light the term they are being read against: the selection when there
     is one, else every term the page carries. Follows `rendered`, so the lit
     term changes with the rows it explains rather than a beat ahead. */
  const highlight = highlightFor(kind, rendered ? [rendered] : terms.map((term) => term.slug))

  const count = visibleItems.length

  return (
    <BlockGrid>
      {/* Below `2xl` the cell is a subgrid of the page's eight columns so the
          terms can take the full width while the heading keeps to half;
          every child starts at column 1 so each is its own row. At `2xl`
          it is one sticky column: `self-start` frees the cell from the
          row's stretch so sticky has room to travel. */}
      <ScrollReveal
        as="div"
        className="grid justify-items-start gap-y-6 md:col-span-8 md:col-start-1 md:grid-cols-subgrid 2xl:sticky 2xl:top-24 2xl:col-span-2 2xl:flex 2xl:flex-col 2xl:items-start 2xl:self-start"
        variant="intro"
      >
        {/* Grouped with the heading it labels: one thought, one beat. */}
        <div className="md:col-span-4 md:col-start-1" data-reveal data-reveal-group="related-intro">
          <HeroEyebrow eyebrow="Related work" />
        </div>
        <h2
          className="text-heading-2 text-foreground md:col-span-4 md:col-start-1"
          data-reveal
          data-reveal-group="related-intro"
        >
          {copy.heading}
        </h2>
        <p
          className="max-w-sm text-base leading-relaxed text-muted-foreground md:col-span-4 md:col-start-1"
          data-reveal
        >
          {copy.description}
        </p>
        {filters.length > 0 && (
          <div className="flex w-full flex-col pt-6 md:col-span-8 md:col-start-1" data-reveal>
            <p className={cn(LABEL, 'pb-2 text-muted-foreground 2xl:pb-4')}>{copy.filterLabel}</p>
            {/* The Insights sidebar's row, one per page term, and it turns
                where this aside turns: while the aside sits above the list
                the terms run inline and the active marker is the rule under
                the label, as on the Insights rail; once the aside is a
                sidebar at `2xl` they stack on hairlines and the marker
                returns to the leading edge, the label sliding off it. Inline
                terms wrap rather than pan: a page carries a handful, not a
                rail's worth. */}
            <ul
              aria-label={copy.filterLabel}
              className="flex flex-wrap items-center gap-x-6 2xl:flex-col 2xl:items-stretch 2xl:gap-x-0"
            >
              {filters.map((term) => {
                const active = selected === term.slug
                return (
                  <li className="2xl:border-t 2xl:border-border 2xl:pb-2" key={term.slug}>
                    <button
                      aria-pressed={active}
                      className={cn(
                        'pressable pressable-subtle relative flex w-full items-center py-2 text-left whitespace-nowrap',
                        // `::after` pads the row out to a 44px press target
                        // on touch-sized screens without inflating how it
                        // reads. Dropped at `2xl`, where the rows stack and
                        // the pad would swallow hover on the neighbour.
                        'after:absolute after:inset-x-0 after:-inset-y-2 2xl:after:hidden',
                        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                      )}
                      onClick={() => toggle(term.slug)}
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute rounded-full bg-active transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none',
                          'inset-x-0 bottom-0 h-0.5 2xl:top-1/2 2xl:bottom-auto 2xl:left-0 2xl:inset-x-auto 2xl:h-4 2xl:w-0.5 2xl:-translate-y-1/2',
                          active
                            ? 'scale-100 opacity-100'
                            : 'scale-x-50 opacity-0 2xl:scale-x-100 2xl:scale-y-50',
                        )}
                      />
                      <span
                        className={cn(
                          'inline-block transition-transform duration-200 ease-out motion-reduce:transition-none',
                          active && '2xl:translate-x-3',
                        )}
                      >
                        {term.label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        <Link
          className="group pressable flex items-center gap-3 pt-2 text-lg md:col-span-4 md:col-start-1"
          data-reveal
          href="/works"
          transitionTypes={[...forwardNavTransitionTypes]}
        >
          View all work
          <IconArrowUpRight
            aria-hidden="true"
            className="size-6 shrink-0 stroke-1 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          />
        </Link>
      </ScrollReveal>

      {/* The strong rule opens the list, as the index strip's lower edge
          does; each row closes with the list's own hairline. */}
      <div className="border-t border-foreground md:col-span-8 2xl:col-span-6">
        <p aria-live="polite" className="sr-only">
          {`Showing ${count} of ${items.length} projects`}
        </p>
        <div className="filter-swap" data-exiting={exiting || undefined} key={rendered ?? 'all'}>
          {count > 0 ? (
            <ul>
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
                      <WorkRow highlight={highlight} index={index} item={item} titleAs="h3" />
                    </div>
                  ) : (
                    <ScrollReveal as="div" variant="underMedia">
                      <WorkRow highlight={highlight} index={index} item={item} titleAs="h3" />
                    </ScrollReveal>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            /* Hand-picked work need not carry every page term, so a term can
               come up empty. */
            <div className="border-b border-border py-8">
              <p className="text-muted-foreground">{copy.empty}</p>
              <button
                className="pressable mt-4 text-sm text-foreground underline underline-offset-4"
                onClick={() => apply(null)}
                type="button"
              >
                Show all related work
              </button>
            </div>
          )}
        </div>
      </div>
    </BlockGrid>
  )
}
