import { describe, expect, it } from 'vitest'
import { composeStreakTuning } from '../visual/compose'
import {
  parseStreakDescriptor,
  resolveStreakDescriptor,
  serializeStreakDescriptor,
} from '../visual/descriptor'
import { STREAK_LOOK_IDS } from '../visual/looks'
import { PLACEMENT_LIMITS } from '../visual/placement'
import { limitStreakTuning, STREAK_FIELD_EFFECT as S } from './effects'
import {
  canonicalJSON,
  emptyRecipe,
  recipeFromSnapshot,
  resolveRecipeTuning,
  sameSnapshot,
  snapshotChanges,
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
  snapshot: snapshotRecipe(S, emptyRecipe(S)),
  posters: { dark: poster, light: poster },
})

describe('Studio recipes and release contract', () => {
  it('validates every built-in starter without persisting code-owned resource controls', () => {
    for (const id of STREAK_LOOK_IDS) {
      const recipe = starterRecipe(S, id)
      expect(validateRecipe(S, recipe)).toEqual(recipe)
      expect(recipe.deltas).not.toHaveProperty('dpr')
      expect(recipe.deltas).not.toHaveProperty('segments')
      expect(recipe.deltas).not.toHaveProperty('noiseOctaves')
    }
  })
  it('carries a starter count through, clamped to the ceiling code allows', () => {
    // The sparse backdrop is sparse because of its count: a starter that drops
    // it opens nine times as dense as the look it is named after.
    expect(starterRecipe(S, 'backdrop-v1').deltas.count).toBe(900)
    // A count above the ceiling clamps to it, which is the default, so the
    // starter carries no delta and still resolves to what hero would render.
    expect(starterRecipe(S, 'topography-v1').deltas).not.toHaveProperty('count')
    expect(resolveRecipeTuning(S, starterRecipe(S, 'topography-v1')).count).toBe(8000)
    expect(() => validateRecipe(S, { ...emptyRecipe(S), deltas: { count: 12000 } })).toThrow()
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
    expect(() => validateRecipe(S, { ...emptyRecipe(S), deltas })).toThrow()
  })
  it('bounds expensive combinations again after placement and slot changes', () => {
    const snapshot = snapshotRecipe(S, {
      ...emptyRecipe(S),
      deltas: { motion: 'flow', noise: 'curl', maxLength: 80, thickness: 4 },
    })
    expect(snapshot.dark.count).toBeLessThanOrEqual(2500)
    expect(snapshot.dark.noiseOctaves).toBe(2)
    for (const placement of ['hero', 'block', 'menu'] as const) {
      const tuning = limitStreakTuning(snapshot.dark, placement)
      expect(tuning.count).toBeLessThanOrEqual(PLACEMENT_LIMITS[placement].count)
      expect(tuning.dpr).toBeLessThanOrEqual(PLACEMENT_LIMITS[placement].dpr)
      expect(tuning.segments).toBe(1)
    }
  })
  it('inherits release seeds and serializes compact releases for the menu handoff', () => {
    const descriptor = resolveStreakDescriptor({ studio: release() })
    expect(descriptor.seed).toBe(emptyRecipe(S).seed)
    expect(descriptor.degraded).toBe(false)
    expect(parseStreakDescriptor(serializeStreakDescriptor(descriptor))).toEqual(descriptor)
    expect(
      composeStreakTuning(descriptor, { surface: 'light', limits: PLACEMENT_LIMITS.block }).count,
    ).toBeLessThanOrEqual(4000)
  })
  it('keeps unsupported renderer posters but disables live rendering', () => {
    const data = release()
    data.snapshot.renderer = 'future-renderer'
    expect(resolveStreakDescriptor({ studio: data }).degraded).toBe(true)
    expect(parseRelease(S, data)?.posters).toEqual(data.posters)
    data.snapshot.dark.count = 100000
    expect(parseRelease(S, data)).toBeNull()
    // A field that was never published arrives as a bare id: the shipped look runs.
    expect(resolveStreakDescriptor({ studio: 23, preset: 'signal-v1' }).degraded).toBe(false)
  })
  it('reads identity in canonical form, whatever order the JSON arrived in', () => {
    // Postgres jsonb hands keys back by length, then bytewise.
    expect(canonicalJSON({ version: 1, seed: 7, deltas: { b: [1, 2], a: undefined } })).toBe(
      canonicalJSON({ seed: 7, deltas: { b: [1, 2] }, version: 1 }),
    )
    const snapshot = snapshotRecipe(S, starterRecipe(S, 'signal-v1'))
    const stored = JSON.parse(canonicalJSON(snapshot))
    expect(sameSnapshot(snapshot, stored)).toBe(true)
    expect(snapshotChanges(snapshot, stored)).toBe(0)
  })
  it('restores a release as a draft that is the same release', () => {
    const recipes = [
      ...STREAK_LOOK_IDS.map((id) => starterRecipe(S, id)),
      // A count the hero budget caps: the restored draft keeps the capped
      // count, which still resolves to the snapshot it came from.
      { ...emptyRecipe(S), seed: 42, frame: 90, deltas: { noise: 'curl', count: 8000 } as const },
    ]
    for (const recipe of recipes) {
      const snapshot = snapshotRecipe(S, recipe)
      expect(sameSnapshot(snapshotRecipe(S, recipeFromSnapshot(S, snapshot)), snapshot)).toBe(true)
    }
    expect(recipeFromSnapshot(S, snapshotRecipe(S, recipes.at(-1))).deltas.count).toBe(4000)
  })
  it('counts the capture frame and light-only differences as changes', () => {
    const base = snapshotRecipe(S, emptyRecipe(S))
    expect(snapshotChanges(base, snapshotRecipe(S, { ...emptyRecipe(S), frame: 151 }))).toBe(1)
    expect(
      snapshotChanges(
        base,
        snapshotRecipe(S, { ...emptyRecipe(S), seed: 9, deltas: { relief: 0.9 } }),
      ),
    ).toBe(2)
    const light = structuredClone(base)
    light.light.brightness += 0.1
    expect(snapshotChanges(base, light)).toBe(1)
  })
  it('bounds pixel count and rejects transparent JPEG', () => {
    const capture = {
      width: 1920,
      height: 1080,
      scale: 2,
      surface: 'dark',
      format: 'webp',
      transparent: true,
    }
    expect(validateCapture(capture)).toEqual(capture)
    expect(() => validateCapture({ ...capture, height: 1920 })).toThrow()
    expect(() => validateCapture({ ...capture, format: 'jpeg' })).toThrow()
  })
})
