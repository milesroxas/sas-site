'use client'

import { IconMoon, IconSun, IconWorld } from '@tabler/icons-react'
import Lenis from 'lenis'
import type { ReactNode, RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { useTempus } from 'tempus/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type { Theme } from '@/providers/Theme/types'
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
  /**
   * The palette the previewed site is in. Stamped on the frame, so the chrome
   * and everything inside the window resolve one theme — the demo content
   * never pins its own. Omitted, the window follows the visitor's site theme.
   */
  theme?: Theme
  /**
   * Makes the theme a control: the frame renders the window's light/dark
   * toggle and hands back the other polarity. Demos that also load a preset
   * with the flip do it here, so the panel and the ground stay one truth.
   */
  onThemeChange?: (theme: Theme) => void
  /** Appended to the toggle's tooltip — what flipping also writes, if anything. */
  themeHint?: string
  /** Chrome left of the address bar — a back button, say. */
  leading?: ReactNode
  /** Chrome right of the address bar — a status readout or a window control, say. */
  trailing?: ReactNode
  className?: string
  /** Classes for the chrome bar itself (the row holding the address bar). */
  barClassName?: string
}

/**
 * The window frame: rounded chrome with an address bar, wrapping whatever the
 * demo puts inside. `data-lenis-prevent` keeps root Lenis off the frame so
 * wheel input belongs to the window's own scroller.
 *
 * The frame is also the window's theme scope: `data-theme` here covers the
 * chrome and the page inside it, which is what a visitor's browser does. The
 * site's palette rules (globals.css) resolve every token beneath it, so a
 * window previewing light inside a dark shell really repaints.
 */
export function DemoBrowserFrame({
  children,
  path,
  loading = false,
  theme,
  onThemeChange,
  themeHint,
  leading,
  trailing,
  className,
  barClassName,
}: DemoBrowserFrameProps) {
  return (
    <div
      data-lenis-prevent
      data-theme={theme}
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-background text-foreground',
        className,
      )}
    >
      <div
        className={cn(
          // Opaque on purpose: the bar's own snapshot has to hide whatever
          // flies under it during a view transition (see transition-demo.css).
          // Same tint as `bg-muted/40` over the frame's background, flattened.
          'flex items-center gap-2 border-b border-border bg-[color-mix(in_oklab,var(--muted)_40%,var(--background))] px-3 py-2',
          barClassName,
        )}
      >
        {leading}
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
          {loading ? (
            <Spinner className="size-3.5 shrink-0" />
          ) : (
            <IconWorld className="size-3.5 shrink-0" aria-hidden />
          )}
          <span className="truncate">suits-sandals.com{path}</span>
        </div>
        {onThemeChange ? (
          <WindowThemeButton theme={theme ?? 'light'} onChange={onThemeChange} hint={themeHint} />
        ) : null}
        {trailing}
      </div>
      {children}
    </div>
  )
}

/**
 * The window's palette control, in the chrome rather than the demo's GUI: it
 * describes the page being previewed, not the effect, so it never belongs in
 * the panel the copy button reads.
 */
function WindowThemeButton({
  theme,
  onChange,
  hint,
}: {
  theme: Theme
  onChange: (theme: Theme) => void
  hint?: string
}) {
  const other: Theme = theme === 'dark' ? 'light' : 'dark'
  const label = other === 'dark' ? 'Dark' : 'Light'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onChange(other)}
      aria-label={`Preview the page in ${other} mode`}
      title={`Themes the window — chrome and page — in ${other} mode.${hint ? ` ${hint}` : ''}`}
    >
      {other === 'dark' ? <IconMoon aria-hidden /> : <IconSun aria-hidden />}
      {label}
    </Button>
  )
}
