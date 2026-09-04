'use client'

import type React from 'react'
import { createElement, type RefObject, useLayoutEffect, useRef } from 'react'
import { onChromeScroll, pageFrameFrozen } from '@/components/SiteChrome/chrome-scroll'
import { CHROME_THEME_SITE, type ChromeBar, useChromeThemeStore } from '@/providers/ChromeTheme'
import type { Theme } from '@/providers/Theme/types'

/** The fixed bars the band can sit under. Both are outside the page frame. */
const SITE_HEADER_SELECTOR = '[data-site-header]'
const SITE_FOOTER_SELECTOR = '[data-site-footer]'
const PAGE_FRAME_SELECTOR = '[data-page-frame]'

/**
 * The bars' heights once the page is scrolled (globals.css tokens). A pin
 * releases well past the scroll threshold, so the shrunk height is the one
 * the band's edge actually meets; reading the token keeps that one source.
 */
const SCROLLED_BAR_HEIGHT_TOKEN: Record<ChromeBar, string> = {
  header: '--header-bar-height-scrolled',
  footer: '--footer-bar-height-scrolled',
}

function scrolledBarHeight(bar: ChromeBar, element: HTMLElement): number {
  const rootStyle = getComputedStyle(document.documentElement)
  const value = rootStyle.getPropertyValue(SCROLLED_BAR_HEIGHT_TOKEN[bar]).trim()
  if (value.endsWith('rem')) {
    return Number.parseFloat(value) * Number.parseFloat(rootStyle.fontSize)
  }
  if (value.endsWith('px')) return Number.parseFloat(value)
  // Token missing (a shell without globals.css): the bar as rendered.
  return element.getBoundingClientRect().height
}

/**
 * Pins the site chrome to the band's palette for exactly as long as the band
 * is entirely behind each bar, and releases it as the band scrolls out.
 *
 * A pinned bar lifts its plate so the band's media runs under it, which is
 * only safe while nothing but the band shows through: any sliver of page
 * would carry the wrong ink. So a bar is pinned while the band's document
 * span contains the bar's, and on the site theme otherwise (a solid plate is
 * always safe). The header lets go once the band's bottom edge rises above
 * the header's bottom edge; the footer as soon as the band's bottom edge
 * rises above the viewport bottom (earlier, since the footer sits there). A
 * band that starts below the header's top edge is not behind the header at
 * rest and pins it only once it has scrolled fully under.
 *
 * Geometry is measured once and refreshed only when something can move it
 * (resize, the band's own box changing, the page frame thawing); a scroll is
 * arithmetic against the cached edges, with no layout read. The chrome
 * scroll subscription (`components/SiteChrome/chrome-scroll`) is the one
 * `scroll` listener the chrome owns and the one place that knows when the
 * frame is frozen by the takeover menu: nothing is measured or applied while
 * it is docked, and the thaw runs the subscription once the frame is back in
 * flow at its final scroll offset (docs/animations.md).
 *
 * A layout effect so the initial pin lands in the same commit as the band,
 * before the next paint: the bars go straight to the band's palette instead
 * of painting the site theme for a frame and then fading.
 */
function useHeroChromeTheme(ref: RefObject<HTMLElement | null>, theme: Theme) {
  const store = useChromeThemeStore()

  useLayoutEffect(() => {
    const band = ref.current
    if (!band) return
    const header = document.querySelector<HTMLElement>(SITE_HEADER_SELECTOR)
    const footer = document.querySelector<HTMLElement>(SITE_FOOTER_SELECTOR)
    // Demo routes render without the site chrome: nothing to pin.
    if (!header && !footer) return
    const frame = band.closest<HTMLElement>(PAGE_FRAME_SELECTOR)

    // Document-space edges of the band; viewport-space edges of the fixed
    // bars (constant between refreshes, so the sum is a document edge).
    let measured = false
    let bandTop = 0
    let bandBottom = 0
    let headerTop = 0
    let headerBottom = 0
    let footerTop = 0
    let footerBottom = 0

    const apply = (scrollY: number) => {
      if (!measured) return
      store.write({
        header:
          header && bandTop <= scrollY + headerTop && bandBottom >= scrollY + headerBottom
            ? theme
            : null,
        footer:
          footer && bandTop <= scrollY + footerTop && bandBottom >= scrollY + footerBottom
            ? theme
            : null,
      })
    }

    const measure = () => {
      if (pageFrameFrozen()) return
      const scrollY = window.scrollY
      const rect = band.getBoundingClientRect()
      bandTop = rect.top + scrollY
      bandBottom = rect.bottom + scrollY
      if (header) {
        headerTop = header.getBoundingClientRect().top
        headerBottom = headerTop + scrolledBarHeight('header', header)
      }
      if (footer) {
        footerBottom = footer.getBoundingClientRect().bottom
        footerTop = footerBottom - scrolledBarHeight('footer', footer)
      }
      measured = true
      apply(scrollY)
    }

    measure()
    const unsubscribe = onChromeScroll(apply)
    window.addEventListener('resize', measure)
    const bandObserver = new ResizeObserver(measure)
    bandObserver.observe(band)
    // Every `inert` change lands here; `measure` ignores the freeze itself.
    const frameObserver = frame ? new MutationObserver(measure) : null
    if (frame) frameObserver?.observe(frame, { attributes: true, attributeFilter: ['inert'] })

    return () => {
      unsubscribe()
      window.removeEventListener('resize', measure)
      bandObserver.disconnect()
      frameObserver?.disconnect()
      store.write(CHROME_THEME_SITE)
    }
  }, [ref, theme, store])
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
 * header and footer on that palette while they sit fully over it. One prop
 * drives both, so the band and the chrome over it can never disagree.
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
