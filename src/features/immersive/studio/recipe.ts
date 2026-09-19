import { canonicalJSON } from '@/utilities/canonicalJSON'
import { resolveTuning } from '../resolve-tuning'
import { type EffectContract, parameterError, type Surface, type Tuning } from './effect'

/**
 * The recipe engine: what an author stores, what the site draws from, and how
 * one becomes the other, for whichever effect a look is filed under. Every
 * function takes the effect's contract (`./effect`); nothing here knows a
 * parameter by name.
 */

export const RECIPE_VERSION = 1
export const SEED_MAX = 2_147_483_647
export const FRAME_MAX = 600

/** What the author stores: a seed, the capture frame, and only the parameters that left their default. */
export type Recipe = { version: 1; seed: number; deltas: Tuning; frame: number }

/** What the site draws from: the resolved tuning for each ground, already at the most generous placement's caps. */
export type Snapshot<T extends Tuning = Tuning> = {
  renderer: string
  dark: T
  light: T
  frame: number
}

export const emptyRecipe = <T extends Tuning>(effect: EffectContract<T>): Recipe => ({
  version: RECIPE_VERSION,
  seed: effect.seeded ? Number(effect.defaults.seed) : 0,
  deltas: {},
  frame: 150,
})

/** The effective tuning a recipe asks for, before any placement cap. Never throws. */
export const resolveRecipeTuning = <T extends Tuning>(
  effect: EffectContract<T>,
  recipe: Recipe,
): T =>
  resolveTuning<T>(effect.defaults, {
    ...recipe.deltas,
    ...(effect.seeded ? { seed: recipe.seed } : {}),
  } as Partial<T>)

export function validateRecipe<T extends Tuning>(effect: EffectContract<T>, raw: unknown): Recipe {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('A recipe is required.')
  const value = raw as Record<string, unknown>
  if (Object.keys(value).some((key) => !['version', 'seed', 'deltas', 'frame'].includes(key)))
    throw new Error('Unknown recipe property.')
  if (value.version !== RECIPE_VERSION)
    throw new Error('Unsupported recipe version. Duplicate a current starter to upgrade.')
  if (!Number.isInteger(value.seed) || Number(value.seed) < 0 || Number(value.seed) > SEED_MAX)
    throw new Error('Seed must be a nonnegative 31-bit integer.')
  if (!Number.isInteger(value.frame) || Number(value.frame) < 1 || Number(value.frame) > FRAME_MAX)
    throw new Error(`Capture frame must be between 1 and ${FRAME_MAX}.`)
  if (!value.deltas || typeof value.deltas !== 'object' || Array.isArray(value.deltas))
    throw new Error('Recipe deltas must be an object.')
  for (const [key, val] of Object.entries(value.deltas)) {
    if (!Object.hasOwn(effect.parameters, key)) throw new Error(`Unsupported parameter: ${key}`)
    const error = parameterError(key, effect.parameters[key], val)
    if (error) throw new Error(error)
  }
  const recipe = value as unknown as Recipe
  effect.check?.(resolveRecipeTuning(effect, recipe))
  return recipe
}

export function snapshotRecipe<T extends Tuning>(
  effect: EffectContract<T>,
  raw: unknown,
): Snapshot<T> {
  const recipe = validateRecipe(effect, raw)
  const base = resolveRecipeTuning(effect, recipe)
  const face = (surface: Surface) => effect.limit(effect.face(base, surface), 'hero')
  return {
    renderer: effect.renderer,
    frame: recipe.frame,
    dark: face('dark'),
    light: face('light'),
  }
}

/**
 * Key-sorted JSON (`@/utilities/canonicalJSON`). Postgres `jsonb` hands a
 * stored object back with its keys reordered, and a recipe built in the browser
 * keeps the order it was built in, so identity (the release hash, draft matches
 * release) is always taken over this form, never over `JSON.stringify` of an
 * object as it arrived.
 */
export { canonicalJSON }

/** A release is its snapshot: two recipes that resolve to the same one draw the same pixels. */
export const sameSnapshot = (a: Snapshot, b: Snapshot) => canonicalJSON(a) === canonicalJSON(b)

/**
 * How many settings separate two snapshots: every dark-ground value (seed
 * included), the capture frame and the renderer. Never zero for snapshots
 * that differ, so a change that only shows on the light ground still counts.
 */
export function snapshotChanges(a: Snapshot, b: Snapshot): number {
  if (sameSnapshot(a, b)) return 0
  const keys = new Set([...Object.keys(a.dark), ...Object.keys(b.dark)])
  let changes = Number(a.frame !== b.frame) + Number(a.renderer !== b.renderer)
  for (const key of keys) if (canonicalJSON(a.dark[key]) !== canonicalJSON(b.dark[key])) changes++
  return Math.max(1, changes)
}

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** The deltas that carry `tuning`: every authorable parameter that left its default, held to its range. */
function deltasOf<T extends Tuning>(effect: EffectContract<T>, tuning: Tuning): Tuning {
  const deltas: Tuning = {}
  for (const [key, spec] of Object.entries(effect.parameters)) {
    let value = tuning[key]
    if ('min' in spec && !('vector' in spec) && typeof value === 'number')
      value = Math.max(spec.min, Math.min(spec.max, value))
    if (!sameValue(value, effect.defaults[key])) deltas[key] = value
  }
  return deltas
}

/**
 * The recipe a release was published from, read back out of its snapshot:
 * every authorable parameter that differs from the default becomes a delta.
 * It resolves to the same snapshot, so it is the same release; the one thing
 * it does not keep is a value the hero budget had already capped. Studio uses
 * it to compare a draft against a release and to restore a release as the
 * draft.
 */
export const recipeFromSnapshot = <T extends Tuning>(
  effect: EffectContract<T>,
  snapshot: Snapshot,
): Recipe =>
  validateRecipe(effect, {
    ...emptyRecipe(effect),
    ...(effect.seeded ? { seed: snapshot.dark.seed } : {}),
    frame: snapshot.frame,
    deltas: deltasOf(effect, snapshot.dark),
  })

/** A shipped look as a recipe, so "make it mine" starts where the page already is. */
export const starterRecipe = <T extends Tuning>(effect: EffectContract<T>, look: string): Recipe =>
  validateRecipe(effect, {
    ...emptyRecipe(effect),
    deltas: deltasOf(effect, resolveTuning<T>(effect.defaults, effect.looks[look]?.tuning ?? {})),
  })

export type CaptureOptions = {
  width: number
  height: number
  scale: number
  surface: Surface
  /** Lossy only: a lossless still of a full frame outweighs what one upload can carry. Alpha rides in WebP. */
  format: 'webp' | 'jpeg'
  transparent: boolean
}
export const POSTER_CAPTURE: CaptureOptions = {
  width: 1600,
  height: 900,
  scale: 1,
  surface: 'dark',
  format: 'webp',
  transparent: true,
}
/** Lossy encoder quality of a still, the same in the browser and on the server. */
export const STILL_QUALITY = 90
/**
 * What the stills of one request may weigh together. Vercel refuses a function
 * request body over 4.5 MB, and the rest of the form needs a little room.
 */
export const STILL_UPLOAD_BUDGET = 4 * 1024 * 1024
export function validateCapture(raw: unknown): CaptureOptions {
  if (!raw || typeof raw !== 'object') throw new Error('Capture settings required.')
  const v = raw as CaptureOptions
  if (
    !Number.isInteger(v.width) ||
    v.width < 320 ||
    v.width > 1920 ||
    !Number.isInteger(v.height) ||
    v.height < 320 ||
    v.height > 1920 ||
    ![1, 2].includes(v.scale) ||
    v.width * v.height * v.scale ** 2 > 8294400
  )
    throw new Error(
      'Choose 320 to 1920 logical pixels per side, at 1x or 2x, up to 8.3 megapixels.',
    )
  if (
    !['light', 'dark'].includes(v.surface) ||
    !['webp', 'jpeg'].includes(v.format) ||
    typeof v.transparent !== 'boolean'
  )
    throw new Error('Invalid capture format or surface.')
  if (v.transparent && v.format === 'jpeg') throw new Error('JPEG requires a filled background.')
  return {
    width: v.width,
    height: v.height,
    scale: v.scale,
    surface: v.surface,
    format: v.format,
    transparent: v.transparent,
  }
}
