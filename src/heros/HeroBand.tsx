'use client'

import type React from 'react'
import { createElement, type RefObject, useLayoutEffect, useRef } from 'react'
import { CHROME_THEME_SITE, type ChromeTheme, useChromeTheme } from '@/providers/ChromeTheme'
import type { Theme } from '@/providers/Theme/types'

/** The fixed bars the band can sit under. Both are outside the page frame. */
const SITE_HEADER_SELECTOR = '[data-site-header]'
const SITE_FOOTER_SELECTOR = '[data-site-footer]'
const PAGE_FRAME_SELECTOR = '[data-page-frame]'

const sameChromeTheme = (a: ChromeTheme, b: ChromeTheme) =>
  a.header === b.header && a.footer === b.footer

/**
 * Pins the site chrome to the band's palette for exactly as long as the band
 * is under it, and releases it as the band scrolls out.
 *
 * Derived, never toggled: every scroll and resize recomputes both bars from
 * the band's live bottom edge against the bars' own rects, so a fast scroll,
 * a resize mid-scroll, or a route change cannot leave a stale pin behind.
 * The header lets go once the band's bottom edge rises above the header's
 * bottom edge; the footer as soon as the band's bottom edge rises above the
 * footer's top edge (earlier, since the footer sits at the bottom of the
 * viewport). Unmount releases both.
 *
 * The takeover menu freezes the page frame (`inert`, `position: fixed`,
 * scaled) for the whole open: the document collapses, `scrollY` snaps to 0
 * and every rect inside the frame is scaled, so nothing is measured while
 * that attribute is present (the header's scrolled state skips the same
 * window, see docs/animations.md). A route that commits mid-dock (menu link,
 * hero handoff) mounts its band in that state; the attribute observer runs
 * the measurement once `restoreFrame` drops `inert`, which it does after the
 * scroll offset is final, so the first read is already correct.
 *
 * A layout effect so the initial pin lands in the hydration commit, before
 * the first client paint: the bars go straight to the band's palette instead
 * of painting the site theme for a frame and then fading.
 */
function useHeroChromeTheme(ref: RefObject<HTMLElement | null>, theme: Theme) {
  const { setChromeTheme } = useChromeTheme()

  useLayoutEffect(() => {
    const band = ref.current
    if (!band) return
    const header = document.querySelector<HTMLElement>(SITE_HEADER_SELECTOR)
    const footer = document.querySelector<HTMLElement>(SITE_FOOTER_SELECTOR)
    // Demo routes render without the site chrome: nothing to pin.
    if (!header && !footer) return
    const frame = band.closest<HTMLElement>(PAGE_FRAME_SELECTOR)

    const measure = () => {
      if (frame?.hasAttribute('inert')) return
      const bandBottom = band.getBoundingClientRect().bottom
      const next: ChromeTheme = {
        header: header && bandBottom > header.getBoundingClientRect().bottom ? theme : null,
        footer: footer && bandBottom > footer.getBoundingClientRect().top ? theme : null,
      }
      setChromeTheme((prev) => (sameChromeTheme(prev, next) ? prev : next))
    }

    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    const frameObserver = frame ? new MutationObserver(measure) : null
    if (frame) frameObserver?.observe(frame, { attributes: true, attributeFilter: ['inert'] })

    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      frameObserver?.disconnect()
      setChromeTheme(CHROME_THEME_SITE)
    }
  }, [ref, theme, setChromeTheme])
}

type HeroBandProps = React.HTMLAttributes<HTMLElement> & {
  /** Root element; heroes are landmarks or sections, never anonymous boxes by default. */
  as?: 'div' | 'header' | 'section'
  /** The band's own palette. Pinned on the element and mirrored onto the chrome above it. */
  theme?: Theme
}

/**
 * The root of a hero that paints its own palette: stamps `data-theme` on the
 * band (the same section-level pin every hero uses) and keeps the fixed
 * header and footer on that palette while they overlap it. One prop drives
 * both, so the band and the chrome over it can never disagree.
 */
export const HeroBand: React.FC<HeroBandProps> = ({
  as = 'section',
  theme = 'dark',
  children,
  ...props
}) => {
  const ref = useRef<HTMLElement>(null)
  useHeroChromeTheme(ref, theme)
  return createElement(as, { ...props, 'data-theme': theme, ref }, children)
}
