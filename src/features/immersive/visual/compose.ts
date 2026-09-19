import { STREAK_FIELD_PAPER } from '../presets'
import { LIGHT_LEAK_EFFECT, limitLeakTuning, limitStreakTuning } from '../studio/effects'
import { type LightLeakTuning, resolveLeakTuning } from '../ui/light-leak-tuning'
import {
  resolveStreakTuning,
  type StreakFieldSurface,
  type StreakFieldTuning,
} from '../ui/streak-field-tuning'
import type { LeakVisualDescriptor, StreakVisualDescriptor } from './descriptor'
import { STREAK_LOOKS } from './looks'
import type { PlacementLimits, VisualPlacement } from './placement'

/**
 * Resolve a descriptor into the tuning the scene draws, once, in the order
 * the plan fixes: defaults → the look's preset deltas → the light-ground
 * preset when the surface is light → the editor's validated multipliers →
 * the placement's ceilings. A published Studio look replaces the first three
 * with its snapshot for that ground. Every number still originates in exactly
 * one place: defaults beside the effect, deltas in `presets.ts`, ranges in the
 * descriptor, ceilings in `placement.ts` and the effect's contract.
 */
export function composeStreakTuning(
  descriptor: StreakVisualDescriptor,
  options: { surface: StreakFieldSurface; limits: PlacementLimits },
): StreakFieldTuning {
  const { surface, limits } = options
  const look = STREAK_LOOKS[descriptor.look]
  const base =
    descriptor.release?.snapshot[surface] ??
    resolveStreakTuning({
      ...look.tuning,
      ...(surface === 'light' ? STREAK_FIELD_PAPER : {}),
    })
  const pointer = descriptor.pointer && limits.pointer
  const result = {
    ...base,
    surface,
    seed: descriptor.seed,
    count: Math.max(1, Math.min(base.count, limits.count)),
    dpr: Math.min(base.dpr, limits.dpr),
    timeScale: base.timeScale * descriptor.speed,
    brightness: base.brightness * descriptor.intensity,
    // A radius of 0 turns every pointer term off in the shader and lets the
    // scene skip the listeners; the look's other pointer knobs stay intact.
    pointerRadius: pointer ? base.pointerRadius : 0,
  }
  return descriptor.release ? limitStreakTuning(result, 'hero') : result
}

/** The same order for a light leak. Its ceilings are the placement's sample count and DPR. */
export function composeLeakTuning(
  descriptor: LeakVisualDescriptor,
  options: { surface: StreakFieldSurface; placement: VisualPlacement },
): LightLeakTuning {
  const { surface, placement } = options
  const base =
    descriptor.release?.snapshot[surface] ??
    LIGHT_LEAK_EFFECT.face(
      resolveLeakTuning(LIGHT_LEAK_EFFECT.looks[descriptor.look].tuning),
      surface,
    )
  return limitLeakTuning(
    {
      ...base,
      timeScale: base.timeScale * descriptor.speed,
      gain: base.gain * descriptor.intensity,
      // Off, the scene binds no listeners; the look's hover knobs stay intact.
      excite: base.excite && descriptor.pointer,
    },
    placement,
  )
}
