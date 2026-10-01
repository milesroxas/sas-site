'use client'

import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { onChromeScroll, pageFrameFrozen } from '@/components/SiteChrome/chrome-scroll'
import { useSiteTheme } from '@/hooks/use-site-theme'
import type { Theme } from '@/providers/Theme/types'
import { GROUND_SCOPE_SELECTOR, readGround } from '@/utilities/ground'
import { type ContentsEntry, collectContentsEntries } from './headings'

/**
 * A section becomes current once its heading rises past this fraction of the
 * viewport: below the landing line of a jump (header height plus air), so the
 * row a reader picks is the row that lights up.
 */
const ACTIVATION_LINE = 0.35

type Tracking = {
  /** Index of the section being read, `-1` above the first heading. */
  current: number
  /** False over the hero (no heading has passed the fold) and the closing band. */
  visible: boolean
  /**
   * The polarity of the band under the button (a hero, an inverted Section,
   * the always-dark panel), or undefined over the page itself.
   */
  ground: Theme | undefined
}

const AT_REST: Tracking = { current: -1, visible: false, ground: undefined }

/**
 * Everything the Contents button derives from scroll, from cached geometry.
 *
 * Same contract as the chrome's hero pin (`useHeroChromeTheme`): edges are
 * measured once, in document space, and every scroll is arithmetic against
 * them with no layout read (docs/animations.md, "Nothing forces layout in a
 * scroll handler"). Scroll arrives through the chrome's one subscription, so
 * nothing runs while the takeover menu holds the page frame and the thaw
 * re-runs it; a measure that lands during the dock is deferred to that thaw,
 * because every rect inside a docked frame is scaled.
 *
 * React state changes only when a value flips. The progress ring moves every
 * frame, so it is written straight to the circle and never renders.
 */
export function useContentsTracking(
  anchorRef: RefObject<HTMLElement | null>,
  ringRef: RefObject<SVGCircleElement | null>,
) {
  const [entries, setEntries] = useState<ContentsEntry[]>([])
  const [tracking, setTracking] = useState(AT_REST)
  const trackingRef = useRef(AT_REST)
  const siteTheme = useSiteTheme()

  // Layout effect, so the ids exist before the route's hash scroll
  // (`LenisRouteReset`, an ancestor's layout effect) looks one up.
  useLayoutEffect(() => {
    const article = anchorRef.current?.closest('article')
    if (!article) return
    const collected = collectContentsEntries(article)
    setEntries(collected.entries)
    return collected.restore
  }, [anchorRef])

  // biome-ignore lint/correctness/useExhaustiveDependencies: `siteTheme` is a re-measure cue. An inverted band's ground flips with it, and `readGround` reads that from the stylesheet, not from this value.
  useEffect(() => {
    const anchor = anchorRef.current
    const article = anchor?.closest('article')
    if (!anchor || !article || entries.length === 0) return

    let tops: number[] = []
    let bands: { top: number; bottom: number; ground: Theme }[] = []
    let articleBottom = 0
    let viewportHeight = 0
    let anchorCenter = 0
    let scrollY = 0
    let stale = true
    let frame = 0

    const measure = () => {
      if (pageFrameFrozen()) return
      scrollY = window.scrollY
      viewportHeight = window.innerHeight
      tops = entries.map((entry) => entry.element.getBoundingClientRect().top + scrollY)
      articleBottom = article.getBoundingClientRect().bottom + scrollY
      // Document order puts a nested ground after the band holding it, so
      // the last band under the button (`apply`) is the innermost one.
      bands = Array.from(article.querySelectorAll(GROUND_SCOPE_SELECTOR))
        // The anchor wears `data-theme` itself while it floats over a band,
        // and it is fixed: measured then, it would count as a band of its
        // own, pinned wherever the button sat at that scroll position.
        .filter((band) => !anchor.contains(band))
        .map((band) => {
          const rect = band.getBoundingClientRect()
          return {
            top: rect.top + scrollY,
            bottom: rect.bottom + scrollY,
            ground: readGround(band),
          }
        })
      const anchorRect = anchor.getBoundingClientRect()
      anchorCenter = anchorRect.top + anchorRect.height / 2
      stale = false
    }

    const apply = () => {
      const line = scrollY + viewportHeight * ACTIVATION_LINE
      const fold = scrollY + viewportHeight
      let current = -1
      while (current + 1 < tops.length && tops[current + 1] <= line) current++

      // Complete when the last section becomes current, or the article ends.
      const end = Math.min(tops[tops.length - 1] - (line - scrollY), articleBottom - viewportHeight)
      const progress = end > 0 ? Math.min(Math.max(scrollY / end, 0), 1) : 1
      ringRef.current?.style.setProperty('stroke-dashoffset', String(1 - progress))

      const point = scrollY + anchorCenter
      let ground: Theme | undefined
      for (const band of bands) if (band.top <= point && band.bottom >= point) ground = band.ground
      const next: Tracking = {
        current,
        visible: tops[0] < fold && articleBottom > fold,
        ground,
      }
      const last = trackingRef.current
      if (
        next.current === last.current &&
        next.visible === last.visible &&
        next.ground === last.ground
      )
        return
      trackingRef.current = next
      setTracking(next)
    }

    // One pass per frame, every read before any write.
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (stale) measure()
        if (!stale) apply()
      })
    }
    const invalidate = () => {
      stale = true
      schedule()
    }

    const unsubscribe = onChromeScroll((next) => {
      scrollY = next
      schedule()
    })
    const resizeObserver = new ResizeObserver(invalidate)
    resizeObserver.observe(article)
    window.addEventListener('resize', invalidate)
    invalidate()

    return () => {
      unsubscribe()
      resizeObserver.disconnect()
      window.removeEventListener('resize', invalidate)
      cancelAnimationFrame(frame)
    }
  }, [anchorRef, ringRef, entries, siteTheme])

  return { entries, ...tracking }
}
