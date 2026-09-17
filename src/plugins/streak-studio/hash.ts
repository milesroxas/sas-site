import { createHash } from 'node:crypto'
import { APIError } from 'payload'
import { snapshotRecipe, validateRecipe } from '@/features/immersive/studio/recipe'

export function recipeHash(recipe: unknown): string {
  const normalized = studioInput(() => validateRecipe(recipe))
  return createHash('sha256')
    .update(
      JSON.stringify({
        ...normalized,
        deltas: Object.fromEntries(
          Object.entries(normalized.deltas).sort(([a], [b]) => a.localeCompare(b)),
        ),
        snapshot: snapshotRecipe(normalized),
      }),
    )
    .digest('hex')
}

export function studioInput<T>(read: () => T): T {
  try {
    return read()
  } catch (error) {
    throw new APIError((error as Error).message, 400)
  }
}
