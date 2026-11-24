'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { cn } from '@/utilities/ui'
import {
  QuoteBody,
  type QuoteEntry,
  quoteColumnClassName,
  quoteFigureClassName,
} from './QuoteFigure'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** True while the box overflows on its inline axis: the phone layout. */
const pans = (el: HTMLElement) => el.scrollWidth > el.clientWidth + 1

/**
 * Below `md` the quotes are a native swipe track: one quote per page,
 * scroll-snapped, one page per swipe (`snap-always`), each page bleeding to
 * the screen with its copy back on the page column (`px-gutter`), so a
 * page's width is the track's and the scroll offset of quote `i` is
 * `i * clientWidth`. From `md` the track is one grid cell with every quote
 * stacked in it: the band is as tall as the longest quote and never jumps,
 * and only the active quote is painted.
 *
 * `overscroll-x-contain` keeps a swipe past the last quote from turning into
 * the browser's back gesture.
 */
const TRACK_CLASS =
  'no-scrollbar -mx-gutter flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain md:mx-0 md:grid md:snap-none md:overflow-visible'

const PAGE_CLASS = cn(
  quoteFigureClassName,
  'w-full shrink-0 snap-start snap-always px-gutter',
  'md:col-start-1 md:row-start-1 md:px-0 md:data-[state=inactive]:invisible',
)

/**
 * The client row, the same rail TabsView and AudienceTabs use on a phone:
 * it bleeds to the screen so a half-cut name, not a scrollbar, is the
 * affordance, and `scroll-fade-x` dims only the edge with names behind it.
 * From `md` it wraps on the page column. `-my-1 py-1` is layout-neutral
 * room for the focus ring, which `overflow-x-auto` would crop.
 */
const RAIL_CLASS =
  'no-scrollbar scroll-fade-x scroll-fade-8 relative -mx-gutter -my-1 flex gap-x-6 overflow-x-auto overscroll-x-contain py-1 ps-gutter pe-gutter scroll-ps-gutter scroll-pe-gutter md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:scroll-fade-none'

/**
 * A client name: a 44px target, its mark a 1px foreground line laid on the
 * row's rule (the wrapper's `before`, so the rail's scroll can never move or
 * crop it).
 */
const TRIGGER_CLASS =
  'relative flex min-h-11 shrink-0 touch-manipulation items-center whitespace-nowrap text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground data-[state=active]:text-foreground data-[state=active]:before:absolute data-[state=active]:before:inset-x-0 data-[state=active]:before:top-0 data-[state=active]:before:h-px data-[state=active]:before:bg-foreground'

/**
 * Two or more testimonials: the quote with a row of client names under it.
 * Nothing advances on its own. A name (click, tap, arrow keys) picks a quote;
 * on a phone a swipe does too, and the two stay in step: the track's scroll
 * position is the selection while a finger drives it, and a picked name
 * scrolls the track to its quote.
 *
 * From `md` a picked quote arrives with the quote-reveal mask; the first
 * quote paints still, and a phone gets no reveal because the swipe is the
 * motion.
 */
export const QuoteBannerSwitcher = ({
  entries,
  eyebrow,
}: {
  entries: QuoteEntry[]
  eyebrow?: string | null
}) => {
  const [value, setValue] = useState(entries[0]?.id ?? '')
  const [picked, setPicked] = useState(false)
  const track = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  // Index a programmatic scroll is heading to; swipe reads ignore the pages
  // it passes on the way. Cleared on arrival or when a finger takes over.
  const heading = useRef<number | null>(null)
  const active = Math.max(
    0,
    entries.findIndex((entry) => entry.id === value),
  )
  const activeRef = useRef(active)
  activeRef.current = active

  const pick = (next: string) => {
    setValue(next)
    setPicked(true)
    const el = track.current
    const index = entries.findIndex((entry) => entry.id === next)
    if (!el || index < 0 || !pans(el)) return
    heading.current = index
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: prefersReducedMotion() ? 'instant' : 'smooth',
    })
  }

  const onTrackScroll = () => {
    const el = track.current
    if (!el || !pans(el)) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    if (heading.current !== null) {
      if (index === heading.current && Math.abs(el.scrollLeft - index * el.clientWidth) < 2) {
        heading.current = null
      }
      return
    }
    const next = entries[index]?.id
    if (next) setValue(next)
  }

  const releaseHeading = useCallback(() => {
    heading.current = null
  }, [])

  // Keep the active name inside the rail's view as the selection moves.
  useEffect(() => {
    const el = rail.current
    const tab = el?.querySelectorAll<HTMLElement>('[role="tab"]')[active]
    if (!el || !tab || !pans(el)) return
    const inset = Number.parseFloat(getComputedStyle(el).paddingInlineStart) || 0
    const start = tab.offsetLeft - inset
    const end = tab.offsetLeft + tab.offsetWidth + inset - el.clientWidth
    const left = el.scrollLeft > start ? start : el.scrollLeft < end ? end : null
    if (left === null) return
    el.scrollTo({ left, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
  }, [active])

  // A resize (rotation, crossing `md`) re-seats the track on the active quote.
  useEffect(() => {
    const el = track.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      if (!pans(el)) return
      heading.current = null
      el.scrollTo({ left: activeRef.current * el.clientWidth, behavior: 'instant' })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <TabsPrimitive.Root asChild onValueChange={pick} value={value}>
      <BlockGrid>
        <div className={quoteColumnClassName}>
          {eyebrow ? <p className={eyebrowClassName}>{eyebrow}</p> : null}
          <div
            className={TRACK_CLASS}
            onPointerDown={releaseHeading}
            onScroll={onTrackScroll}
            onTouchStart={releaseHeading}
            onWheel={releaseHeading}
            ref={track}
          >
            {entries.map((entry, index) => {
              const on = index === active
              return (
                <TabsPrimitive.Content
                  asChild
                  forceMount
                  inert={!on}
                  key={entry.id}
                  value={entry.id}
                >
                  <figure className={PAGE_CLASS}>
                    <QuoteBody
                      className={cn(
                        on && picked && 'md:animate-quote-reveal motion-reduce:animate-none',
                      )}
                      // The class lands only on the picked quote, so the reveal
                      // restarts on every pick and never on first paint.
                      entry={entry}
                    />
                  </figure>
                </TabsPrimitive.Content>
              )
            })}
          </div>
        </div>
        <div className="relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-border md:col-span-8">
          <TabsPrimitive.List aria-label="Client testimonials" className={RAIL_CLASS} ref={rail}>
            {entries.map((entry) => (
              <TabsPrimitive.Trigger className={TRIGGER_CLASS} key={entry.id} value={entry.id}>
                {entry.label}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>
        </div>
      </BlockGrid>
    </TabsPrimitive.Root>
  )
}
