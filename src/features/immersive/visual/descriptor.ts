import type { Media } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'
import { isStreakLookId, STREAK_FALLBACK_LOOK, type StreakLookId } from './looks'

/**
 * The application-level visual union that sits above a Payload `Media`
 * document: a slot renders either an uploaded image/video or a code-defined
 * Streak Field look with per-entry art direction. Server resolvers produce
 * it; the `Visual` adapter renders it; nothing here touches WebGL, so the
 * poster path and Payload validation can share these rules.
 *
 * See `docs/streak-field-media-plan.md`, "Content contract" and "Editorial rules".
 */

/** The visual kinds an editor can choose. Missing/null keeps legacy media behavior. */
export const VISUAL_TYPES = ['media', 'streakField'] as const
export type VisualType = (typeof VISUAL_TYPES)[number]

/** Menu preview choice: inherit the destination's visual, or pick one for hover only. */
export const MENU_PREVIEW_TYPES = ['automatic', 'media', 'streakField'] as const
export type MenuPreviewType = (typeof MENU_PREVIEW_TYPES)[number]

/** Bounded editor multipliers. Ranges are the first-release proposal, tuned visually. */
export const STREAK_SPEED_RANGE = { min: 0, max: 1, default: 1 } as const
export const STREAK_INTENSITY_RANGE = { min: 0.5, max: 1.25, default: 1 } as const
/** Seeds are non-negative 31-bit integers: they feed a 32-bit hash. */
export const STREAK_SEED_MAX = 2_147_483_647

/** The shader group as Payload stores it, on any parent. */
export type StoredStreakVisual = {
  preset?: string | null
  seed?: number | null
  speed?: number | null
  intensity?: number | null
  pointerInteraction?: boolean | null
  posterMedia?: number | Media | null
}

/** A visual slot as Payload stores it: the existing upload plus the new choice. */
export type StoredVisualSlot = {
  media?: unknown
  visualType?: VisualType | string | null
  shader?: StoredStreakVisual | null
}

/**
 * What a poster upload contributes to a descriptor: the fields
 * `mediaPosterImage` reads. A resolver hands over the populated document;
 * a serialized descriptor (`serializeStreakDescriptor`) carries only these.
 */
export type PosterMediaSource = Pick<
  Media,
  'filename' | 'updatedAt' | 'url' | 'width' | 'height' | 'mimeType'
>

export type StreakVisualDescriptor = {
  look: StreakLookId
  /** Integer seed; the same seed lays out the same field on every load. */
  seed: number
  /** Multiplier on the look's time scale, `STREAK_SPEED_RANGE`. */
  speed: number
  /** Multiplier on the look's brightness, `STREAK_INTENSITY_RANGE`. */
  intensity: number
  pointer: boolean
  /** An approved upload that replaces the look's built-in poster. */
  posterMedia: PosterMediaSource | null
  /**
   * The stored preset was not a shipped look: the descriptor fell back to
   * `STREAK_FALLBACK_LOOK` and must render as a poster only. Editing
   * reports the invalid id; rendering never guesses a live look.
   */
  degraded: boolean
}

export type MediaVisual = { kind: 'media'; media: Media }
export type StreakFieldVisual = { kind: 'streakField'; descriptor: StreakVisualDescriptor }
export type Visual = MediaVisual | StreakFieldVisual

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** FNV-1a over a string, folded into the seed range: stable identity → stable seed. */
export const seedFromKey = (key: string | number): number => {
  const text = String(key)
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash % (STREAK_SEED_MAX + 1)
}

export const isValidStreakSeed = (value: unknown): value is number =>
  isFiniteNumber(value) && Number.isInteger(value) && value >= 0 && value <= STREAK_SEED_MAX

/** A stored multiplier normalized to its range; null and non-finite fall to the default. */
export const normalizeStreakMultiplier = (
  value: unknown,
  range: { min: number; max: number; default: number },
): number => (isFiniteNumber(value) ? clamp(value, range.min, range.max) : range.default)

export type ResolveVisualOptions = {
  /**
   * Stable identity (document or block id) a missing seed derives from.
   * Never an array index: reordering must not reshuffle the field.
   */
  seedKey?: string | number | null
  /** Media the legacy branch falls back to when the slot's own upload is empty. */
  fallbackMedia?: unknown
}

/**
 * Normalize a stored shader group into a descriptor. Never throws: an invalid
 * or missing preset degrades to the fallback look, poster only; out-of-range
 * numbers clamp; a missing seed derives from `seedKey`.
 */
export const resolveStreakDescriptor = (
  shader: StoredStreakVisual | null | undefined,
  options: ResolveVisualOptions = {},
): StreakVisualDescriptor => {
  const look = isStreakLookId(shader?.preset) ? shader.preset : STREAK_FALLBACK_LOOK
  const degraded = !isStreakLookId(shader?.preset)
  const seed = isValidStreakSeed(shader?.seed) ? shader.seed : seedFromKey(options.seedKey ?? look)
  const posterMedia = populatedDoc<Media>(shader?.posterMedia)
  return {
    look,
    seed,
    speed: normalizeStreakMultiplier(shader?.speed, STREAK_SPEED_RANGE),
    intensity: normalizeStreakMultiplier(shader?.intensity, STREAK_INTENSITY_RANGE),
    pointer: shader?.pointerInteraction === true,
    posterMedia: posterMedia?.mimeType?.startsWith('image/') ? posterMedia : null,
    degraded,
  }
}

/**
 * Resolve a visual slot once, at the server boundary.
 *
 * - Missing or `media` visual type keeps the legacy behavior: the slot's own
 *   upload, then `fallbackMedia`, then nothing.
 * - `streakField` wins over a retained upload: that upload is neither
 *   fetched nor mounted just because it is still stored.
 */
export const resolveVisual = (
  slot: StoredVisualSlot | null | undefined,
  options: ResolveVisualOptions = {},
): Visual | null => {
  if (slot?.visualType === 'streakField') {
    return { kind: 'streakField', descriptor: resolveStreakDescriptor(slot.shader, options) }
  }
  const media = populatedDoc<Media>(slot?.media) ?? populatedDoc<Media>(options.fallbackMedia)
  return media ? { kind: 'media', media } : null
}

const POSTER_MEDIA_KEYS = ['filename', 'updatedAt', 'url', 'width', 'height', 'mimeType'] as const

/**
 * A descriptor as a string, for the slot to publish on its root
 * (`data-visual-descriptor`): a consumer that only has the DOM, such as the
 * takeover menu mounting the page's own field in its docked window, can
 * rebuild the same field from it. The poster upload is reduced to what
 * `mediaPosterImage` reads, so no document leaves the server boundary twice.
 */
export const serializeStreakDescriptor = (descriptor: StreakVisualDescriptor): string => {
  const posterMedia = descriptor.posterMedia
    ? Object.fromEntries(POSTER_MEDIA_KEYS.map((key) => [key, descriptor.posterMedia?.[key]]))
    : null
  return JSON.stringify({ ...descriptor, posterMedia })
}

const isPosterMediaSource = (value: unknown): value is PosterMediaSource =>
  typeof value === 'object' && value !== null && typeof (value as Media).mimeType === 'string'

/**
 * The inverse of `serializeStreakDescriptor`. Never throws and never
 * guesses: anything malformed, including an unknown look, is `null`, so a
 * consumer falls back to the poster it already has.
 */
export const parseStreakDescriptor = (
  text: string | null | undefined,
): StreakVisualDescriptor | null => {
  if (!text) return null
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return null
  }
  if (typeof raw !== 'object' || raw === null) return null
  const value = raw as Record<string, unknown>
  if (!isStreakLookId(value.look) || !isValidStreakSeed(value.seed)) return null
  return {
    look: value.look,
    seed: value.seed,
    speed: normalizeStreakMultiplier(value.speed, STREAK_SPEED_RANGE),
    intensity: normalizeStreakMultiplier(value.intensity, STREAK_INTENSITY_RANGE),
    pointer: value.pointer === true,
    posterMedia: isPosterMediaSource(value.posterMedia) ? value.posterMedia : null,
    degraded: value.degraded === true,
  }
}

/** The media document behind a visual, when it has one. Streak visuals return null. */
export const visualMedia = (visual: Visual | null | undefined): Media | null =>
  visual?.kind === 'media' ? visual.media : null

/** A menu preview slot as Payload stores it, beside the destination's own visual. */
export type StoredMenuPreviewSlot = {
  menuPreview?: unknown
  menuPreviewType?: MenuPreviewType | string | null
  menuPreviewShader?: StoredStreakVisual | null
}

/**
 * Resolve what the takeover menu previews for a destination.
 *
 * Returns the independent hover-only preview when one is chosen, or `null`
 * to mean "inherit the destination's own visual" (the caller decides which
 * of the destination's slots that is and whether it can hand off).
 *
 * - Missing type is legacy: an existing explicit upload previews, else inherit.
 * - Explicit `automatic` inherits even when an old upload is still stored.
 * - `media` uses the upload; with none stored it inherits.
 * - `streakField` previews the shader's poster, hover only.
 */
export const resolveMenuPreviewVisual = (
  slot: StoredMenuPreviewSlot | null | undefined,
  options: ResolveVisualOptions = {},
): Visual | null => {
  const type = slot?.menuPreviewType
  if (type === 'automatic') return null
  if (type === 'streakField') {
    return {
      kind: 'streakField',
      descriptor: resolveStreakDescriptor(slot?.menuPreviewShader, options),
    }
  }
  const media = populatedDoc<Media>(slot?.menuPreview)
  return media ? { kind: 'media', media } : null
}
