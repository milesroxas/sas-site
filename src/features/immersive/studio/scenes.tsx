'use client'

import { type ComponentType, type RefObject, useRef } from 'react'
import { LightLeakRuntime } from '../ui/light-leak-runtime'
import { createLeakInput, LeakScene } from '../ui/light-leak-scene'
import type { LightLeakTuning } from '../ui/light-leak-tuning'
import { StreakFieldRuntime } from '../ui/streak-field-runtime'
import { createPointerInput, FieldScene } from '../ui/streak-field-scene'
import type { StreakFieldTuning } from '../ui/streak-field-tuning'
import type { Tuning } from './effect'
import type { EffectId } from './effects'

/**
 * The part of an effect its contract cannot hold: the scene that draws it.
 * Each entry is the effect's own scene, stepped a fixed 1/60 s per frame with
 * neutral input, for the Studio to mount in an offscreen canvas and read a
 * still back from, and its production runtime for the Studio's stage. This
 * module imports Three, so only the capture path and the stage reach it, both
 * lazily; the website's slots import their own effect's runtime and no other.
 */

/** One frame of a capture. */
const CAPTURE_DELTA = 1 / 60

export type CaptureSceneProps = {
  tuning: Tuning
  rootRef: RefObject<HTMLElement | null>
  onError: (message: string) => void
}

function StreakCapture({ tuning, rootRef, onError }: CaptureSceneProps) {
  const pointer = useRef(createPointerInput())
  return (
    <FieldScene
      rootRef={rootRef}
      inputRef={pointer}
      tuning={{ ...(tuning as StreakFieldTuning), pointerRadius: 0 }}
      fixedDelta={CAPTURE_DELTA}
      onFlowUnsupported={() => onError('This browser has no float render targets.')}
    />
  )
}

function LeakCapture({ tuning, rootRef }: CaptureSceneProps) {
  const input = useRef(createLeakInput())
  return (
    <LeakScene
      rootRef={rootRef}
      inputRef={input}
      tuning={tuning as LightLeakTuning}
      fixedDelta={CAPTURE_DELTA}
    />
  )
}

/** What the Studio's stage hands a live effect, whichever one it is. */
export type LiveSceneProps = {
  tuning: Tuning
  rootRef: RefObject<HTMLElement | null>
  active: boolean
  generation: number
  onReady: () => void
  onFailure: (reason: string) => void
  /** Sustained long frames, from an effect that watches for them. */
  onSlow: () => void
}

function StreakLive({ tuning, ...runtime }: LiveSceneProps) {
  const streak = tuning as StreakFieldTuning
  return <StreakFieldRuntime {...runtime} tuning={streak} dpr={streak.dpr} />
}

function LeakLive({ tuning, onSlow: _unwatched, ...runtime }: LiveSceneProps) {
  return <LightLeakRuntime {...runtime} tuning={tuning as LightLeakTuning} />
}

export type EffectScene = {
  Capture: ComponentType<CaptureSceneProps>
  Live: ComponentType<LiveSceneProps>
}

export const EFFECT_SCENES: Record<EffectId, EffectScene> = {
  streakField: { Capture: StreakCapture, Live: StreakLive },
  lightLeak: { Capture: LeakCapture, Live: LeakLive },
}
