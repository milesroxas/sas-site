import type { RefObject } from 'react'
import { resolveTuning } from '../resolve-tuning'

/**
 * The light leak's public knobs and their defaults, kept apart from the
 * Three/R3F scene so the Studio contract (`../studio/effects/light-leak`), the
 * visual resolver and the lazy slot can compose a tuning without loading the
 * renderer chunk. `./light-leak.tsx` re-exports everything here, so
 * `@/features/immersive` is unchanged.
 */

/**
 * The blend mode *is* the polarity, so the two can never disagree.
 *
 * Screen-like modes composite an emissive frame whose blacks drop out: the
 * leak as light striking the sensor, which only reads over a dark ground.
 * Multiply-like modes composite an absorptive frame whose *whites* drop out:
 * the leak as dye on paper, which is what reads over a pale ground. The shader
 * switches its final composite to match (see `uAbsorb`).
 */
export type LightLeakBlendMode = 'screen' | 'plus-lighter' | 'lighten' | 'multiply' | 'darken'

/** Multiply-like modes take the absorptive tail; everything else stays emissive. */
export function isAbsorptive(mode: LightLeakBlendMode): boolean {
  return mode === 'multiply' || mode === 'darken'
}

/**
 * Which axes the field is mirrored on. The composition is authored with its
 * light entering from the top right; a mirror moves that corner without a
 * second set of numbers.
 */
export type LeakMirror = readonly [x: boolean, y: boolean]
export const NO_MIRROR: LeakMirror = [false, false]

/** The corner the light enters from. The first is the field as authored. */
export const LEAK_ORIGINS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const
export type LeakOrigin = (typeof LEAK_ORIGINS)[number]
export const isLeakOrigin = (value: unknown): value is LeakOrigin =>
  (LEAK_ORIGINS as readonly unknown[]).includes(value)
export const originMirror = (origin: LeakOrigin): LeakMirror => [
  origin.endsWith('left'),
  origin.startsWith('bottom'),
]

/**
 * What the leak answers on hover, inside its scope (`LIGHT_LEAK_SCOPE_ATTR`).
 *
 * `marked` is the explicit contract: only elements spreading `leakExcite()`.
 * `interactive` adds every link and button in the band, so a section's own
 * calls to action flare the leak with nothing to wire; a marker set to `off`
 * still mutes one. Neither is the whole story — `sectionExcite` is what
 * answers the pointer crossing the band at all.
 */
export const LEAK_EXCITE_TARGETS = ['marked', 'interactive'] as const
export type LeakExciteTargets = (typeof LEAK_EXCITE_TARGETS)[number]
export const isLeakExciteTargets = (value: unknown): value is LeakExciteTargets =>
  (LEAK_EXCITE_TARGETS as readonly unknown[]).includes(value)

/** A 0 to 2 RGB multiplier, not a colour: values above 1 push the channel hot. */
export type LightLeakTint = readonly [number, number, number]

export type LightLeakProps = {
  /**
   * The element whose `scrollTop` drives the effect. Omit for page scroll
   * (`window.scrollY`): the usual case for a full-page overlay. Pass a
   * scroller's viewport ref when the leak lives inside its own scroll
   * container, so it reacts to that container instead of the page.
   */
  scrollSource?: RefObject<HTMLElement | null>
  /**
   * Mounts the canvas even when the device is flagged low-power or the visitor
   * prefers reduced motion. For demos and stories: never for shipped pages.
   */
  force?: boolean
  /** Placement. Defaults to filling the nearest positioned ancestor. */
  className?: string

  // Canvas
  /**
   * Dispersion smoothing samples. The field is evaluated `samples * 6` times
   * per pixel, so this is the single biggest lever on GPU cost: drop it for
   * secondary or small-area usage.
   */
  samples?: number
  /** Device-pixel-ratio cap. The leak is all low-frequency light, so 1 is usually enough. */
  dpr?: number
  /** How the overlay composites over the content beneath it. */
  blendMode?: LightLeakBlendMode

  // Time & shape
  /** Speed of the leak's idle drift. 0 freezes the field. */
  timeScale?: number
  /** How much noise melts the blobs into organic film. 0 stays geometric. */
  warpAmount?: number
  /** Size of the warp wrinkles. Higher is tighter and noisier. */
  warpScale?: number

  // Scroll response
  /** Scroll speed in px/s that counts as a full-strength flick. */
  scrollSpeed?: number
  /** Response shape. Below 1 reacts to the slightest movement, above 1 waits for a hard flick. */
  scrollCurve?: number
  /** How fast scroll velocity dies after you stop. Higher settles sooner. */
  scrollDecay?: number
  /** Master strength of everything scrolling drives: brightness, split, morph. */
  scrollIntensity?: number
  /** How quickly the leak eases toward the current scroll energy. */
  scrollSmooth?: number
  /** How far the leak field physically slides as you scroll. */
  scrollDrift?: number
  /** How much scrolling kneads the field into a different shape. */
  morph?: number
  /** Size of the scroll-driven wrinkles. Higher is tighter and more turbulent. */
  morphScale?: number

  // Hover excitement
  /** Master switch for everything the pointer drives. Off, the scene binds no listeners. */
  excite?: boolean
  /**
   * What counts as a full-strength target: marked elements only, or every
   * link and button in the leak's scope as well.
   */
  exciteTargets?: LeakExciteTargets
  /**
   * How excited the leak runs while the pointer is anywhere inside its scope
   * but not on a target: the band answering the visitor's presence. 0 is off,
   * and a target always reads 1.
   */
  sectionExcite?: number
  /** How fast excitement eases in and out. Low keeps the flare a wash, not a flash. */
  exciteEase?: number
  /** How fast the gathered light follows the pointer. */
  pointerEase?: number
  /** Light that gathers under the pointer while hovering an excite target. */
  hoverBloom?: number

  // Dispersion
  /** Resting rainbow split when nothing is moving. */
  dispersion?: number
  /** Extra spectral split added by scrolling. */
  dispersionEnergy?: number
  /** Extra spectral split added by hovering an excite target. */
  dispersionExcite?: number
  /** Axis the spectrum slides along. Red bends least, violet most. */
  dispersionDirection?: readonly [number, number]

  // Look
  /** Overall brightness of the leak overlay. */
  gain?: number
  /** Extra brightness added by scrolling. */
  gainEnergy?: number
  /** Extra brightness added by hovering an excite target. */
  gainExcite?: number
  /** Colour punch. 0 is gray, above 1 is oversaturated. */
  saturation?: number
  /** Extra colour punch while hovering an excite target. */
  saturationExcite?: number
  /** Film grain, only where the leak is visible. */
  grain?: number
  /** Extra grain in the bright core of the leak. */
  grainLuminance?: number
  /** Darkens the corners of the overlay. */
  vignette?: number
  /**
   * Absorptive blends only (`multiply` / `darken`). How hard the stain takes
   * the leak's own hue: 0 prints a neutral gray shadow, high values print
   * saturated dye. Ignored on screen-like blends.
   */
  inkChroma?: number
  /**
   * Absorptive blends only. Neutral darkening under the leak: the stain's
   * weight on the page, independent of its colour. Keep it low: this is what
   * eats the contrast of copy sitting under the overlay.
   */
  inkDensity?: number
  /** Tint on dim leak: the teal / shadow side. */
  coolTint?: LightLeakTint
  /** Tint on bright leak: the rose / highlight side. */
  warmTint?: LightLeakTint
  /** Hot colour dumped into the brightest core. */
  amber?: LightLeakTint

  // Field
  /** Strength of the lower-left warm bloom. */
  blobWarm?: number
  /** Strength of the long seam leak. */
  streak?: number
  /** Direction of the seam. 0 is horizontal, ±π/2 is vertical. */
  streakAngle?: number
  /** Thickness of the seam. Lower is a razor leak, higher is a wash. */
  streakSpread?: number
  /** Strength of the upper-right cool bloom. */
  blobCool?: number
  /** Strength of the blinds / stained-glass bars. */
  slats?: number
  /** Direction of the bars. */
  slatAngle?: number
  /** Width of the ray fan at its top end. */
  slatTopSpread?: number
  /** Width of the ray fan at its bottom end. Differ from the top and the bars splay. */
  slatBottomSpread?: number
  /** How many bars. Higher is tighter stripes. */
  slatFrequency?: number
  /** Extra bars while hovering an excite target. */
  slatFrequencyExcite?: number
  /** Edge hardness. Low is soft bands, high is hard blinds. */
  slatSharpness?: number
}

/**
 * Single source of truth for this effect's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site, and shipped
 * looks live as delta-only presets in `../presets.ts`.
 */
export const LIGHT_LEAK_DEFAULTS = {
  samples: 6,
  dpr: 1,
  blendMode: 'plus-lighter',

  timeScale: 1.59,
  warpAmount: 0.07,
  warpScale: 1.2,

  scrollSpeed: 500,
  scrollCurve: 1,
  scrollDecay: 9.9,
  scrollIntensity: 0.18,
  scrollSmooth: 3.6,
  scrollDrift: 0.56,
  morph: 0.12,
  morphScale: 5,

  excite: true,
  exciteTargets: 'interactive',
  sectionExcite: 0,
  exciteEase: 2.2,
  pointerEase: 5,
  hoverBloom: 0.14,

  dispersion: 0.043,
  dispersionEnergy: 0.064,
  dispersionExcite: 0.009,
  dispersionDirection: [2.1, 1.9],

  gain: 0.29,
  gainEnergy: 1.28,
  gainExcite: 0.1,
  saturation: 0.41,
  saturationExcite: 0.21,
  grain: 0.03,
  grainLuminance: 0.039,
  vignette: 2,
  inkChroma: 1.25,
  inkDensity: 0.32,
  coolTint: [0.21, 0.31, 1.1],
  warmTint: [1.85, 1, 0.68],
  amber: [0.01, 0.32, 0.32],

  blobWarm: 0,
  streak: 0.34,
  streakAngle: -0.26,
  streakSpread: 0.335,
  blobCool: 0.32,
  slats: 0.2,
  slatAngle: -0.65,
  slatTopSpread: 0.05,
  slatBottomSpread: 1.2,
  slatFrequency: 23,
  slatFrequencyExcite: 6.5,
  slatSharpness: 1,
} as const satisfies Partial<LightLeakProps>

/**
 * Every knob with its default filled in: what the scene actually reads, once
 * `resolveTuning` has folded the caller's deltas into `LIGHT_LEAK_DEFAULTS`.
 */
export type LightLeakTuning = Required<Pick<LightLeakProps, keyof typeof LIGHT_LEAK_DEFAULTS>>

/** Fold caller deltas into the defaults once; the scene reads only the result. */
export const resolveLeakTuning = (deltas: Partial<LightLeakProps>): LightLeakTuning =>
  resolveTuning<LightLeakTuning>(LIGHT_LEAK_DEFAULTS, deltas)
