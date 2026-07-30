'use client'

import type React from 'react'
import { addTransitionType, startTransition, useRef, useState } from 'react'
import { NAV_BACK, NAV_FORWARD, NAV_LATERAL } from '@/shared/lib/view-transition'

export type SimDirection = 'forward' | 'back' | 'lateral'
export type SimPhase = 'idle' | 'network' | 'server' | 'animating'

/** Delays and animation windows read at the moment a navigation starts. */
export type SimTimings = {
  networkMs: number
  serverMs: number
  exitMs: number
  enterMs: number
  moveMs: number
  heroMs: number
}

/** One completed (or committed) simulated navigation, as the timeline plots it. */
export type SimRun<R extends string = string> = SimTimings & {
  from: R
  to: R
  /** `null` = untagged navigation — `default: 'none'`, a hard cut. */
  direction: SimDirection | null
  morph: boolean
  hero: boolean
}

const TYPE_BY_DIRECTION = {
  forward: NAV_FORWARD,
  back: NAV_BACK,
  lateral: NAV_LATERAL,
} as const

/**
 * The playground's stand-in for the Next.js app router. A navigation walks the
 * same pipeline a production tap does: dead time first (RSC fetch + server
 * render — nothing on screen reacts, exactly like production, which ships no
 * loading UI), then the route swap commits inside `startTransition` with the
 * real transition type so the real `<ViewTransition>` recipes fire.
 */
export function useSimNavigation<R extends string>(opts: {
  initialRoute: R
  /** Read fresh per navigation so GUI edits apply to the next run. */
  timingsRef: React.RefObject<SimTimings>
  /** Which independently-animating groups a from→to pair engages. */
  runFlags: (from: R, to: R) => { morph: boolean; hero: boolean }
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

  const { timingsRef, runFlags } = opts

  /** Resolves false when a newer run superseded this one. */
  const sleep = (ms: number, runId: number) =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(runIdRef.current === runId), ms)
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
    flags: { morph: boolean; hero: boolean },
  ) => {
    if (!direction) return 0
    return Math.max(
      t.exitMs + t.enterMs,
      direction !== 'lateral' ? t.moveMs : 0,
      flags.morph ? t.moveMs : 0,
      flags.hero ? t.heroMs : 0,
    )
  }

  const navigate = async (to: R, direction: SimDirection | null) => {
    const from = routeRef.current
    if (busyRef.current || to === from) return
    const runId = ++runIdRef.current
    busyRef.current = true
    const t = { ...timingsRef.current }
    const flags = runFlags(from, to)

    try {
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
      setLastRun({ from, to, direction, morph: flags.morph, hero: flags.hero, ...t })

      const animMs = animatedMs(t, direction, flags)
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
   * served from the router cache — instant, untagged, a hard cut. (One known
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
      hero: flags.hero,
      networkMs: 0,
      serverMs: 0,
      exitMs: timingsRef.current.exitMs,
      enterMs: timingsRef.current.enterMs,
      moveMs: timingsRef.current.moveMs,
      heroMs: timingsRef.current.heroMs,
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
