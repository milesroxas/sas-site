import { describe, expect, it } from 'vitest'
import { composeStreakTuning } from '../visual/compose'
import {
  parseStreakDescriptor,
  resolveStreakDescriptor,
  serializeStreakDescriptor,
} from '../visual/descriptor'
import { STREAK_LOOK_IDS } from '../visual/looks'
import { PLACEMENT_LIMITS } from '../visual/placement'
import {
  emptyRecipe,
  limitStudioTuning,
  snapshotRecipe,
  starterRecipe,
  validateCapture,
  validateRecipe,
} from './recipe'
import { parseRelease } from './release'

const poster = {
  filename: 'studio.webp',
  url: '/api/media/file/studio.webp',
  mimeType: 'image/webp',
  width: 1600,
  height: 900,
  updatedAt: '2026-09-17T00:00:00Z',
}
const release = () => ({
  id: 7,
  sourceHash: 'a'.repeat(64),
  snapshot: snapshotRecipe(emptyRecipe()),
  posters: { dark: poster, light: poster },
})

describe('Studio recipes and release contract', () => {
  it('validates every built-in starter without persisting code-owned resource controls', () => {
    for (const id of STREAK_LOOK_IDS) {
      const recipe = starterRecipe(id)
      expect(validateRecipe(recipe)).toEqual(recipe)
      expect(recipe.deltas).not.toHaveProperty('count')
      expect(recipe.deltas).not.toHaveProperty('dpr')
    }
  })
  it.each([
    { force: true },
    { count: 100000 },
    { dpr: 10 },
    { noiseOctaves: 6 },
    { noise: 'shader code' },
    { brightness: Number.NaN },
    { ink: [1, 0] },
    { minLength: 20, maxLength: 2 },
  ])('rejects unsafe or malformed input %o', (deltas) => {
    expect(() => validateRecipe({ ...emptyRecipe(), deltas })).toThrow()
  })
  it('bounds expensive combinations again after placement and slot changes', () => {
    const snapshot = snapshotRecipe({
      ...emptyRecipe(),
      deltas: { motion: 'flow', noise: 'curl', maxLength: 80, thickness: 4 },
    })
    expect(snapshot.dark.count).toBeLessThanOrEqual(2500)
    expect(snapshot.dark.noiseOctaves).toBe(2)
    for (const placement of ['hero', 'block', 'menu'] as const) {
      const tuning = limitStudioTuning(snapshot.dark, placement)
      expect(tuning.count).toBeLessThanOrEqual(PLACEMENT_LIMITS[placement].count)
      expect(tuning.dpr).toBeLessThanOrEqual(PLACEMENT_LIMITS[placement].dpr)
      expect(tuning.segments).toBe(1)
    }
  })
  it('inherits release seeds and serializes compact releases for the menu handoff', () => {
    const descriptor = resolveStreakDescriptor({ release: release() })
    expect(descriptor.seed).toBe(emptyRecipe().seed)
    expect(descriptor.degraded).toBe(false)
    expect(parseStreakDescriptor(serializeStreakDescriptor(descriptor))).toEqual(descriptor)
    expect(
      composeStreakTuning(descriptor, { surface: 'light', limits: PLACEMENT_LIMITS.block }).count,
    ).toBeLessThanOrEqual(4000)
  })
  it('keeps unsupported renderer posters but disables live rendering', () => {
    const data = release()
    data.snapshot.renderer = 'future-renderer'
    expect(resolveStreakDescriptor({ release: data }).degraded).toBe(true)
    expect(parseRelease(data)?.posters).toEqual(data.posters)
    data.snapshot.dark.count = 100000
    expect(parseRelease(data)).toBeNull()
    expect(resolveStreakDescriptor({ release: 23, preset: 'signal-v1' }).degraded).toBe(true)
  })
  it('bounds pixel count and rejects transparent JPEG', () => {
    const capture = {
      width: 1920,
      height: 1080,
      scale: 2,
      surface: 'dark',
      format: 'png',
      transparent: true,
    }
    expect(validateCapture(capture)).toEqual(capture)
    expect(() => validateCapture({ ...capture, height: 1920 })).toThrow()
    expect(() => validateCapture({ ...capture, format: 'jpeg' })).toThrow()
  })
})
