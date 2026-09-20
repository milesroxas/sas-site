'use client'

import { type ComponentType, lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react'
import { cn } from '@/utilities/ui'
import { FailureBoundary } from '../ui/failure-boundary'
import type { StreakFailureReason, StreakFieldRuntimeProps } from '../ui/streak-field-runtime'
import { composeStreakTuning } from './compose'
import {
  type StreakVisualDescriptor,
  serializeStreakDescriptor,
  type VisualSurface,
} from './descriptor'
import { useGroundSurface } from './hooks'
import { STREAK_LOOKS } from './looks'
import { degradedLimits, PLACEMENT_LIMITS, type VisualPlacement } from './placement'
import { crossfadeClass, VisualPosterStack } from './poster'
import { visualPosters } from './posters'
import { type LiveVisualOptions, useLiveVisual } from './use-live-visual'

/**
 * The Streak Field as page media, poster first.
 *
 * Server HTML carries a real `<img>` poster inside a stable frame, so the
 * slot is complete without JavaScript or a GPU, the menu can clone it, and
 * the hero handoff can land on it. The live field's admission, generations and
 * failure handling are the shared slot lifecycle (`./use-live-visual`); what is
 * the Streak Field's own is here: a `flow` look needs a renderable float
 * target, and sustained long frames step the quality down once before the
 * poster returns.
 */

const StreakFieldRuntime = lazy(() =>
  import('../ui/streak-field-runtime').then((module) => ({ default: module.StreakFieldRuntime })),
) as ComponentType<StreakFieldRuntimeProps>

export type StreakVisualSurface = VisualSurface

export type StreakVisualProps = {
  descriptor: StreakVisualDescriptor
  placement: VisualPlacement
  /**
   * The ground the field sits on. `auto` follows the visitor's site theme
   * (page-level surfaces); a Section band passes its own polarity. A face the
   * editor pinned (`descriptor.surface`) wins over both.
   */
  surface?: VisualSurface
  /** The visual is the page's first-paint media: preload its poster. */
  priority?: boolean
  /** `sizes` for the poster, as for any responsive image. */
  sizes?: string
  /** Frame classes: aspect ratio, width, corner treatment. */
  className?: string
  /** Fill the nearest positioned ancestor instead of sizing the frame. */
  fill?: boolean
  /** Poster image classes (object-fit, blend). */
  imgClassName?: string
} & Pick<LiveVisualOptions, 'admission' | 'onStatusChange'> &
  Partial<Pick<LiveVisualOptions, 'active'>>

export function StreakVisual({
  descriptor,
  placement,
  surface: landed = 'auto',
  priority = false,
  sizes = '100vw',
  active = true,
  className,
  fill = false,
  imgClassName,
  onStatusChange,
  admission,
}: StreakVisualProps) {
  // The editor's pin outranks the ground the slot landed on.
  const surface = descriptor.surface ?? landed
  const rootRef = useRef<HTMLDivElement>(null)
  const posters = useMemo(() => visualPosters({ kind: 'streakField', descriptor }), [descriptor])
  const serialized = useMemo(() => serializeStreakDescriptor(descriptor), [descriptor])

  const [tier, setTier] = useState<'normal' | 'degraded'>('normal')
  const limits =
    tier === 'degraded' ? degradedLimits(PLACEMENT_LIMITS[placement]) : PLACEMENT_LIMITS[placement]
  const flows =
    (descriptor.release?.snapshot.dark.motion ?? STREAK_LOOKS[descriptor.look].motion) === 'flow'

  const { status, failure, mounted, live, ready, generation, handleReady, fail, failChunk } =
    useLiveVisual<StreakFailureReason>({
      rootRef,
      placement,
      kind: 'streak',
      allowed: !descriptor.degraded,
      active,
      identity: `${descriptor.release?.sourceHash ?? descriptor.look}:${descriptor.seed}:${descriptor.speed}:${descriptor.intensity}:${descriptor.pointer}`,
      supports: (capability) => !flows || (limits.flow && capability.floatTarget),
      admission,
      onStatusChange,
    })

  const handleSlow = useCallback(() => {
    // One step down, then the poster. No step back up: hysteresis by design.
    setTier((current) => {
      if (current === 'normal') return 'degraded'
      fail('performance')
      return current
    })
  }, [fail])

  const ground = useGroundSurface(rootRef)
  const liveSurface = surface === 'auto' ? ground : surface
  const tuning = useMemo(
    () => composeStreakTuning(descriptor, { surface: liveSurface, limits }),
    [descriptor, liveSurface, limits],
  )

  return (
    <div
      ref={rootRef}
      className={cn(
        'pointer-events-none overflow-hidden',
        fill ? 'absolute inset-0' : 'relative w-full',
        // The field carries alpha, so a pinned one paints the ground it was
        // pinned to: `data-theme` resolves `--background` on the frame.
        descriptor.surface && 'bg-background',
        className,
      )}
      data-theme={descriptor.surface ?? undefined}
      data-visual="streakField"
      data-visual-descriptor={serialized}
      data-visual-look={descriptor.look}
      data-visual-status={status}
      {...(failure ? { 'data-visual-failure': failure } : {})}
    >
      <VisualPosterStack
        imgClassName={imgClassName}
        posters={posters}
        priority={priority}
        shown={!ready}
        sizes={sizes}
        surface={surface}
      />
      {mounted && (
        <div aria-hidden className={crossfadeClass(ready)}>
          <FailureBoundary onError={failChunk}>
            <Suspense fallback={null}>
              <StreakFieldRuntime
                active={live}
                dpr={tuning.dpr}
                generation={generation}
                onFailure={fail}
                onReady={handleReady}
                onSlow={handleSlow}
                rootRef={rootRef}
                tuning={tuning}
              />
            </Suspense>
          </FailureBoundary>
        </div>
      )}
    </div>
  )
}
