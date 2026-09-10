'use client'

import type React from 'react'
import { addTransitionType, startTransition, useRef, useState } from 'react'
import { NAV_BACK, NAV_FORWARD, NAV_LATERAL, WORK_OPEN } from '@/shared/lib/view-transition'
import type { HeroLandingPlan } from '@/shared/ui/hero-landing'

export type SimDirection = 'forward' | 'back' | 'lateral' | 'work-open'
export type SimPhase = 'idle' | 'network' | 'server' | 'animating'

/** Delays and animation windows read at the moment a navigation starts. */
export type SimTimings = {
  networkMs: number
  serverMs: number
  /** The mask reveal, the default recipe's single beat (`--vt-duration-reveal`). */
  revealMs: number
  /** Post-image shared-element morph window (`--vt-duration-move`). */
  moveMs: number
  /** Work takeover: the old page's fade out (`--vt-duration-exit`). */
  exitMs: number
  /** Work takeover: the new page's fade in under the full-screen media (`--vt-duration-enter`). */
  enterMs: number
  /** Work takeover: the spotlight's vertical glide to center (`--vt-duration-hero-center`). */
  centerMs: number
  /** Work takeover: the expand about its own center to full screen (`--vt-duration-hero-expand`). */
  expandMs: number
}

/** One completed (or committed) simulated navigation, as the timeline plots it. */
export type SimRun<R extends string = string> = SimTimings & {
  from: R
  to: R
  /** `null` = untagged navigation: `default: 'none'`, a hard cut. */
  direction: SimDirection | null
  morph: boolean
  /**
   * The hero landing a takeover plays once the media holds the screen,
   * measured against the destination's own hero (an axis already home drops
   * out of the plan). `null` for every other run.
   */
  landing: HeroLandingPlan | null
}

const TYPE_BY_DIRECTION = {
  forward: NAV_FORWARD,
  back: NAV_BACK,
  lateral: NAV_LATERAL,
  'work-open': WORK_OPEN,
} as const

/** Seconds from the landing's start until its dissolve is done, as ms. */
const landingMs = (plan: HeroLandingPlan) => (plan.settle.at + plan.settle.duration) * 1000

/**
 * The playground's stand-in for the Next.js app router. A navigation walks the
 * same pipeline a production tap does: dead time first (RSC fetch + server
 * render; nothing on screen reacts, exactly like production, which ships no
 * loading UI), then the route swap commits inside `startTransition` with the
 * real transition type so the real `<ViewTransition>` recipes fire.
 */
export function useSimNavigation<R extends string>(opts: {
  initialRoute: R
  /** Read fresh per navigation so GUI edits apply to the next run. */
  timingsRef: React.RefObject<SimTimings>
  /** Which independently-animating groups a from -> to pair engages. */
  runFlags: (from: R, to: R) => { morph: boolean }
  /**
   * Runs before a navigation's dead time. The simulator uses it to put the
   * window where the run needs it (full screen for a takeover, which measures
   * the real viewport). Awaited, so layout has settled before anything is
   * captured.
   */
  prepare?: (to: R, direction: SimDirection | null) => void | Promise<void>
  /**
   * After a takeover commits: the landing the destination's hero produces.
   * Called once the new page has painted, so the hero can be measured.
   */
  planLanding?: () => HeroLandingPlan | null
}) {
  const [route, setRoute] = useState(opts.initialRoute)
  const [phase, setPhase] = useState<SimPhase>('idle')
  const [lastRun, setLastRun] = useState<SimRun<R> | null>(null)
  const [history, setHistory] = useState<R[]>([])

  const routeRef = useRef(route)
  routeRef.current = route
  const busyRef = useRef(false)
  const runIdRef = useRef(0)
  const lastNavRef = useRef<{ from: R; to: R; direction: SimDirection | null } | null>(null)

  const { timingsRef, runFlags, prepare, planLanding } = opts

  /** Resolves false when a newer run superseded this one. */
  const sleep = (ms: number, runId: number) =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(runIdRef.current === runId), ms)
    })

  /**
   * Resolves false when a newer run superseded this one. A started view
   * transition suspends rendering (and with it rAF) until React's update
   * callback settles, so frames counted here land after the capture, once
   * the destination is laid out and painting.
   */
  const nextFrames = (count: number, runId: number) =>
    new Promise<boolean>((resolve) => {
      const step = (left: number) => {
        if (left === 0) {
          resolve(runIdRef.current === runId)
          return
        }
        requestAnimationFrame(() => step(left - 1))
      }
      step(count)
    })

  const commit = (to: R, direction: SimDirection | null) => {
    startTransition(() => {
      if (direction) addTransitionType(TYPE_BY_DIRECTION[direction])
      setRoute(to)
    })
  }

  /** The longest of the concurrent animation tracks a run engages. */
  const animatedMs = (
    t: SimTimings,
    direction: SimDirection | null,
    flags: { morph: boolean },
    landing: HeroLandingPlan | null,
  ) => {
    if (!direction) return 0
    if (direction === 'work-open') {
      // Strictly sequential beats: exit, center, expand, then the landing and
      // the page's fade in run together under the full-screen media.
      const approach = t.exitMs + t.centerMs + t.expandMs
      return approach + Math.max(t.enterMs, landing ? landingMs(landing) : 0)
    }
    return Math.max(t.revealMs, flags.morph ? t.moveMs : 0)
  }

  const navigate = async (to: R, direction: SimDirection | null) => {
    const from = routeRef.current
    if (busyRef.current || to === from) return
    const runId = ++runIdRef.current
    busyRef.current = true
    const t = { ...timingsRef.current }
    const flags = runFlags(from, to)

    try {
      await prepare?.(to, direction)
      if (runIdRef.current !== runId) return

      if (t.networkMs > 0) {
        setPhase('network')
        if (!(await sleep(t.networkMs, runId))) return
      }
      if (t.serverMs > 0) {
        setPhase('server')
        if (!(await sleep(t.serverMs, runId))) return
      }

      lastNavRef.current = { from, to, direction }
      setHistory((stack) => [...stack, from])
      commit(to, direction)

      let landing: HeroLandingPlan | null = null
      if (direction === 'work-open') {
        // The destination's hero has to be laid out before it can be
        // measured; two frames cover the commit and its first paint.
        if (!(await nextFrames(2, runId))) return
        landing = planLanding?.() ?? null
      }
      setLastRun({ from, to, direction, morph: flags.morph, landing, ...t })

      const animMs = animatedMs(t, direction, flags, landing)
      if (animMs > 0) {
        setPhase('animating')
        if (!(await sleep(animMs, runId))) return
      }
    } finally {
      if (runIdRef.current === runId) {
        busyRef.current = false
        setPhase('idle')
      }
    }
  }

  /**
   * Real browser back: popstate navigations carry no transition type and are
   * served from the router cache: instant, untagged, a hard cut. (One known
   * divergence: production restores scroll on back; the mock scroller remounts
   * per route, so back lands at the top here.)
   */
  const browserBack = () => {
    if (busyRef.current || history.length === 0) return
    const prev = history[history.length - 1]
    const from = routeRef.current
    setHistory((stack) => stack.slice(0, -1))
    lastNavRef.current = { from, to: prev, direction: null }
    commit(prev, null)
    const flags = runFlags(from, prev)
    setLastRun({
      from,
      to: prev,
      direction: null,
      morph: flags.morph,
      landing: null,
      ...timingsRef.current,
      networkMs: 0,
      serverMs: 0,
    })
  }

  /** Hard-cuts back to the last run's origin, then re-runs it with current settings. */
  const replay = async () => {
    const nav = lastNavRef.current
    if (!nav || busyRef.current) return
    if (routeRef.current !== nav.from) {
      busyRef.current = true
      commit(nav.from, null)
      await new Promise((resolve) => setTimeout(resolve, 120))
      busyRef.current = false
    }
    void navigate(nav.to, nav.direction)
  }

  return {
    route,
    phase,
    lastRun,
    canGoBack: history.length > 0,
    navigate,
    browserBack,
    replay,
  }
}
