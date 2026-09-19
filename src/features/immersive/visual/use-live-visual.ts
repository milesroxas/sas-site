'use client'

import { type RefObject, useCallback, useEffect, useId, useRef, useState } from 'react'
import { useHydrated } from '@/hooks/use-hydrated'
import { useNearViewport } from '@/hooks/use-near-viewport'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { GPU_PRIORITY, type GpuLeaseKind } from '@/lib/webgl/gpu-budget'
import { useGpuLease } from '@/lib/webgl/use-gpu-lease'
import type { StreakCapability } from './capability'
import {
  useCoarsePointer,
  useDocumentVisible,
  useMotionPaused,
  usePageCovered,
  useStreakCapability,
} from './hooks'
import type { VisualPlacement } from './placement'
import { CROSSFADE_MS } from './poster'
import { placementAllowsLive } from './rollout'

/**
 * The life of a live effect inside a poster-first slot, whichever effect it
 * is. Only once the slot is hydrated, near the viewport, visible, uncovered,
 * allowed by policy, probed as WebGL2 without a software caveat, and admitted
 * under the document ceiling does the owner mount its canvas. The canvas
 * reveals on the first drawn frame of its generation and the poster fades
 * under it; any failure puts the poster back and never retries.
 *
 * States, exposed by the owner as `data-visual-status`: `poster`, `preparing`,
 * `live`, `suspended` (mounted, drawing nothing), `failed`.
 */
export type LiveVisualStatus = 'poster' | 'preparing' | 'live' | 'suspended' | 'failed'

/** Suspended this long, the canvas is released and the poster returns. */
const RELEASE_AFTER_MS = 8000

/** Rank on the document GPU budget: the page's media first, decoration last. */
const ADMISSION_PRIORITY: Record<VisualPlacement, number> = {
  hero: GPU_PRIORITY.hero,
  block: GPU_PRIORITY.block,
  menu: GPU_PRIORITY.backdrop,
  card: GPU_PRIORITY.overlay,
}

export type LiveVisualOptions = {
  /** The element whose place on the page decides presence. */
  rootRef: RefObject<HTMLElement | null>
  placement: VisualPlacement
  /** The kind this canvas counts as on the document GPU budget. */
  kind: GpuLeaseKind
  /** Off for a descriptor that may only ever be a poster. */
  allowed: boolean
  /** Hold the live effect until the owner's own motion has settled. */
  active: boolean
  /**
   * Everything that changes what is drawn. A new identity is a new
   * generation, so a late first frame from the previous one cannot reveal the
   * new one's blank buffer.
   */
  identity: string
  /** A requirement of this effect beyond WebGL2, read off the probe. */
  supports?: (capability: StreakCapability) => boolean
  /**
   * Stories and tests only, never reachable from CMS data: `force` skips the
   * policy, preference and device gates so the poster → live → failure
   * lifecycle can be exercised on any machine.
   */
  admission?: 'auto' | 'force'
  /** Reported on every status change, for owners and tests. */
  onStatusChange?: (status: LiveVisualStatus) => void
}

export function useLiveVisual<Reason extends string>({
  rootRef,
  placement,
  kind,
  allowed,
  active,
  identity,
  supports,
  admission = 'auto',
  onStatusChange,
}: LiveVisualOptions) {
  const id = useId()

  // Eligibility: policy first (no probe for a poster-only placement), then
  // the visitor's preferences, then the device.
  const hydrated = useHydrated()
  const policyAllows = placementAllowsLive(placement) && allowed
  const reducedMotion = usePrefersReducedMotion()
  const coarsePointer = useCoarsePointer()
  const [paused] = useMotionPaused()
  const [failure, setFailure] = useState<Reason | 'chunk' | null>(null)
  const probeWanted = hydrated && policyAllows && !reducedMotion && !coarsePointer && !failure
  const capability = useStreakCapability(probeWanted)
  // Stories only (see `admission`): the lifecycle without the gates.
  const forced = admission === 'force' && hydrated && !failure
  const eligible =
    forced ||
    (probeWanted &&
      Boolean(capability?.webgl2) &&
      !capability?.software &&
      (!supports || (capability !== null && supports(capability))))

  // Presence: draw only while near, visible, uncovered and settled.
  const near = useNearViewport(rootRef)
  const documentVisible = useDocumentVisible()
  // The menu placement is the docked window itself, inside the covering frame.
  const covered = usePageCovered(placement !== 'menu')
  const wanted = eligible && !paused && near && documentVisible && !covered && active
  const admitted = useGpuLease(id, wanted, kind, ADMISSION_PRIORITY[placement])
  const live = wanted && admitted

  // Mounting and generations. The runtime mounts on first admission and
  // stays through short suspensions; a long one releases it.
  const [mounted, setMounted] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [readyGeneration, setReadyGeneration] = useState<number | null>(null)
  const lastIdentity = useRef(identity)
  useEffect(() => {
    if (lastIdentity.current === identity) return
    lastIdentity.current = identity
    setGeneration((current) => current + 1)
    setReadyGeneration(null)
  }, [identity])
  useEffect(() => {
    if (live && !mounted && !failure) {
      setMounted(true)
      setGeneration((current) => current + 1)
      setReadyGeneration(null)
    }
  }, [live, mounted, failure])
  useEffect(() => {
    if (live || !mounted) return
    // Suspended: park, then fade the poster back over the still frame and
    // release the canvas once the crossfade has finished.
    const fade = window.setTimeout(() => setReadyGeneration(null), RELEASE_AFTER_MS)
    const release = window.setTimeout(() => setMounted(false), RELEASE_AFTER_MS + CROSSFADE_MS)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(release)
    }
  }, [live, mounted])

  const handleReady = useCallback((readyFor: number) => setReadyGeneration(readyFor), [])
  const fail = useCallback((reason: Reason | 'chunk') => {
    setFailure(reason)
    setMounted(false)
    setReadyGeneration(null)
  }, [])
  const failChunk = useCallback(() => fail('chunk'), [fail])

  const ready = mounted && readyGeneration === generation
  const status: LiveVisualStatus = failure
    ? 'failed'
    : !mounted
      ? 'poster'
      : !ready
        ? 'preparing'
        : live
          ? 'live'
          : 'suspended'
  useEffect(() => onStatusChange?.(status), [status, onStatusChange])

  return {
    status,
    failure,
    capability,
    /** The runtime should be in the tree. */
    mounted,
    /** Frames may run. */
    live,
    /** The current generation has drawn; the poster may fade. */
    ready,
    generation,
    handleReady,
    fail,
    /** For the boundary around a `lazy` runtime: a chunk that fails to load. */
    failChunk,
  }
}
