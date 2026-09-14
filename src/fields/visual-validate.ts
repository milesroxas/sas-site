import type { PayloadRequest } from 'payload'
import {
  isStreakLookId,
  isValidStreakSeed,
  STREAK_INTENSITY_RANGE,
  STREAK_SEED_MAX,
  STREAK_SPEED_RANGE,
} from '@/features/immersive/visual'

/**
 * Server-side rules for the shader group, kept as plain functions so they
 * test without Payload. The admin hides fields with `condition`; these are
 * what actually holds: preset membership, finite bounded numbers, integer
 * seeds, image-only posters, and a required look whenever the parent slot
 * chose the shader.
 */

type Path = (string | number)[]

/**
 * The object two levels above a shader-group field: the slot that owns the
 * group (`hero`, a block, the document root for `menuPreviewShader`). Walks
 * the document by the field path, so it works for groups, arrays and blocks.
 */
export const shaderSlotOf = (data: unknown, path: Path | undefined): Record<string, unknown> => {
  if (!path || path.length < 2 || !data || typeof data !== 'object') return {}
  let node: unknown = data
  for (const segment of path.slice(0, -2)) {
    if (!node || typeof node !== 'object') return {}
    node = (node as Record<string | number, unknown>)[segment]
  }
  return node && typeof node === 'object' ? (node as Record<string, unknown>) : {}
}

/** Whether the slot two levels up chose the shader, by either slot naming. */
export const slotChoseShader = (slot: Record<string, unknown>): boolean =>
  slot.visualType === 'streakField' || slot.menuPreviewType === 'streakField'

export const validatePresetValue = (value: unknown, chosen: boolean): true | string => {
  if (value === null || value === undefined || value === '') {
    return chosen ? 'Choose a Streak Field look.' : true
  }
  if (!isStreakLookId(value)) {
    return `"${String(value)}" is not a shipped Streak Field look.`
  }
  return true
}

export const validateSeedValue = (value: unknown): true | string => {
  if (value === null || value === undefined) return true
  if (!isValidStreakSeed(value)) {
    return `Seed must be a whole number between 0 and ${STREAK_SEED_MAX}.`
  }
  return true
}

const validateRange =
  (label: string, range: { min: number; max: number }) =>
  (value: unknown): true | string => {
    if (value === null || value === undefined) return true
    if (typeof value !== 'number' || !Number.isFinite(value)) return `${label} must be a number.`
    if (value < range.min || value > range.max) {
      return `${label} must be between ${range.min} and ${range.max}.`
    }
    return true
  }

export const validateSpeedValue = validateRange('Speed', STREAK_SPEED_RANGE)
export const validateIntensityValue = validateRange('Intensity', STREAK_INTENSITY_RANGE)

const relationId = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const { id } = value as { id?: unknown }
    if (typeof id === 'number' || typeof id === 'string') return id
  }
  return null
}

/** Posters are still images: a video upload is refused before it is stored. */
export const validatePosterMediaValue = async (
  value: unknown,
  req: PayloadRequest,
): Promise<true | string> => {
  const id = relationId(value)
  if (id === null) return true
  const doc = await req.payload.findByID({
    collection: 'media',
    id,
    depth: 0,
    disableErrors: true,
    select: { mimeType: true },
    req,
  })
  if (!doc) return 'The chosen poster no longer exists.'
  if (!doc.mimeType?.startsWith('image/')) return 'A poster must be an image, not a video.'
  return true
}

/** A random seed for a newly authored shader visual, persisted once. */
export const randomStreakSeed = (): number => Math.floor(Math.random() * (STREAK_SEED_MAX + 1))
