import { resolveTuning } from '../resolve-tuning'
import { STREAK_FIELD_NOISES } from './streak-field-shader'

/**
 * The Streak Field's public knobs and their defaults, kept apart from the
 * Three/R3F scene so the visual contract (`../visual`) and the lazy slot can
 * compose a tuning without loading the renderer chunk. `./streak-field.tsx`
 * re-exports everything here, so `@/features/immersive` is unchanged.
 */

export { STREAK_FIELD_NOISES }

/** A 0..1 RGB colour for the streaks. */
export type StreakFieldInk = readonly [number, number, number]

/**
 * Formula behind the flow field. `none` keeps the streaks on their rows;
 * `value` is a boxy lattice drift, `simplex` a smooth isotropic one, `fbm`
 * adds octaves of detail, `ridged` creases the field into seams, `curl`
 * takes the curl of an fbm potential (a divergence-free swirl that runs
 * along the potential's contours) and `gradient` its slope. The potential is
 * also the height the relief reads.
 */
export type StreakFieldNoise = (typeof STREAK_FIELD_NOISES)[number]

/**
 * Where streaks sit. `rows` scatters them along their rows at random
 * phases, the tape look; `grid` pins instance `i` to cell `i` of a regular
 * row and column grid, the tick-plot look. On the grid, `count` caps how
 * many cells are filled, reading left to right, top to bottom.
 */
export type StreakFieldLayout = 'rows' | 'grid'

/**
 * What each particle is drawn as. `dash` is the streak: a line `thickness`
 * high and between `minLength` and `maxLength` long, that bends with the
 * field. `dot` is a disc: the same length knobs give its diameter (so
 * `lengthBias` and `reliefLength` still size the population), `thickness`
 * is unused, `cap` softens the rim, and it stays rigid under the field.
 */
export type StreakFieldShape = 'dash' | 'dot'

/**
 * How streaks move. `drift` slides them along their rows while the field
 * morphs under them, stateless and deterministic. `flow` advects them
 * through the field: a GPU simulation integrates every particle along the
 * field's direction each frame, so ticks stream out along the flow and
 * respawn at their layout position when their life ends or they leave.
 */
export type StreakFieldMotion = 'drift' | 'flow'

/**
 * The ground the field sits on. Over `dark` the streaks are light; over
 * `light` they are ink. Matches the site's `Theme`, so a page can pass
 * `useSiteTheme()` straight through and the field crossfades with the toggle.
 */
export type StreakFieldSurface = 'dark' | 'light'

export type StreakFieldProps = {
  /**
   * Mounts the canvas even when the device is flagged low-power or the visitor
   * prefers reduced motion. For demos and stories, never for shipped pages.
   */
  force?: boolean
  /** Placement. Defaults to filling the nearest positioned ancestor. */
  className?: string

  // Canvas
  /**
   * Number of streaks alive in the buffer. One draw call regardless, so this
   * is a fill-rate and density lever rather than a CPU one.
   */
  count?: number
  /** Device-pixel-ratio cap. Streaks are a pixel or two thick, so 2 keeps them crisp. */
  dpr?: number
  /**
   * Seed for the per-streak hashes. The same seed always lays out the same
   * field, so a story or a page keeps its composition between loads.
   */
  seed?: number
  /**
   * Quads along each streak. 1 is a rigid dash; more lets a streak bend with
   * the flow field. Costs vertices, not draw calls.
   */
  segments?: number
  /** The ground beneath the field: light streaks over `dark`, ink over `light`. */
  surface?: StreakFieldSurface
  /**
   * How fast the field crossfades when `surface` changes, per second. Higher
   * settles sooner; the ground beneath usually snaps, so this is short.
   */
  surfaceEase?: number

  // Layout
  /** Random phases along rows, or a fixed row and column grid. */
  layout?: StreakFieldLayout
  /** Streaks, or discs sized by the length knobs. */
  shape?: StreakFieldShape
  /** Horizontal distance between grid columns, in CSS px. `grid` only. */
  columnPitch?: number
  /** Vertical distance between rows, in CSS px. */
  rowPitch?: number
  /** How far a streak may sit off its row, as a fraction of the pitch. 0 is a strict grid. */
  rowJitter?: number
  /** Streak height in CSS px. */
  thickness?: number
  /** Shortest streak, in CSS px. */
  minLength?: number
  /** Longest streak, in CSS px. */
  maxLength?: number
  /** Length distribution. 1 is uniform; higher skews the field toward short ticks. */
  lengthBias?: number

  // Motion
  /** Stateless drift along rows, or particles advected through the field. */
  motion?: StreakFieldMotion
  /** `flow` only. Speed along the field's direction, in CSS px/s. */
  flowSpeed?: number
  /** Speed of the drift along the rows in CSS px/s. Negative runs leftward; 0 holds still. In `flow` it is a wind. */
  drift?: number
  /** Per-streak speed variance around the drift, 0..1. */
  driftSpread?: number
  /** Playback rate for everything time-driven. 0 freezes the field. */
  timeScale?: number

  // Flow
  /** Noise formula the flow field runs on. `none` is a straight row grid. */
  noise?: StreakFieldNoise
  /** Size of one flow feature, in CSS px. Larger is a broader, slower swell. */
  noiseScale?: number
  /** How far the field may move a point, in CSS px. */
  noiseStrength?: number
  /** How fast the field evolves, in noise units per second. 0 freezes its shape. */
  noiseSpeed?: number
  /** Octaves of detail for `fbm`, `ridged` and `curl`, 1..6. */
  noiseOctaves?: number
  /** Amplitude ratio between octaves, 0..1. Higher is rougher. */
  noiseGain?: number
  /**
   * Which way the field displaces, 0..1. 0 only bends rows up and down, 1
   * only bunches streaks along their rows, 0.5 does both in full.
   */
  noiseAxis?: number
  /**
   * How far each dash turns to face the field's direction at its centre,
   * 0..1. 0 keeps every dash on its row; 1 draws the field as a tick plot.
   * With `curl` the ticks follow contours, with `gradient` they climb.
   */
  orient?: number

  // Relief
  /** How much the field's height shades brightness, 0..1. 0 ignores height. */
  relief?: number
  /** Height below which ground goes dark, 0..1. Higher leaves only the peaks lit. */
  reliefFloor?: number
  /** Exponent on the shade. 1 is linear; higher pushes light to the peaks. */
  reliefContrast?: number
  /** How much height scales length, 0..1. Low ground shrinks to a dot. */
  reliefLength?: number

  // Pointer
  /** Reach of the pointer's influence, in CSS px. 0 turns the pointer off. */
  pointerRadius?: number
  /** Radial displacement under the pointer, in CSS px. Negative pulls the field in. */
  pointerPush?: number
  /** Tangential displacement under the pointer, in CSS px: a vortex. */
  pointerSwirl?: number
  /**
   * Displacement along the pointer's motion, as seconds of its velocity:
   * 0.04 moves the field 40 px at 1000 px/s. Capped at the radius.
   */
  pointerWake?: number
  /** Extra flow amplitude under the pointer, as a multiple of `noiseStrength`. */
  pointerAgitate?: number
  /** Extra brightness under the pointer, as a multiple of the streak's own. */
  pointerGlow?: number
  /** Height added to the relief under the pointer, -1..1. Negative digs. */
  pointerLift?: number
  /** How fast the field's pointer follows the real one, per second. Lower is lazier. */
  pointerEase?: number

  // Life
  /** Seconds a streak lives before it fades and is reborn elsewhere on its row. */
  lifetime?: number
  /** Per-streak lifetime variance, 0..1. Keeps the field from breathing in unison. */
  lifeSpread?: number
  /** Fraction of the life spent fading in. */
  fadeIn?: number
  /** Fraction of the life spent fading out. */
  fadeOut?: number

  // Look
  /** Streak colour over a dark ground. Emissive, so it only ever adds light. */
  ink?: StreakFieldInk
  /** Streak colour over a light ground. */
  paperInk?: StreakFieldInk
  /** Overall intensity. Brightness over a dark ground, coverage over a light one. */
  brightness?: number
  /** Per-streak brightness range, 0..1. 0 is a uniform field; 1 lets streaks go fully dim. */
  brightnessSpread?: number
  /** Depth of the per-streak shimmer, 0..1. */
  flicker?: number
  /** Shimmer rate in Hz. */
  flickerRate?: number
  /** How much each streak fades from its head to its tail. 0 is a flat dash. */
  tail?: number
  /** Softening at each end of a streak, in CSS px. */
  cap?: number
}

/**
 * Single source of truth for this effect's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site, and shipped
 * looks live as delta-only presets in `../presets.ts`.
 */
export const STREAK_FIELD_DEFAULTS = {
  count: 20000,
  dpr: 2,
  seed: 694,
  segments: 1,
  surface: 'dark',
  surfaceEase: 15.5,

  layout: 'rows',
  shape: 'dash',
  columnPitch: 4,
  rowPitch: 4,
  rowJitter: 0,
  thickness: 2.8,
  minLength: 4,
  maxLength: 7,
  lengthBias: 6,

  motion: 'drift',
  flowSpeed: 40,
  drift: 4,
  driftSpread: 0,
  timeScale: 1.2,

  noise: 'fbm',
  noiseScale: 1080,
  noiseStrength: 0,
  noiseSpeed: 0.08,
  noiseOctaves: 3,
  noiseGain: 0.5,
  noiseAxis: 0.5,
  orient: 0,

  relief: 0.73,
  reliefFloor: 0.42,
  reliefContrast: 1.65,
  reliefLength: 0.82,

  pointerRadius: 420,
  pointerPush: 0,
  pointerSwirl: 0,
  pointerWake: 0.19,
  pointerAgitate: 4.2,
  pointerGlow: 2.15,
  pointerLift: 0.25,
  pointerEase: 3,

  lifetime: 11.4,
  lifeSpread: 0.62,
  fadeIn: 0.05,
  fadeOut: 0.09,

  ink: [0.518, 0.655, 1],
  paperInk: [0.31, 0.361, 0.502],
  brightness: 1.18,
  brightnessSpread: 0.51,
  flicker: 0.31,
  flickerRate: 0.7,
  tail: 0.42,
  cap: 2,
} as const satisfies Partial<StreakFieldProps>

/**
 * Every knob with its default filled in: what the scene actually reads, once
 * `resolveTuning` has folded the caller's deltas into `STREAK_FIELD_DEFAULTS`.
 */
export type StreakFieldTuning = Required<Pick<StreakFieldProps, keyof typeof STREAK_FIELD_DEFAULTS>>

/** Fold caller deltas into the defaults once; the scene reads only the result. */
export const resolveStreakTuning = (deltas: Partial<StreakFieldProps>): StreakFieldTuning =>
  resolveTuning<StreakFieldTuning>(STREAK_FIELD_DEFAULTS, deltas)
