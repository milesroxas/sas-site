'use client'

import { useEffect } from 'react'
import type { CarouselApi } from '@/components/ui/carousel'

export const CAROUSEL_EDGE_FADE_DEFAULTS = {
  /**
   * Pan distance, in px, over which an edge fade grows from nothing to its
   * full width. Matches `--scroll-fade-reveal`'s default in globals.css
   * (`calc(var(--spacing) * 24)` = 6rem), so a dragged rail ramps in over the
   * same distance as the site's native scroll rails.
   */
  revealPx: 96,
} as const

/**
 * Drives the `drag-fade-x` mask on an embla viewport from embla's own scroll
 * position — the single source of truth the block carousel's per-frame writer
 * already uses (see `src/blocks/Carousel/use-carousel-effects.ts`), so the
 * fade can never lag or disagree with where the track actually is.
 *
 * The site's other rails get this free from `scroll-fade-x`, which rides
 * `animation-timeline: scroll(self inline)`. Embla translates its track and
 * never scrolls, so that timeline would sit at progress 0 forever.
 *
 * Only the two 0..1 ramp factors are written; the mask's width stays in CSS,
 * which is what makes the server-rendered rest state correct before this runs.
 * Values are quantised to a hundredth and skipped when unchanged, so a frame
 * that lands on the same value does not repaint the mask.
 */
export function useCarouselEdgeFade(api: CarouselApi) {
  useEffect(() => {
    if (!api) return
    const viewport = api.rootNode()
    const { revealPx } = CAROUSEL_EDGE_FADE_DEFAULTS
    let lastStart = -1
    let lastEnd = -1

    const write = () => {
      const total = api.internalEngine().limit.length
      // Rubber-band overshoot puts progress slightly outside 0..1.
      const panned = Math.min(Math.max(api.scrollProgress(), 0), 1) * total
      const start = Math.round(Math.min(panned / revealPx, 1) * 100) / 100
      const end = Math.round(Math.min((total - panned) / revealPx, 1) * 100) / 100

      if (start !== lastStart) {
        viewport.style.setProperty('--drag-fade-ks', String(start))
        lastStart = start
      }
      if (end !== lastEnd) {
        viewport.style.setProperty('--drag-fade-ke', String(end))
        lastEnd = end
      }
    }

    write()
    api.on('scroll', write)
    api.on('reInit', write)

    return () => {
      api.off('scroll', write)
      api.off('reInit', write)
      viewport.style.removeProperty('--drag-fade-ks')
      viewport.style.removeProperty('--drag-fade-ke')
    }
  }, [api])
}
