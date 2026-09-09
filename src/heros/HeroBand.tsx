'use client'

import type React from 'react'
import {
  createContext,
  createElement,
  type RefObject,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { onChromeScroll, pageFrameFrozen } from '@/components/SiteChrome/chrome-scroll'
import { CHROME_THEME_SITE, type ChromeBar, useChromeThemeStore } from '@/providers/ChromeTheme'
import type { Theme } from '@/providers/Theme/types'

/** How a band plays the page intro (globals.css "Page intro"). */
export type HeroIntroMode = 'auto' | 'cold' | 'warm'
type HeroIntroPhase = 'cold' | 'warm' | 'settled'

/**
 * True once any intro band has mounted in this document: the first mount is
 * a real page load, every later one a client navigation. Never mutated on
 * the server (effects do not run there), so SSR always renders `cold`,
 * which is also what the client's first render computes, so hydration
 * matches.
 */
let documentIntroPlayed = false

const HeroIntroSettledContext = createContext(true)

/**
 * `false` while the enclosing band's page intro is still playing, `true`
 * otherwise (no intro, settled, reduced motion, or no band at all). Gate
 * work that must not composite under the intro (a WebGL canvas) on it.
 */
export const useHeroIntroSettled = (): boolean => use(HeroIntroSettledContext)

/**
 * The band's intro phase. Cold or warm is decided in the state initializer,
 * so it is in the server markup and the hydration render; `settled` lands
 * when every `intro-*` CSS animation inside the band has finished. Reading
 * them through `getAnimations` rather than a timer keeps the tokens in
 * globals.css as the only timing source, and a mount that arrives after the
 * animations already ended (slow hydration) settles at once because nothing
 * is left to wait for.
 */
function useHeroIntro(
  ref: RefObject<HTMLElement | null>,
  intro: HeroIntroMode | undefined,
): HeroIntroPhase | undefined {
  const [phase, setPhase] = useState<HeroIntroPhase | undefined>(() => {
    if (!intro) return undefined
    if (intro !== 'auto') return intro
    return documentIntroPlayed ? 'warm' : 'cold'
  })

  useEffect(() => {
    if (!intro) return
    documentIntroPlayed = true
    const band = ref.current
    // No Web Animations (jsdom, very old engines): nothing to wait for.
    if (!band || typeof band.getAnimations !== 'function') {
      setPhase('settled')
      return
    }
    const intros = band
      .getAnimations({ subtree: true })
      .filter(
        (animation) =>
          animation instanceof CSSAnimation && animation.animationName.startsWith('intro-'),
      )
    let cancelled = false
    Promise.allSettled(intros.map((animation) => animation.finished)).then(() => {
      if (!cancelled) setPhase('settled')
    })
    return () => {
      cancelled = true
    }
  }, [intro, ref])

  return phase
}

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
  /**
   * The band sits under both fixed bars at rest (it pulls under the header
   * and fills the first screen), so the bars should already be on its
   * palette at first paint: stamps `data-hero-band-pin`, which globals.css
   * uses to paint the bars before the ChromeTheme store can (the store is
   * written from this band's effect, after hydration). Never set it on a
   * band that starts below the header: a pinned plate over any sliver of
   * page carries the wrong ink.
   */
  pinsChromeAtLoad?: boolean
  /**
   * Play the page intro (globals.css "Page intro"): `auto` plays the cold
   * choreography on the document's first intro band and the warm one on
   * later mounts; `cold` / `warm` force a phase (stories, demos). Stamps
   * `data-page-intro`; descendants mark their copy with `data-intro` plus an
   * inline `--intro-slot`, and a cold band renders a `data-intro-cover`.
   */
  intro?: HeroIntroMode
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
  pinsChromeAtLoad = false,
  intro,
  children,
  ...props
}) => {
  const ref = useRef<HTMLElement>(null)
  useHeroChromeTheme(ref, theme)
  const phase = useHeroIntro(ref, intro)
  return createElement(
    as,
    {
      ...props,
      'data-theme': theme,
      ...(pinsChromeAtLoad ? { 'data-hero-band-pin': theme } : {}),
      ...(phase ? { 'data-page-intro': phase } : {}),
      ref,
    },
    <HeroIntroSettledContext value={phase === undefined || phase === 'settled'}>
      {children}
    </HeroIntroSettledContext>,
  )
}
