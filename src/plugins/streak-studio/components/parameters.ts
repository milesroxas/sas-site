import { STREAK_FIELD_DEFAULTS } from '@/features/immersive'
import {
  type RecipeDeltas,
  STREAK_PARAMETERS,
  type StreakFieldTuning,
} from '@/features/immersive/studio/recipe'

export type ParameterKey = keyof RecipeDeltas
export type ParameterSpec = (typeof STREAK_PARAMETERS)[ParameterKey]

/**
 * What the Inspector says about each authorable parameter. Ranges, steps,
 * options and defaults are never restated here: they come from
 * `STREAK_PARAMETERS` and `STREAK_FIELD_DEFAULTS`. This file owns only the
 * reading: the label, the one-line meaning (from docs/streak-field.md), the
 * unit, and when a control does nothing until another setting changes.
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

/** How an option reads in a control: the authored name, else Capitalized. */
export const optionLabel = (name: ParameterKey, option: string) =>
  PARAMETER_COPY[name].optionLabels?.[option] ??
  option.replace(/^./, (character) => character.toUpperCase())

export const PARAMETER_COPY: Record<ParameterKey, ParameterCopy> = {
  layout: {
    label: 'Layout',
    description: 'Rows scatters streaks along their rows. Grid pins each to a cell.',
    options: {
      rows: 'Streaks sit along their rows at random phases: the tape look.',
      grid: 'Each streak is pinned to a cell of the pitch grid: the tick-plot look.',
    },
  },
  shape: {
    label: 'Shape',
    description: 'A dash bends with the field. A dot is a rigid disc.',
    options: {
      dash: 'A streak, thickness high and min to max length long, that bends with the field.',
      dot: 'A disc. Length sets its diameter, cap softens its rim, thickness is unused.',
    },
  },
  count: {
    label: 'Count',
    description: 'Streaks alive in the field. With the pitches, this is what density reads as.',
  },
  columnPitch: {
    label: 'Column pitch',
    description: 'Horizontal cell spacing. Grid layout only.',
    unit: 'px',
  },
  rowPitch: {
    label: 'Row pitch',
    description: 'Vertical row spacing. With count, this sets apparent density.',
    unit: 'px',
  },
  rowJitter: {
    label: 'Row jitter',
    description: 'How far a streak may sit off its row, as a fraction of the pitch.',
  },
  thickness: {
    label: 'Thickness',
    description: 'Streak height in CSS px. Over a light ground the paper treatment adds to it.',
    unit: 'px',
  },
  minLength: {
    label: 'Min length',
    description: 'Shortest streak. Equal min and max give a uniform tick field.',
    unit: 'px',
  },
  maxLength: {
    label: 'Max length',
    description: 'Longest streak. Equal min and max give a uniform tick field.',
    unit: 'px',
  },
  lengthBias: {
    label: 'Length bias',
    description: '1 is uniform. Higher skews the field toward short ticks with a few long ones.',
  },
  motion: {
    label: 'Motion',
    description: 'Drift slides streaks along their rows. Flow advects them through the field.',
    options: {
      drift: 'Streaks slide along their rows while the field morphs under them. No simulation.',
      flow: 'Particles stream through the field on the GPU and respawn when their life ends.',
    },
  },
  flowSpeed: {
    label: 'Flow speed',
    description: 'Speed along the field direction.',
    unit: 'px/s',
  },
  drift: {
    label: 'Drift',
    description: 'Speed along the rows. Negative creeps left, 0 holds still.',
    unit: 'px/s',
  },
  driftSpread: {
    label: 'Drift spread',
    description: 'Per-streak speed variance. Above 0 the field stops moving as one sheet.',
  },
  timeScale: {
    label: 'Time scale',
    description: 'Playback rate for everything time-driven. 0 freezes the field.',
  },
  noise: {
    label: 'Noise',
    description: 'The field formula. It displaces streaks and supplies the height relief reads.',
    optionLabels: { fbm: 'fBm' },
    options: {
      none: 'Streaks stay on their rows: no displacement, no relief, no orientation.',
      value: 'A boxy lattice drift.',
      simplex: 'A smooth isotropic drift.',
      fbm: 'Simplex with octaves of finer detail.',
      ridged: 'The field creased into seams.',
      curl: 'A divergence-free swirl that runs along contours.',
      gradient: 'The slope of the field: straight up the hill.',
    },
  },
  noiseScale: {
    label: 'Noise scale',
    description: 'Size of one feature. Larger is a broader, slower swell.',
    unit: 'px',
  },
  noiseStrength: {
    label: 'Noise strength',
    description: 'How far the field may push a point. 0 only shades and orients.',
    unit: 'px',
  },
  noiseSpeed: {
    label: 'Noise speed',
    description: 'How fast the field evolves. 0 freezes its shape.',
  },
  noiseGain: {
    label: 'Noise gain',
    description: 'Amplitude ratio between octaves. Higher is rougher.',
  },
  noiseAxis: {
    label: 'Noise axis',
    description: '0 bends rows up and down only, 1 bunches streaks along rows only.',
  },
  orient: {
    label: 'Orient',
    description: 'How far each dash turns to face the field. 1 is a full tick plot.',
  },
  relief: {
    label: 'Relief',
    description: 'How much height shades brightness. 0 ignores height.',
  },
  reliefFloor: {
    label: 'Relief floor',
    description: 'Height below which ground goes dark. Raise it and only crests survive.',
  },
  reliefContrast: {
    label: 'Relief contrast',
    description: 'Exponent on the shade. Higher pushes light onto the peaks.',
  },
  reliefLength: {
    label: 'Relief length',
    description: 'How much height scales length, so altitude reads as size too.',
  },
  ink: {
    label: 'Ink',
    description: 'Streak color over a dark ground. Emissive: it only adds light.',
  },
  paperInk: {
    label: 'Paper ink',
    description: 'Streak color over a light ground.',
  },
  brightness: {
    label: 'Brightness',
    description: 'Overall intensity. Over dark it is brightness, over light it is coverage.',
  },
  brightnessSpread: {
    label: 'Brightness spread',
    description: 'Per-streak brightness range. 1 lets streaks go fully dim, which gives depth.',
  },
  flicker: {
    label: 'Flicker',
    description: 'Depth of the per-streak shimmer. Paper looks run it lower.',
  },
  flickerRate: {
    label: 'Flicker rate',
    description: 'Shimmer rate.',
    unit: 'Hz',
  },
  tail: {
    label: 'Tail',
    description: 'How much a streak fades head to tail. 0 is a flat dash.',
  },
  cap: {
    label: 'Cap',
    description: 'Softening at each end. On a dot it softens the rim.',
    unit: 'px',
  },
  lifetime: {
    label: 'Lifetime',
    description: 'Seconds a streak lives before fading and being reborn on its row.',
    unit: 's',
  },
  lifeSpread: {
    label: 'Life spread',
    description: 'Per-streak lifetime variance. Push it up when the whole field pulses.',
  },
  fadeIn: {
    label: 'Fade in',
    description: 'Fraction of the life spent fading in.',
  },
  fadeOut: {
    label: 'Fade out',
    description: 'Fraction of the life spent fading out.',
  },
  pointerRadius: {
    label: 'Radius',
    description: 'Reach of the pointer influence. 0 turns every pointer term off.',
    unit: 'px',
  },
  pointerPush: {
    label: 'Push',
    description: 'Radial displacement. Negative pulls the field inward.',
    unit: 'px',
  },
  pointerSwirl: {
    label: 'Swirl',
    description: 'Tangential displacement: a vortex around the cursor.',
    unit: 'px',
  },
  pointerWake: {
    label: 'Wake',
    description: 'Displacement along the pointer motion, in seconds of its velocity.',
    unit: 's',
  },
  pointerAgitate: {
    label: 'Agitate',
    description: 'Extra flow amplitude under the pointer, as a multiple of noise strength.',
  },
  pointerGlow: {
    label: 'Glow',
    description: 'Extra brightness under the pointer, as a multiple of the streak own.',
  },
  pointerLift: {
    label: 'Lift',
    description: 'Height added to the relief under the pointer. Negative digs a hollow.',
  },
  pointerEase: {
    label: 'Ease',
    description: 'How fast the field pointer follows the real one. Lower is lazier.',
    unit: '/s',
  },
}

/**
 * A control that does nothing until another setting changes. The row shows
 * muted with the reason under it, and clicking the row applies `fix`.
 */
export type Dependency = {
  active: (tuning: StreakFieldTuning) => boolean
  reason: string
  fix?: Partial<RecipeDeltas>
  /** What the button under the row does, in its own words. */
  fixLabel?: string
}

const needsNoise: Dependency = {
  active: (t) => t.noise !== 'none',
  reason: 'Runs when Noise is not None.',
  fix: { noise: 'fbm' },
  fixLabel: 'Set Noise to fBm',
}
const needsPointer: Dependency = {
  active: (t) => t.pointerRadius > 0,
  reason: 'Runs when Radius is above 0.',
  fix: { pointerRadius: STREAK_FIELD_DEFAULTS.pointerRadius },
  fixLabel: 'Open the radius',
}

export const DEPENDENCIES: Partial<Record<ParameterKey, Dependency>> = {
  columnPitch: {
    active: (t) => t.layout === 'grid',
    reason: 'Runs when Layout is Grid.',
    fix: { layout: 'grid' },
    fixLabel: 'Switch to Grid',
  },
  thickness: {
    active: (t) => t.shape === 'dash',
    reason: 'Runs when Shape is Dash.',
    fix: { shape: 'dash' },
    fixLabel: 'Switch to Dash',
  },
  flowSpeed: {
    active: (t) => t.motion === 'flow',
    reason: 'Runs when Motion is Flow.',
    fix: { motion: 'flow' },
    fixLabel: 'Switch to Flow',
  },
  noiseScale: needsNoise,
  noiseStrength: needsNoise,
  noiseSpeed: needsNoise,
  noiseAxis: needsNoise,
  orient: needsNoise,
  noiseGain: {
    active: (t) => ['fbm', 'ridged', 'curl'].includes(t.noise),
    reason: 'Runs when Noise has octaves (fBm, Ridged, Curl).',
    fix: { noise: 'fbm' },
    fixLabel: 'Set Noise to fBm',
  },
  relief: needsNoise,
  reliefFloor: needsNoise,
  reliefContrast: needsNoise,
  reliefLength: needsNoise,
  flickerRate: {
    active: (t) => t.flicker > 0,
    reason: 'Runs when Flicker is above 0.',
    fix: { flicker: STREAK_FIELD_DEFAULTS.flicker },
    fixLabel: 'Add flicker',
  },
  pointerPush: needsPointer,
  pointerSwirl: needsPointer,
  pointerWake: needsPointer,
  pointerGlow: needsPointer,
  pointerLift: needsPointer,
  pointerEase: needsPointer,
  pointerAgitate: {
    active: (t) => t.pointerRadius > 0 && t.noiseStrength > 0,
    reason: 'Runs when Radius and Noise strength are above 0.',
    // The default strength is 0, so the fix has to pick a visible amount.
    fix: { pointerRadius: STREAK_FIELD_DEFAULTS.pointerRadius, noiseStrength: 40 },
    fixLabel: 'Set both',
  },
}

/** Group order in the Inspector, and which tab each lives on. */
export const GROUPS = ['Composition', 'Motion', 'Flow', 'Relief', 'Color', 'Life'] as const
export const POINTER_GROUP = 'Interaction'
export type GroupName = (typeof GROUPS)[number] | typeof POINTER_GROUP

export const parameterKeys = (group: string): ParameterKey[] =>
  (Object.keys(STREAK_PARAMETERS) as ParameterKey[]).filter(
    (key) => STREAK_PARAMETERS[key].group === group,
  )

/** Decimal places a value shows, derived from the parameter's step. */
export const decimals = (spec: ParameterSpec): number => {
  if (!('step' in spec) || spec.step === undefined || spec.step >= 1) return 0
  return String(spec.step).split('.')[1]?.length ?? 0
}

/** A value at the parameter's precision with trailing zeros dropped: 0, 1.2, 0.08. */
export const formatValue = (spec: ParameterSpec, value: number) =>
  String(Number(value.toFixed(decimals(spec))))

export const toHex = (rgb: readonly number[]) =>
  `#${rgb
    .map((n) =>
      Math.round(n * 255)
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

/** One line for a collapsed group header: what it is set to at a glance. */
export const groupSummary = (group: string, tuning: StreakFieldTuning): string => {
  switch (group) {
    case 'Composition':
      return `${optionLabel('layout', tuning.layout)} · ${optionLabel('shape', tuning.shape)}`
    case 'Motion':
      return optionLabel('motion', tuning.motion)
    case 'Flow':
      return tuning.noise === 'none'
        ? optionLabel('noise', 'none')
        : `${optionLabel('noise', tuning.noise)} · ${tuning.noiseScale}`
    case 'Relief':
      return `${tuning.relief} · floor ${tuning.reliefFloor}`
    case 'Life':
      return `${tuning.lifetime} s`
    case 'Interaction':
      return tuning.pointerRadius ? `${tuning.pointerRadius} px` : 'off'
    default:
      return ''
  }
}
