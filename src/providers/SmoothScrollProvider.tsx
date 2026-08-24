'use client'

import type { LenisOptions } from 'lenis'
import { useLenis } from 'lenis/react'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { SmoothScroll } from '@/lib/interactions/smooth-scroll'

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
  lerp: 0.16,
  wheelMultiplier: 1,
  touchMultiplier: 1.15,
  syncTouch: true,
  syncTouchLerp: 0.14,
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
      {children}
    </SmoothScroll>
  )
}
