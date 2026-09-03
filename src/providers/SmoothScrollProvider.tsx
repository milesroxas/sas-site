'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'
import type { LenisOptions } from 'lenis'
import { useLenis } from 'lenis/react'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { SmoothScroll } from '@/lib/interactions/smooth-scroll'

/**
 * Lenis is the only writer of the document scroll position: every
 * programmatic scroll on the site goes through `lenis.scrollTo`. ScrollTrigger
 * features that move the page (the featured work roll's `snap`) write
 * `window.scrollTo` natively by default, and Lenis ignores native scroll
 * events while its own ease is still running, so a snap that fires in that
 * tail alternates writes with Lenis every frame and Lenis stamps its stale
 * position back when it completes: the page jumps and the snap re-fires.
 *
 * The scroller proxy routes ScrollTrigger's writes through Lenis instead.
 * `immediate` lands the value this frame and resets Lenis's own animation, so
 * the tween owns the motion and Lenis's target stays exactly where the page
 * is when the next input arrives. Reads stay native: ScrollTrigger measures
 * what is painted, as it did before. Without a root Lenis (reduced motion,
 * provider unmounted) the proxy is the native default.
 *
 * Registered at module level, like `gsap.registerPlugin`: a trigger captures
 * its scroll functions when it is created, and page effects run before this
 * provider's, so the proxy has to exist before the first trigger does.
 */
let rootLenis: Lenis | null = null

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.scrollerProxy(window, {
    scrollTop(value?: number) {
      if (value !== undefined) {
        // A stopped or locked Lenis drops the write; ScrollTrigger reads the
        // unchanged position back and ends the tween as an interruption.
        if (rootLenis) rootLenis.scrollTo(value, { immediate: true })
        else window.scrollTo(window.scrollX, value)
      }
      return window.scrollY
    },
  })
}

/** Binds the root Lenis instance to the scroller proxy for its lifetime. */
const LenisScrollTriggerWriter: React.FC = () => {
  const lenis = useLenis()
  useEffect(() => {
    rootLenis = lenis ?? null
    return () => {
      rootLenis = null
    }
  }, [lenis])
  return null
}

function shouldPreventLenisSmooth(node: HTMLElement | null): boolean {
  if (!node) return false
  if (node.dataset.lenisPrevent !== undefined) return true
  if (node.closest('[data-lenis-prevent]')) return true
  if (node.closest('[role="dialog"]')) return true
  if (node.nodeName === 'VERCEL-LIVE-FEEDBACK') return true
  return false
}

/** Defaults tuned for full-site scroll: touch sync, tempus RAF, and safe prevent targets. */
export const rootLenisOptions: LenisOptions = {
  // Duration + easeOutExpo instead of lerp: quick catch-up at the start of the
  // curve keeps input responsive, while the asymptotic tail lands softly. A
  // single lerp value can't decouple those two.
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  wheelMultiplier: 1,
  touchMultiplier: 1.15,
  syncTouch: true,
  syncTouchLerp: 0.12,
  smoothWheel: true,
  anchors: true,
  autoToggle: true,
  prevent: (node) => shouldPreventLenisSmooth(node),
}

/**
 * Lenis runs in `root` mode and lives in this persistent provider, so it survives
 * navigations and keeps its previous `targetScroll`. After a navigation Next
 * scrolls the document to the top, but Lenis would snap the page back to the old
 * position — leaving the new page scrolled (e.g. landing at the bottom and breaking
 * shared-element morphs whose target is now off-screen). Reset Lenis to the top on
 * every route change — back/forward included, so directional exit animations always
 * start from the top of the incoming page. Browser scroll restoration is set to
 * `manual` while mounted so it can't fight the reset on popstate.
 *
 * The reset must be a *layout* effect. React commits the new route inside
 * `document.startViewTransition`'s update callback and the browser captures the
 * incoming page's snapshots as soon as that callback resolves. A passive effect
 * runs after that capture — and in the gap Lenis's RAF keeps lerping toward the
 * old page's scroll position, undoing Next's scroll-to-top. The new page then
 * gets snapshotted at a stale offset (shared-element targets off-screen, morphs
 * flying to nowhere) before the late reset yanks the page to the top mid-
 * animation. The layout effect runs synchronously in the same callback: scroll
 * and Lenis's internal target both sit at the destination before any snapshot
 * is taken or Lenis frame runs.
 */
const LenisRouteReset: React.FC = () => {
  const pathname = usePathname()
  const lenis = useLenis()
  const lastPathname = useRef(pathname)

  useEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  useLayoutEffect(() => {
    // Only act on an actual route change (not initial mount or lenis hydration).
    if (pathname === lastPathname.current) return
    lastPathname.current = pathname

    // Honor anchor targets (`/page#section`); everything else lands at the top.
    const anchor = window.location.hash
      ? document.getElementById(window.location.hash.slice(1))
      : null
    lenis?.scrollTo(anchor ?? 0, { immediate: true, force: true })
  }, [pathname, lenis])

  return null
}

export const SmoothScrollProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) {
    return <>{children}</>
  }

  return (
    <SmoothScroll root options={rootLenisOptions}>
      <LenisRouteReset />
      <LenisScrollTriggerWriter />
      {children}
    </SmoothScroll>
  )
}
