import type { CSSProperties } from 'react'
import type { VisualPlacement } from '../visual/placement'

/**
 * What the Studio needs to know about an effect to author it: a closed
 * contract, one module per effect under `./effects`, and nothing here or there
 * imports Three, R3F or the DOM, so the Payload config, server validation, the
 * visual resolver and the admin all read the same table. The scenes that draw
 * an effect are the one part that cannot live here; they are in `./scenes`.
 *
 * This is the authoring contract, not a tuning provider: every number still
 * originates in exactly one place (`*_DEFAULTS` beside the effect, deltas in
 * `../presets.ts`), and a contract only points at them. Adding an effect is one
 * module here, one entry in `./effects/index.ts`, one in `./scenes.tsx` and
 * its Inspector copy in the Studio plugin.
 */

/** A resolved tuning: every knob with its default filled in. */
export type Tuning = Record<string, unknown>

/** The ground an effect sits on. Every effect renders a face for each. */
export type Surface = 'dark' | 'light'
export const SURFACES = ['dark', 'light'] as const satisfies readonly Surface[]

/** The grounds the Studio paints under an effect, and flattens an opaque export onto. */
export const STUDIO_GROUND: Record<Surface, string> = { dark: '#090b10', light: '#f6f7fa' }

type Grouped = { group: string }
export type RangeParameter = Grouped & { min: number; max: number; step?: number }
export type OptionsParameter = Grouped & {
  /** What an author may choose. */
  options: readonly string[]
  /**
   * Values a resolved tuning may also hold, because the effect derives them
   * for a ground (`EffectContract.face`), and no author may choose.
   */
  derived?: readonly string[]
}
/** Three channels from 0 to 1: a colour an editor can read as hex. */
export type ColorParameter = Grouped & { color: true }
/** `vector` numbers sharing one range: a direction, or a per-channel multiplier that may pass 1. */
export type VectorParameter = RangeParameter & { vector: number }
export type ToggleParameter = Grouped & { toggle: true }
export type Parameter =
  | RangeParameter
  | OptionsParameter
  | ColorParameter
  | VectorParameter
  | ToggleParameter

export const range = (group: string, min: number, max: number, step = 0.01): RangeParameter => ({
  group,
  min,
  max,
  step,
})
export const unit = (group: string) => range(group, 0, 1)
export const vector = (
  group: string,
  size: number,
  min: number,
  max: number,
  step = 0.01,
): VectorParameter => ({ ...range(group, min, max, step), vector: size })

/** A shipped look: a stable id stored as text in Payload, and delta-only tuning. */
export type EffectLook<T extends Tuning> = {
  id: string
  label: string
  /** One line for the admin picker. */
  description: string
  /** Delta-only tuning against the effect's defaults. Never restates a default. */
  tuning: Partial<T>
}

/** A CSS blend mode, as the `mix-blend-mode` property takes it. */
export type BlendMode = NonNullable<CSSProperties['mixBlendMode']>

/** What a placement costs, in the effect's own words, for the Studio's stage. */
export type EffectBudget = { text: string; capped: boolean }

/** Which per-entry controls a visual slot offers for this effect. */
export type EffectSlot = {
  /** A seed lays the effect out, so an entry may pin one. */
  seed: boolean
  /** The effect may leave its frame and wash across the block. */
  bleed: boolean
  /** The slot's media upload may show under the effect. */
  media: boolean
}

export type EffectContract<T extends Tuning> = {
  /** The visual kind an editor chooses, and the `effect` a Studio look is filed under. */
  id: string
  label: string
  /** Stamped on every snapshot. A snapshot from another renderer keeps its posters and never runs live. */
  renderer: string
  defaults: T
  /** The authorable subset of `defaults`. Anything absent is code-owned. */
  parameters: Record<string, Parameter>
  looks: Record<string, EffectLook<T>>
  /** The look an unknown or missing id degrades to. */
  fallbackLook: string
  /** Bump when defaults or a shipped look change in a way that invalidates rendered stills. */
  lookRevision: number
  /** `public/images/<posterDirectory>/<look>-<surface>.webp`. */
  posterDirectory: string
  /** Whether a seed changes what is drawn. */
  seeded: boolean
  slot: EffectSlot
  /** The tuning for one ground, from the tuning authored on the dark one. */
  face(tuning: T, surface: Surface): T
  /** Code-owned ceilings for a placement. Caps, never raises, and is idempotent. */
  limit(tuning: T, placement: VisualPlacement): T
  /** Rules that span parameters. Throws the message the editor reads. */
  check?(tuning: T): void
  budget(limited: T, requested: T, placement: VisualPlacement): EffectBudget
  /**
   * How a frame of this tuning meets the ground under it. An effect that draws
   * with alpha leaves this out; one that draws an opaque frame names the CSS
   * blend that drops its ground out, and its canvas and its posters are both
   * composited that way.
   */
  blend?(tuning: T): BlendMode
  /** A short tag beside a look in the Studio's starters, when the effect has one to show. */
  lookTag?(look: EffectLook<T>): string | undefined
}

/** A contract with its tuning type erased, for code that handles any effect. */
export type Effect = EffectContract<Tuning>

export const lookPosterSrc = (effect: Effect, look: string, surface: Surface): string =>
  `/images/${effect.posterDirectory}/${look}-${surface}.webp?v=${effect.lookRevision}`

export const isLookId = (effect: Effect, value: unknown): value is string =>
  typeof value === 'string' && Object.hasOwn(effect.looks, value)

/** Admin picker options: id, label and description, in table order. */
export const lookOptions = (effect: Effect) =>
  Object.values(effect.looks).map(({ id, label, description }) => ({
    value: id,
    label,
    description,
  }))

/**
 * The rule one value has to meet for its parameter. Returns the reason it does
 * not, or `null`. `resolved` reads a value out of a tuning the effect produced
 * rather than one an author wrote, so it also admits what the effect derives.
 */
export function parameterError(
  key: string,
  spec: Parameter,
  value: unknown,
  { resolved = false } = {},
): string | null {
  const inRange = (n: unknown, min: number, max: number) =>
    typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max
  if ('options' in spec) {
    const allowed = resolved ? [...spec.options, ...(spec.derived ?? [])] : spec.options
    return typeof value === 'string' && allowed.includes(value) ? null : `Invalid ${key}.`
  }
  if ('toggle' in spec) return typeof value === 'boolean' ? null : `${key} must be on or off.`
  if ('color' in spec)
    return Array.isArray(value) && value.length === 3 && value.every((n) => inRange(n, 0, 1))
      ? null
      : `${key} must be three color values from 0 to 1.`
  if ('vector' in spec)
    return Array.isArray(value) &&
      value.length === spec.vector &&
      value.every((n) => inRange(n, spec.min, spec.max))
      ? null
      : `${key} must be ${spec.vector} values between ${spec.min} and ${spec.max}.`
  return inRange(value, spec.min, spec.max)
    ? null
    : `${key} must be between ${spec.min} and ${spec.max}.`
}
