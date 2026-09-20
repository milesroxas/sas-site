import type { Media } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'
import {
  type EffectContract,
  isLookId,
  SURFACES,
  type Surface,
  type Tuning,
} from '../studio/effect'
import {
  EFFECT_IDS,
  type LeakLookId,
  LIGHT_LEAK_EFFECT,
  STREAK_FIELD_EFFECT,
} from '../studio/effects'
import { parseRelease, type ReleaseDescriptor } from '../studio/release'
import {
  isLeakExciteTargets,
  isLeakOrigin,
  LEAK_ORIGINS,
  type LeakExciteTargets,
  type LeakOrigin,
  type LightLeakTuning,
} from '../ui/light-leak-tuning'
import type { StreakFieldTuning } from '../ui/streak-field-tuning'
import { isStreakLookId, type StreakLookId } from './looks'

/**
 * The application-level visual union that sits above a Payload `Media`
 * document: a slot renders either an uploaded image/video or a code-defined
 * effect (`../studio/effects`) with per-entry art direction, from a shipped
 * look or from one authored in Studio. Server resolvers produce
 * it; the `Visual` adapter renders it; nothing here touches WebGL, so the
 * poster path and Payload validation can share these rules.
 *
 * See `docs/streak-field-media-plan.md`, "Content contract" and "Editorial rules".
 */

/** The visual kinds an editor can choose. Missing/null keeps legacy media behavior. */
export const VISUAL_TYPES = ['media', ...EFFECT_IDS] as const
export type VisualType = (typeof VISUAL_TYPES)[number]

/** Menu preview choice: inherit the destination's visual, or pick one for hover only. */
export const MENU_PREVIEW_TYPES = ['automatic', 'media', 'streakField'] as const
export type MenuPreviewType = (typeof MENU_PREVIEW_TYPES)[number]

/** Bounded editor multipliers. Ranges are the first-release proposal, tuned visually. */
export const STREAK_SPEED_RANGE = { min: 0, max: 1, default: 1 } as const
export const STREAK_INTENSITY_RANGE = { min: 0.5, max: 1.25, default: 1 } as const
/**
 * How far a leak answers the pointer merely crossing its band. Empty is the
 * look's own value, so this range only bounds an entry that overrides it.
 */
export const LEAK_SECTION_HOVER_RANGE = { min: 0, max: 1 } as const
/** Seeds are non-negative 31-bit integers: they feed a 32-bit hash. */
export const STREAK_SEED_MAX = 2_147_483_647

/** The ground a visual is drawn for. `auto` follows whatever the slot lands on. */
export type VisualSurface = Surface | 'auto'
export const VISUAL_SURFACES = ['auto', ...SURFACES] as const satisfies readonly VisualSurface[]

const isSurface = (value: unknown): value is Surface =>
  (SURFACES as readonly unknown[]).includes(value)

/** The shader group as Payload stores it, on any parent. */
export type StoredStreakVisual = {
  /**
   * The Streak Field made in Studio, as the Studio plugin hands it over: the
   * published look's snapshot and posters. A bare id is a field that was
   * never published.
   */
  studio?: unknown
  preset?: string | null
  seed?: number | null
  speed?: number | null
  intensity?: number | null
  pointerInteraction?: boolean | null
  posterMedia?: number | Media | null
  /** Show the slot's media upload under the effect, where the effect allows it. */
  showMedia?: boolean | null
  /** Let the effect leave its frame and wash across the block. */
  bleed?: boolean | null
  origin?: LeakOrigin | string | null
  /** What the effect answers on hover; empty keeps the look's own choice. */
  hoverTargets?: LeakExciteTargets | string | null
  /** How far the pointer crossing the band excites it; empty keeps the look's own. */
  sectionHover?: number | null
  /** The face the editor pinned; `auto` or empty follows the ground the slot lands on. */
  surface?: VisualSurface | string | null
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

/** What every effect's descriptor carries: the look, the editor's bounded adjustments, the poster. */
type EffectDescriptor<Look extends string, T extends Tuning> = {
  /** The published Studio look the slot uses, when it uses one. */
  release?: ReleaseDescriptor<T> | null
  look: Look
  /** Multiplier on the look's time scale, `STREAK_SPEED_RANGE`. */
  speed: number
  /** Multiplier on the look's brightness, `STREAK_INTENSITY_RANGE`. */
  intensity: number
  pointer: boolean
  /**
   * The face the editor pinned this use to, whatever the visitor's theme and
   * whatever band it sits in, or `null` to follow the ground it lands on. A
   * pinned slot paints that ground itself; a band it grounds adopts it
   * (`resolveOpening`'s `surface`).
   */
  surface: Surface | null
  /** An approved upload that replaces the look's built-in poster. */
  posterMedia: PosterMediaSource | null
  /**
   * The stored look cannot be drawn: an unknown preset (the descriptor fell
   * back to the effect's fallback look) or a Studio look from another
   * renderer. It renders as a poster only. Editing reports the invalid id;
   * rendering never guesses a live look.
   */
  degraded: boolean
}

export type StreakVisualDescriptor = EffectDescriptor<StreakLookId, StreakFieldTuning> & {
  /** Integer seed; the same seed lays out the same field on every load. */
  seed: number
}

export type LeakVisualDescriptor = EffectDescriptor<LeakLookId, LightLeakTuning> & {
  /**
   * What the leak answers on hover inside its band, or `null` to keep the
   * look's own choice. Narrows the look; `pointer` still gates the whole flare.
   */
  targets: LeakExciteTargets | null
  /** Excitement while the pointer crosses the band, or `null` for the look's own. */
  sectionExcite: number | null
  /** Contained in the slot's frame, or washing across the block from `origin`. */
  bleed: boolean
  /** The corner the light enters from. */
  origin: LeakOrigin
  /** The slot's upload, when the editor chose to show it under the leak. */
  media: Media | null
}

export type MediaVisual = { kind: 'media'; media: Media }
export type StreakFieldVisual = { kind: 'streakField'; descriptor: StreakVisualDescriptor }
export type LightLeakVisual = { kind: 'lightLeak'; descriptor: LeakVisualDescriptor }
export type EffectVisual = StreakFieldVisual | LightLeakVisual
export type Visual = MediaVisual | EffectVisual

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
 * The part of a stored shader group every effect reads the same way. Never
 * throws: an invalid or missing preset degrades to the effect's fallback look,
 * poster only; out-of-range numbers clamp.
 */
function resolveEffectDescriptor<Look extends string, T extends Tuning>(
  effect: EffectContract<T>,
  shader: StoredStreakVisual | null | undefined,
): EffectDescriptor<Look, T> {
  const shipped = isLookId(effect, shader?.preset)
  // An unpublished Studio look has nothing to render from yet, so the slot
  // reads as if none were chosen and shows its shipped look.
  const published = typeof shader?.studio === 'object' && shader.studio !== null
  const release = parseRelease(effect, shader?.studio)
  const posterMedia = populatedDoc<Media>(shader?.posterMedia)
  return {
    look: (shipped ? shader?.preset : effect.fallbackLook) as Look,
    ...(release ? { release } : {}),
    speed: normalizeStreakMultiplier(shader?.speed, STREAK_SPEED_RANGE),
    intensity: normalizeStreakMultiplier(shader?.intensity, STREAK_INTENSITY_RANGE),
    pointer: shader?.pointerInteraction === true,
    surface: isSurface(shader?.surface) ? shader.surface : null,
    posterMedia: posterMedia?.mimeType?.startsWith('image/') ? posterMedia : null,
    degraded: published ? !release || release.snapshot.renderer !== effect.renderer : !shipped,
  }
}

/** A Streak Field's descriptor. A missing seed derives from `seedKey`. */
export const resolveStreakDescriptor = (
  shader: StoredStreakVisual | null | undefined,
  options: ResolveVisualOptions = {},
): StreakVisualDescriptor => {
  const base = resolveEffectDescriptor<StreakLookId, StreakFieldTuning>(STREAK_FIELD_EFFECT, shader)
  return {
    ...base,
    seed: isValidStreakSeed(shader?.seed)
      ? shader.seed
      : (base.release?.snapshot.dark.seed ?? seedFromKey(options.seedKey ?? base.look)),
  }
}

/** A light leak's descriptor. `media` is the slot's own upload, already resolved. */
export const resolveLeakDescriptor = (
  shader: StoredStreakVisual | null | undefined,
  media: Media | null,
): LeakVisualDescriptor => ({
  ...resolveEffectDescriptor<LeakLookId, LightLeakTuning>(LIGHT_LEAK_EFFECT, shader),
  // A bleeding leak washes the block's own band, which it cannot repaint: the
  // band is the ground, so it is the face.
  ...(shader?.bleed === true ? { surface: null } : {}),
  targets: isLeakExciteTargets(shader?.hoverTargets) ? shader.hoverTargets : null,
  sectionExcite: isFiniteNumber(shader?.sectionHover)
    ? clamp(shader.sectionHover, LEAK_SECTION_HOVER_RANGE.min, LEAK_SECTION_HOVER_RANGE.max)
    : null,
  bleed: shader?.bleed === true,
  origin: isLeakOrigin(shader?.origin) ? shader.origin : LEAK_ORIGINS[0],
  media: shader?.showMedia === true ? media : null,
})

/**
 * Resolve a visual slot once, at the server boundary.
 *
 * - Missing or `media` visual type keeps the legacy behavior: the slot's own
 *   upload, then `fallbackMedia`, then nothing.
 * - An effect wins over a retained upload: that upload is neither fetched nor
 *   mounted just because it is still stored. A light leak shows it only when
 *   the editor asked for it under the leak.
 */
export const resolveVisual = (
  slot: StoredVisualSlot | null | undefined,
  options: ResolveVisualOptions = {},
): Visual | null => {
  if (slot?.visualType === 'streakField') {
    return { kind: 'streakField', descriptor: resolveStreakDescriptor(slot.shader, options) }
  }
  const media = populatedDoc<Media>(slot?.media) ?? populatedDoc<Media>(options.fallbackMedia)
  if (slot?.visualType === 'lightLeak') {
    return { kind: 'lightLeak', descriptor: resolveLeakDescriptor(slot.shader, media) }
  }
  return media ? { kind: 'media', media } : null
}

/**
 * A hero opening, resolved from one slot: the effect that grounds the band and
 * the media that fills the frame the layout gives it. Either may be absent and
 * both may be present, unlike a block slot, where the two share one frame and
 * the effect wins.
 */
export type VisualOpening = {
  /** The effect behind the whole band, when the editor chose one. */
  ground: EffectVisual | null
  /** The slot's upload, whenever one is set. Never consumed by the effect. */
  media: Media | null
  /**
   * The palette the editor pinned the ground to, or `null`. The effect sits
   * under the band's copy, so the band takes it as its own palette: the copy
   * stays legible over the face it was pinned to.
   */
  surface: Surface | null
}

/**
 * Resolve an ambient slot (`heroVisualSlotFields`) into its two layers.
 *
 * The media is read the same way `resolveVisual` reads it (the slot's own
 * upload, then `fallbackMedia`), and it is read whether or not an effect is
 * chosen. A light leak is resolved without media of its own: the opening
 * renders the upload in its frame, so handing it to the leak as well would
 * paint it twice.
 */
export const resolveOpening = (
  slot: StoredVisualSlot | null | undefined,
  options: ResolveVisualOptions = {},
): VisualOpening => {
  const media = populatedDoc<Media>(slot?.media) ?? populatedDoc<Media>(options.fallbackMedia)
  const ground: EffectVisual | null =
    slot?.visualType === 'streakField'
      ? { kind: 'streakField', descriptor: resolveStreakDescriptor(slot.shader, options) }
      : slot?.visualType === 'lightLeak'
        ? { kind: 'lightLeak', descriptor: resolveLeakDescriptor(slot.shader, null) }
        : null
  return { ground, media, surface: visualSurface(ground) }
}

/**
 * What a hero opening hands off to the takeover menu: the media plate when the
 * page sets one, the effect grounding the band otherwise. The heroes mark that
 * same element `data-hero-media` (`HeroGround`'s `handoff`), so the menu's
 * preview and the page's dissolve target can never disagree.
 */
export const openingHandoffVisual = (
  slot: StoredVisualSlot | null | undefined,
  options: ResolveVisualOptions = {},
): Visual | null => {
  const { ground, media } = resolveOpening(slot, options)
  return media ? { kind: 'media', media } : ground
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
  const release = parseRelease(STREAK_FIELD_EFFECT, value.release)
  return {
    look: value.look,
    ...(release ? { release } : {}),
    seed: value.seed,
    speed: normalizeStreakMultiplier(value.speed, STREAK_SPEED_RANGE),
    intensity: normalizeStreakMultiplier(value.intensity, STREAK_INTENSITY_RANGE),
    pointer: value.pointer === true,
    surface: isSurface(value.surface) ? value.surface : null,
    posterMedia: isPosterMediaSource(value.posterMedia) ? value.posterMedia : null,
    degraded:
      value.degraded === true ||
      Boolean(value.release && release?.snapshot.renderer !== STREAK_FIELD_EFFECT.renderer),
  }
}

/** The face an effect's editor pinned it to. Media, and an effect that follows its ground, are `null`. */
export const visualSurface = (visual: Visual | null | undefined): Surface | null =>
  visual && visual.kind !== 'media' ? visual.descriptor.surface : null

/** The media document behind a visual, when it is one. An effect returns null, whatever it shows under itself. */
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
