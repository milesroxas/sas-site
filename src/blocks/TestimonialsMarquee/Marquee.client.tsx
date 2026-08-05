'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ReactNode, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'

gsap.registerPlugin(useGSAP)

/**
 * Every tunable the marquee reads, owned once here (same contract as
 * `SCROLL_REVEAL_*` — see docs/animations.md). Columns scroll upward on an
 * endless linear loop; each successive column runs a longer loop and starts
 * further into it, so the lanes stay offset and drift apart over time.
 */
export const TESTIMONIALS_MARQUEE_DEFAULTS = {
  /** Seconds the first column takes to travel one full loop. */
  loopDuration: 36,
  /** Extra loop seconds per successive column, so lanes never sync up. */
  columnDurationStep: 6,
  /** Vertical head start per successive column, measured in first-card heights. */
  columnCardOffset: 0.5,
} as const

const { loopDuration, columnDurationStep, columnCardOffset } = TESTIMONIALS_MARQUEE_DEFAULTS

/**
 * Vertical auto-scrolling card lanes. Each column renders its cards twice and
 * loops `yPercent: -50`, so the wrap point is invisible. Cards fade to the
 * section's background token at the bottom edge and along an angled top-right
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
      const tracks = gsap.utils.toArray<HTMLElement>('[data-marquee-track]', rootRef.current)
      tracks.forEach((track, index) => {
        // Head start per lane in pixels: a fraction of that lane's first card.
        const firstCard = track.firstElementChild?.firstElementChild as HTMLElement | null
        const offsetPx = index * columnCardOffset * (firstCard?.offsetHeight ?? 0)

        if (prefersReducedMotion) {
          gsap.set(track, { y: -offsetPx })
          return
        }

        const tween = gsap.to(track, {
          yPercent: -50,
          duration: loopDuration + index * columnDurationStep,
          ease: 'none',
          repeat: -1,
        })
        // One loop travels half the track (the duplicated copy), so express
        // the pixel offset as loop progress to keep the lane gap-free.
        const halfHeight = track.offsetHeight / 2
        if (halfHeight > 0) tween.progress((offsetPx / halfHeight) % 1)
      })
    },
    { scope: rootRef, dependencies: [prefersReducedMotion, columns.length], revertOnUpdate: true },
  )

  return (
    <div className={cn('relative overflow-hidden', className)} ref={rootRef}>
      <div
        className={cn(
          'grid h-full gap-4 md:gap-6',
          columns.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
        )}
      >
        {columns.map((column, columnIndex) => (
          <div key={columnIndex}>
            <div className="flex flex-col" data-marquee-track>
              {[0, 1].map((copy) => (
                <div
                  aria-hidden={copy === 1 || undefined}
                  className="flex flex-col gap-4 pb-4 md:gap-6 md:pb-6"
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
