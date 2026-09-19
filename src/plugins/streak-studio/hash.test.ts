import { describe, expect, it } from 'vitest'
import { STREAK_FIELD_EFFECT as S } from '@/features/immersive/studio/effects'
import { emptyRecipe, recipeFromSnapshot, snapshotRecipe } from '@/features/immersive/studio/recipe'
import { recipeHash, storedRecipeHash } from './hash'

describe('Studio release identity', () => {
  const recipe = {
    ...emptyRecipe(S),
    deltas: { relief: 0.4, count: 8000, noise: 'curl' as const },
  }

  it('hashes a recipe the same from the browser and from Postgres', () => {
    // jsonb returns keys by length, then bytewise: not the order the editor built.
    const stored = {
      seed: recipe.seed,
      frame: recipe.frame,
      deltas: { count: 8000, noise: 'curl', relief: 0.4 },
      version: recipe.version,
    }
    expect(recipeHash(S.id, stored)).toBe(recipeHash(S.id, recipe))
    expect(recipeHash(S.id, recipe)).toMatch(/^[a-f0-9]{64}$/)
  })
  it('gives a restored release the hash of the release, so republishing reuses it', () => {
    expect(recipeHash(S.id, recipeFromSnapshot(S, snapshotRecipe(S, recipe)))).toBe(
      recipeHash(S.id, recipe),
    )
    // A delta that restates the default is the same output, so the same release.
    expect(recipeHash(S.id, { ...emptyRecipe(S), deltas: {} })).toBe(
      recipeHash(S.id, emptyRecipe(S)),
    )
  })
  it('separates anything that changes the pixels', () => {
    expect(recipeHash(S.id, { ...recipe, frame: recipe.frame + 1 })).not.toBe(
      recipeHash(S.id, recipe),
    )
    expect(recipeHash(S.id, { ...recipe, seed: recipe.seed + 1 })).not.toBe(
      recipeHash(S.id, recipe),
    )
  })
  it('reads a stored recipe today rejects as no hash, not an error', () => {
    expect(storedRecipeHash(S.id, { ...emptyRecipe(S), deltas: { count: 12000 } })).toBeNull()
    expect(() => recipeHash(S.id, { ...emptyRecipe(S), deltas: { count: 12000 } })).toThrow()
  })
})
