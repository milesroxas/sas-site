'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ReactNode, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'

gsap.registerPlugin(useGSAP)

/**
 * Every tunable the marquee reads, owned once here (same contract as
 * `SCROLL_REVEAL_*` — see docs/animations.md). Lanes run endless linear loops
 * at the same speed in alternating directions — even lanes scroll up, odd
 * lanes scroll down — and each successive lane starts offset by a fraction of
 * its first card.
 */
export const TESTIMONIALS_MARQUEE_DEFAULTS = {
  /** Seconds a column takes to travel one full loop. */
  loopDuration: 36,
  /** Vertical head start per successive column, measured in first-card heights. */
  columnCardOffset: 0.5,
  /**
   * Viewport width the marquee runs at (Tailwind `lg`). Below it the block
   * renders a swipeable rail instead and this component is `display: none`, so
   * the lanes stay unbuilt rather than measuring a hidden, zero-height track.
   */
  activeBreakpoint: '64rem',
} as const

const { loopDuration, columnCardOffset, activeBreakpoint } = TESTIMONIALS_MARQUEE_DEFAULTS

/**
 * Vertical auto-scrolling card lanes. Each column renders its cards twice and
 * loops across half its track height, so the wrap point is invisible; odd
 * lanes travel the same loop in the opposite direction. Cards fade to the
 * section's background token at the bottom edge and along an angled top-left
 * band as they enter and leave the window. Reduced motion renders the resting
 * state — static offset columns under the same fades.
 */
export function TestimonialsMarquee({
  columns,
  className,
}: {
  /** One entry per lane; each entry is that lane's rendered cards. */
  columns: ReactNode[]
  className?: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      // Gated on the breakpoint rather than run unconditionally: below it the
      // root is `display: none`, so every offset measures 0. matchMedia rebuilds
      // the lanes the moment the marquee becomes visible.
      const mm = gsap.matchMedia()

      mm.add(`(width >= ${activeBreakpoint})`, () => {
        const tracks = gsap.utils.toArray<HTMLElement>('[data-marquee-track]', rootRef.current)
        // One loop travels half a track (the duplicated copy). Lanes share one
        // pixel speed — the first lane's half height over `loopDuration` — so a
        // lane with taller content scales its duration instead of moving faster.
        const referenceHalf = (tracks[0]?.offsetHeight ?? 0) / 2

        tracks.forEach((track, index) => {
          // Head start per lane in pixels: a fraction of that lane's first card.
          const firstCard = track.firstElementChild?.firstElementChild as HTMLElement | null
          const offsetPx = index * columnCardOffset * (firstCard?.offsetHeight ?? 0)

          if (prefersReducedMotion) {
            gsap.set(track, { y: -offsetPx })
            return
          }

          const halfHeight = track.offsetHeight / 2
          // Odd lanes run the same loop in the opposite direction (downward).
          const scrollsDown = index % 2 === 1
          const tween = gsap.fromTo(
            track,
            { yPercent: scrollsDown ? -50 : 0 },
            {
              yPercent: scrollsDown ? 0 : -50,
              duration:
                referenceHalf > 0 ? loopDuration * (halfHeight / referenceHalf) : loopDuration,
              ease: 'none',
              repeat: -1,
            },
          )
          // Express the pixel offset as loop progress to keep the lane gap-free.
          if (halfHeight > 0) tween.progress((offsetPx / halfHeight) % 1)
        })
      })
    },
    { scope: rootRef, dependencies: [prefersReducedMotion, columns.length], revertOnUpdate: true },
  )

  return (
    <div className={cn('relative overflow-hidden', className)} ref={rootRef}>
      <div className={cn('grid h-full gap-6', columns.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
        {columns.map((column, columnIndex) => (
          <div key={columnIndex}>
            <div className="flex flex-col" data-marquee-track>
              {[0, 1].map((copy) => (
                <div
                  aria-hidden={copy === 1 || undefined}
                  className="flex flex-col gap-6 pb-6"
                  key={copy}
                >
                  {column}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Fade divs to the background token so cards dissolve at the window edges
          instead of clipping. The top band's gradient is angled from the top-left:
          it clears the whole top edge, deepest over the left lane and easing off
          toward the right. pointer-events-none keeps card text selectable
          beneath them. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-[linear-gradient(165deg,var(--background)_12%,transparent_68%),linear-gradient(to_bottom,var(--background),transparent_30%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-[linear-gradient(to_top,var(--background),transparent)]"
      />
    </div>
  )
}
