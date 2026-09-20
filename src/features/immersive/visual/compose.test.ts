import { describe, expect, it } from 'vitest'
import { STREAK_FIELD_DEFAULTS } from '../ui/streak-field-tuning'
import { composeStreakTuning } from './compose'
import type { StreakVisualDescriptor } from './descriptor'
import { STREAK_LOOKS } from './looks'
import { degradedLimits, PLACEMENT_LIMITS } from './placement'

const descriptor = (over: Partial<StreakVisualDescriptor> = {}): StreakVisualDescriptor => ({
  look: 'signal-v1',
  seed: 42,
  speed: 1,
  intensity: 1,
  pointer: false,
  surface: null,
  posterMedia: null,
  degraded: false,
  ...over,
})

describe('composeStreakTuning', () => {
  it('applies defaults, look, surface, overrides and ceilings in order', () => {
    const t = composeStreakTuning(descriptor({ speed: 0.5, intensity: 1.25, pointer: true }), {
      surface: 'light',
      limits: PLACEMENT_LIMITS.hero,
    })
    expect(t.seed).toBe(42)
    expect(t.surface).toBe('light')
    // Light ground: the paper preset's brightness, then the editor's multiplier.
    expect(t.brightness).toBeCloseTo(1.3 * 1.25)
    expect(t.timeScale).toBeCloseTo(STREAK_FIELD_DEFAULTS.timeScale * 0.5)
    expect(t.count).toBe(PLACEMENT_LIMITS.hero.count)
    expect(t.dpr).toBe(PLACEMENT_LIMITS.hero.dpr)
    expect(t.pointerRadius).toBe(STREAK_FIELD_DEFAULTS.pointerRadius)
  })

  it('turns the pointer off by radius when not requested or not allowed', () => {
    expect(
      composeStreakTuning(descriptor({ pointer: false }), {
        surface: 'dark',
        limits: PLACEMENT_LIMITS.hero,
      }).pointerRadius,
    ).toBe(0)
    expect(
      composeStreakTuning(descriptor({ pointer: true }), {
        surface: 'dark',
        limits: PLACEMENT_LIMITS.menu,
      }).pointerRadius,
    ).toBe(0)
  })

  it('caps a look count without raising a smaller one', () => {
    const topo = composeStreakTuning(descriptor({ look: 'topography-v1' }), {
      surface: 'dark',
      limits: PLACEMENT_LIMITS.block,
    })
    expect(topo.count).toBe(PLACEMENT_LIMITS.block.count)
    const backdrop = composeStreakTuning(descriptor({ look: 'backdrop-v1' }), {
      surface: 'dark',
      limits: PLACEMENT_LIMITS.hero,
    })
    expect(backdrop.count).toBe(STREAK_LOOKS['backdrop-v1'].tuning.count)
  })

  it('steps down to the degraded tier deterministically', () => {
    const limits = degradedLimits(PLACEMENT_LIMITS.hero)
    expect(limits.dpr).toBe(1)
    expect(limits.count).toBe(PLACEMENT_LIMITS.hero.count / 2)
  })
})
