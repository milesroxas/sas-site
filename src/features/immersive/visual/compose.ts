import { STREAK_FIELD_PAPER } from '../presets'
import { limitStudioTuning } from '../studio/recipe'
import {
  resolveStreakTuning,
  type StreakFieldSurface,
  type StreakFieldTuning,
} from '../ui/streak-field-tuning'
import type { StreakVisualDescriptor } from './descriptor'
import { STREAK_LOOKS } from './looks'
import type { PlacementLimits } from './placement'

/**
 * Resolve a descriptor into the tuning the scene draws, once, in the order
 * the plan fixes: defaults → the look's preset deltas → the light-ground
 * preset when the surface is light → the editor's validated multipliers →
 * the placement's ceilings. Every number still originates in exactly one
 * place: defaults beside the effect, deltas in `presets.ts`, ranges in the
 * descriptor, ceilings in `placement.ts`.
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
  return descriptor.release ? limitStudioTuning(result, 'hero') : result
}
