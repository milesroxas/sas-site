'use client'

import Image from 'next/image'
import {
  Component,
  type ComponentType,
  lazy,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useHydrated } from '@/hooks/use-hydrated'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'
import type { StreakFailureReason, StreakFieldRuntimeProps } from '../ui/streak-field-runtime'
import { composeStreakTuning } from './compose'
import { type StreakVisualDescriptor, serializeStreakDescriptor } from './descriptor'
import {
  useCoarsePointer,
  useDocumentVisible,
  useGroundSurface,
  useMotionPaused,
  useNearViewport,
  usePageCovered,
  useStreakCapability,
  useStreakLease,
} from './hooks'
import { STREAK_LOOKS } from './looks'
import { degradedLimits, PLACEMENT_LIMITS, type VisualPlacement } from './placement'
import { mediaPosterImage, type PosterImage, presetPosterImage } from './posters'
import { placementAllowsLive } from './rollout'

/**
 * The Streak Field as page media, poster first.
 *
 * Server HTML carries a real `<img>` poster inside a stable frame, so the
 * slot is complete without JavaScript or a GPU, the menu can clone it, and
 * the hero handoff can land on it. Only once the slot is hydrated, near the
 * viewport, visible, uncovered, allowed by policy, probed as WebGL2 without a
 * software caveat, and admitted under the document ceiling does it import
 * the runtime chunk and mount a canvas. The canvas reveals on the first drawn
 * frame of its generation and the poster fades under it; any failure puts the
 * poster back and never retries.
 *
 * States, exposed as `data-visual-status`: `poster`, `preparing`, `live`,
 * `suspended` (mounted, drawing nothing), `failed`.
 */

const StreakFieldRuntime = lazy(() =>
  import('../ui/streak-field-runtime').then((module) => ({ default: module.StreakFieldRuntime })),
) as ComponentType<StreakFieldRuntimeProps>

/** Suspended this long, the canvas is released and the poster returns. */
const RELEASE_AFTER_MS = 8000
/** The poster/canvas crossfade; the release waits it out before unmounting. */
const CROSSFADE_MS = 500

const ADMISSION_PRIORITY: Record<VisualPlacement, number> = {
  hero: 3,
  block: 2,
  menu: 1,
  card: 0,
}

export type StreakVisualStatus = 'poster' | 'preparing' | 'live' | 'suspended' | 'failed'

/** A failed runtime chunk load throws from `lazy` during render; treat it as a failure. */
class ChunkBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export type StreakVisualSurface = 'dark' | 'light' | 'auto'

export type StreakVisualProps = {
  descriptor: StreakVisualDescriptor
  placement: VisualPlacement
  /**
   * The ground the field sits on. `auto` follows the visitor's site theme
   * (page-level surfaces); a Section band passes its own polarity.
   */
  surface?: StreakVisualSurface
  /** The visual is the page's first-paint media: preload its poster. */
  priority?: boolean
  /** `sizes` for the poster, as for any responsive image. */
  sizes?: string
  /** Hold the live field until the owner's own motion has settled. */
  active?: boolean
  /** Frame classes: aspect ratio, width, corner treatment. */
  className?: string
  /** Fill the nearest positioned ancestor instead of sizing the frame. */
  fill?: boolean
  /** Poster image classes (object-fit, blend). */
  imgClassName?: string
  /** Reported on every status change, for owners and tests. */
  onStatusChange?: (status: StreakVisualStatus) => void
  /**
   * Stories and tests only, never reachable from CMS data: `force` skips the
   * policy, preference and device gates so the poster → live → failure
   * lifecycle can be exercised on any machine. The `Visual` adapter does not
   * forward it.
   */
  admission?: 'auto' | 'force'
}

type PosterSet = { light: PosterImage; dark: PosterImage; single: boolean }

const posterSet = (descriptor: StreakVisualDescriptor): PosterSet => {
  const upload = descriptor.posterMedia ? mediaPosterImage(descriptor.posterMedia) : null
  if (upload) return { light: upload, dark: upload, single: true }
  return {
    light: presetPosterImage(descriptor.look, 'light'),
    dark: presetPosterImage(descriptor.look, 'dark'),
    single: false,
  }
}

const Poster = ({
  poster,
  priority,
  sizes,
  className,
  surface,
}: {
  poster: PosterImage
  priority: boolean
  sizes: string
  className?: string
  /**
   * Which ground this still is for. `any` always shows; `light` and `dark`
   * twins are gated by globals.css ("Visual posters") on the nearest
   * `[data-theme]` or `.band-dark` ancestor, so only one paints at a time.
   */
  surface: 'any' | 'light' | 'dark'
}) => (
  <Image
    alt=""
    className={cn('absolute inset-0 size-full object-cover select-none', className)}
    data-visual-poster={surface}
    draggable={false}
    height={poster.height}
    priority={priority}
    sizes={sizes}
    src={poster.src}
    width={poster.width}
  />
)

export function StreakVisual({
  descriptor,
  placement,
  surface = 'auto',
  priority = false,
  sizes = '100vw',
  active = true,
  className,
  fill = false,
  imgClassName,
  onStatusChange,
  admission = 'auto',
}: StreakVisualProps) {
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const posters = useMemo(() => posterSet(descriptor), [descriptor])
  const serialized = useMemo(() => serializeStreakDescriptor(descriptor), [descriptor])
  const look = STREAK_LOOKS[descriptor.look]

  // Eligibility: policy first (no probe for a poster-only placement), then
  // the visitor's preferences, then the device.
  const hydrated = useHydrated()
  const policyAllows = placementAllowsLive(placement) && !descriptor.degraded
  const reducedMotion = usePrefersReducedMotion()
  const coarsePointer = useCoarsePointer()
  const [paused] = useMotionPaused()
  const [failure, setFailure] = useState<StreakFailureReason | 'chunk' | null>(null)
  const probeWanted = hydrated && policyAllows && !reducedMotion && !coarsePointer && !failure
  const capability = useStreakCapability(probeWanted)
  const [tier, setTier] = useState<'normal' | 'degraded'>('normal')
  const limits =
    tier === 'degraded' ? degradedLimits(PLACEMENT_LIMITS[placement]) : PLACEMENT_LIMITS[placement]
  const flowOk = look.motion !== 'flow' || (limits.flow && Boolean(capability?.floatTarget))
  // Stories only (see `admission`): the lifecycle without the gates.
  const forced = admission === 'force' && hydrated && !failure
  const eligible =
    forced || (probeWanted && Boolean(capability?.webgl2) && !capability?.software && flowOk)

  // Presence: draw only while near, visible, uncovered and settled.
  const near = useNearViewport(rootRef)
  const documentVisible = useDocumentVisible()
  // The menu placement is the docked window itself, inside the covering frame.
  const covered = usePageCovered(placement !== 'menu')
  const wanted = eligible && !paused && near && documentVisible && !covered && active
  const admitted = useStreakLease(id, wanted, ADMISSION_PRIORITY[placement])
  const live = wanted && admitted

  // Mounting and generations. The runtime mounts on first admission and
  // stays through short suspensions; a long one releases it. A new
  // descriptor identity is a new generation, so a late first-frame from the
  // previous seed cannot reveal the new one's blank buffer.
  const [mounted, setMounted] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [readyGeneration, setReadyGeneration] = useState<number | null>(null)
  const descriptorKey = `${descriptor.look}:${descriptor.seed}:${descriptor.speed}:${descriptor.intensity}:${descriptor.pointer}`
  const lastKey = useRef(descriptorKey)
  useEffect(() => {
    if (lastKey.current === descriptorKey) return
    lastKey.current = descriptorKey
    setGeneration((current) => current + 1)
    setReadyGeneration(null)
  }, [descriptorKey])
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
  const handleFailure = useCallback((reason: StreakFailureReason | 'chunk') => {
    setFailure(reason)
    setMounted(false)
    setReadyGeneration(null)
  }, [])
  const handleSlow = useCallback(() => {
    // One step down, then the poster. No step back up: hysteresis by design.
    setTier((current) => {
      if (current === 'normal') return 'degraded'
      handleFailure('performance')
      return current
    })
  }, [handleFailure])

  const ground = useGroundSurface(rootRef)
  const liveSurface = surface === 'auto' ? ground : surface
  const tuning = useMemo(
    () => composeStreakTuning(descriptor, { surface: liveSurface, limits }),
    [descriptor, liveSurface, limits],
  )

  const ready = mounted && readyGeneration === generation
  const status: StreakVisualStatus = failure
    ? 'failed'
    : !mounted
      ? 'poster'
      : !ready
        ? 'preparing'
        : live
          ? 'live'
          : 'suspended'
  useEffect(() => onStatusChange?.(status), [status, onStatusChange])

  return (
    <div
      ref={rootRef}
      className={cn(
        'pointer-events-none overflow-hidden',
        fill ? 'absolute inset-0' : 'relative w-full',
        className,
      )}
      data-visual="streakField"
      data-visual-descriptor={serialized}
      data-visual-look={descriptor.look}
      data-visual-status={status}
      {...(failure ? { 'data-visual-failure': failure } : {})}
    >
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-500',
          ready ? 'opacity-0' : 'opacity-100',
        )}
      >
        {posters.single || surface !== 'auto' ? (
          <Poster
            className={imgClassName}
            poster={surface === 'dark' ? posters.dark : posters.light}
            priority={priority}
            sizes={sizes}
            surface="any"
          />
        ) : (
          <>
            {/* Two ground-gated posters, the site default (light) first so a
                query for the first visible image finds it. The hidden twin
                is `display: none`, so its lazy load waits for the theme. */}
            <Poster
              className={imgClassName}
              poster={posters.light}
              priority={priority}
              sizes={sizes}
              surface="light"
            />
            <Poster
              className={imgClassName}
              poster={posters.dark}
              priority={false}
              sizes={sizes}
              surface="dark"
            />
          </>
        )}
      </div>
      {mounted && (
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            ready ? 'opacity-100' : 'opacity-0',
          )}
        >
          <ChunkBoundary onError={() => handleFailure('chunk')}>
            <Suspense fallback={null}>
              <StreakFieldRuntime
                active={live}
                dpr={tuning.dpr}
                generation={generation}
                onFailure={handleFailure}
                onReady={handleReady}
                onSlow={handleSlow}
                rootRef={rootRef}
                tuning={tuning}
              />
            </Suspense>
          </ChunkBoundary>
        </div>
      )}
    </div>
  )
}
