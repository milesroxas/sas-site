'use client'

import { IconWorld } from '@tabler/icons-react'
import Lenis from 'lenis'
import type { ReactNode, RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { useTempus } from 'tempus/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'

/**
 * The browser-window mockup shared by the demo playgrounds: a frame with
 * address-bar chrome, and a scroller inside it driven by its own Lenis
 * instance tuned like the site's root scroll.
 *
 * Demos that need real scrolling can't use the page scroll — the shell's stage
 * is a nested layout with a pinned controls panel, and root Lenis is already
 * prevented over it. A window with its own scroller gives the demo a scroll
 * axis it fully owns, and frames the effect the way a visitor would see it.
 */

/** Mirrors SmoothScrollProvider's feel, scaled to a window-sized scroller. */
const SCROLLER_LENIS_OPTIONS = {
  lerp: 0.09,
  wheelMultiplier: 1,
  touchMultiplier: 1.15,
  syncTouch: true,
  smoothWheel: true,
} as const

export type DemoScrollerProps = {
  children: ReactNode
  /** Sizing for the window's scroll viewport — it needs a definite height. */
  className?: string
  /**
   * The element that actually scrolls. Pass one when the demo reads scroll
   * position itself (a scroll-reactive effect needs this as its source);
   * omit it and the scroller keeps its own.
   */
  viewportRef?: RefObject<HTMLDivElement | null>
}

/**
 * A scroll viewport driven by its own Lenis instance on the tempus clock, the
 * same clock the site's root Lenis and the WebGL RAF share — so scroll-reactive
 * effects inside sample a position that has already settled for this frame.
 *
 * Reduced motion gets native scrolling, mirroring SmoothScrollProvider.
 */
export function DemoScroller({ children, className, viewportRef }: DemoScrollerProps) {
  const internalRef = useRef<HTMLDivElement>(null)
  const ref = viewportRef ?? internalRef
  const lenisRef = useRef<Lenis | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    const wrapper = ref.current
    if (!wrapper) return
    const lenis = new Lenis({
      wrapper,
      // Radix wraps children in a single content div — Lenis measures it.
      content: (wrapper.firstElementChild as HTMLElement | null) ?? wrapper,
      ...SCROLLER_LENIS_OPTIONS,
      autoRaf: false,
    })
    lenisRef.current = lenis
    return () => {
      lenisRef.current = null
      lenis.destroy()
    }
  }, [reducedMotion, ref])

  useTempus(({ time }: { time: number }) => {
    lenisRef.current?.raf(time)
  })

  return (
    <ScrollArea className={className} viewportRef={ref} viewportClassName="overscroll-contain">
      {children}
    </ScrollArea>
  )
}

export type DemoBrowserFrameProps = {
  children: ReactNode
  /** Shown in the address bar, after the site host. */
  path: string
  /** Swaps the address-bar icon for a spinner. */
  loading?: boolean
  /** Chrome left of the address bar — a back button, say. */
  leading?: ReactNode
  /** Chrome right of the address bar — a status readout or a window control, say. */
  trailing?: ReactNode
  className?: string
}

/**
 * The window frame: rounded chrome with an address bar, wrapping whatever the
 * demo puts inside. `data-lenis-prevent` keeps root Lenis off the frame so
 * wheel input belongs to the window's own scroller.
 */
export function DemoBrowserFrame({
  children,
  path,
  loading = false,
  leading,
  trailing,
  className,
}: DemoBrowserFrameProps) {
  return (
    <div
      data-lenis-prevent
      className={cn('overflow-hidden rounded-lg border border-border bg-background', className)}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        {leading}
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
          {loading ? (
            <Spinner className="size-3.5 shrink-0" />
          ) : (
            <IconWorld className="size-3.5 shrink-0" aria-hidden />
          )}
          <span className="truncate">suits-sandals.com{path}</span>
        </div>
        {trailing}
      </div>
      {children}
    </div>
  )
}
