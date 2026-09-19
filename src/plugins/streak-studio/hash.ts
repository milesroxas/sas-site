import { createHash } from 'node:crypto'
import { APIError } from 'payload'
import { effectOf } from '@/features/immersive/studio/effects'
import { canonicalJSON, snapshotRecipe } from '@/features/immersive/studio/recipe'

/**
 * The identity of what a recipe renders: the hash of its resolved snapshot in
 * canonical form. Recipes that resolve to the same snapshot are the same
 * release, however their JSON is ordered and whichever no-op deltas they hold.
 * `effect` is the look's stored effect id; the snapshot carries its renderer,
 * so two effects never share a hash.
 */
export function recipeHash(effect: unknown, recipe: unknown): string {
  const snapshot = studioInput(() => snapshotRecipe(effectOf(effect), recipe))
  return createHash('sha256').update(canonicalJSON(snapshot)).digest('hex')
}

/** The hash of a stored recipe, or `null` when today's validation no longer accepts it. */
export function storedRecipeHash(effect: unknown, recipe: unknown): string | null {
  try {
    return recipeHash(effect, recipe)
  } catch {
    return null
  }
}

export function studioInput<T>(read: () => T): T {
  try {
    return read()
  } catch (error) {
    throw new APIError((error as Error).message, 400)
  }
}
