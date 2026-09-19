import type { Effect, Parameter, Tuning } from '@/features/immersive/studio/effect'
import type { EffectId } from '@/features/immersive/studio/effects'
import { LIGHT_LEAK_COPY } from './copy/light-leak'
import { STREAK_FIELD_COPY } from './copy/streak-field'

/**
 * What the Inspector says about an effect, beside what the effect's contract
 * already states. Ranges, steps, options and defaults are never restated in a
 * copy module (`./copy`): they come from the contract. Copy owns only the
 * reading.
 */
export type ParameterCopy = {
  label: string
  description: string
  /** Suffix for the value field, shown in the tooltip's range line. */
  unit?: string
  /** One line per option, for the option tooltips of a select. */
  options?: Record<string, string>
  /**
   * Display name for an option whose raw value is not its reading: `fbm` is
   * fractal Brownian motion, not a word to capitalize. Anything left out
   * takes the raw value with its first letter capitalized.
   */
  optionLabels?: Record<string, string>
}

/**
 * A control that does nothing until another setting changes. The row shows
 * muted with the reason under it, and clicking the row applies `fix`.
 */
export type Dependency<T extends Tuning = Tuning> = {
  active(tuning: T): boolean
  reason: string
  fix?: Partial<T>
  /** What the button under the row does, in its own words. */
  fixLabel?: string
}

/** A collapsed group's header: one line, or the colours it is set to. */
export type GroupSummary = string | { swatches: readonly (readonly number[])[] }

export type EffectCopy<T extends Tuning = Tuning, K extends string = string> = {
  /** The stage's heading. */
  title: string
  /** What an editor calls one of these, in a sentence: "New field", "this leak". */
  noun: string
  parameters: Record<K, ParameterCopy>
  dependencies: Partial<Record<K, Dependency<T>>>
  /** A low and a high bound drawn as one two-thumb row, under the first key's place. */
  ranges?: readonly { keys: readonly [K, K]; label: string }[]
  /** The contract group the Pointer tab holds, flat, and the note above it. */
  pointerGroup: string
  pointerNote: string
  summary(group: string, tuning: T): GroupSummary
  /** Small text beside a row's control: a number the code owns, not one the editor sets. */
  hint?(key: K, tuning: T): string | undefined
}

export const EFFECT_COPY: Record<EffectId, EffectCopy> = {
  streakField: STREAK_FIELD_COPY,
  lightLeak: LIGHT_LEAK_COPY,
}

/** How an option reads in a control: the authored name, else Capitalized. */
export const optionLabel = (copy: ParameterCopy, option: string) =>
  copy.optionLabels?.[option] ?? option.replace(/^./, (character) => character.toUpperCase())

/** The contract's groups in table order, without the one the Pointer tab holds. */
export const lookGroups = (effect: Effect, copy: EffectCopy): string[] => [
  ...new Set(
    Object.values(effect.parameters)
      .map((spec) => spec.group)
      .filter((group) => group !== copy.pointerGroup),
  ),
]

export const parameterKeys = (effect: Effect, group: string): string[] =>
  Object.keys(effect.parameters).filter((key) => effect.parameters[key].group === group)

/** Decimal places a value shows, derived from the parameter's step. */
export const decimals = (spec: Parameter): number => {
  if (!('step' in spec) || spec.step === undefined || spec.step >= 1) return 0
  return String(spec.step).split('.')[1]?.length ?? 0
}

/** A value at the parameter's precision with trailing zeros dropped: 0, 1.2, 0.08. */
export const formatValue = (spec: Parameter, value: number) =>
  String(Number(value.toFixed(decimals(spec))))

export const toHex = (rgb: readonly number[]) =>
  `#${rgb
    .map((n) =>
      Math.round(Math.min(1, Math.max(0, n)) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`

export const fromHex = (hex: string): [number, number, number] | null => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const [r, g, b] = [0, 2, 4].map(
    (offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16) / 255,
  )
  return [r, g, b]
}
