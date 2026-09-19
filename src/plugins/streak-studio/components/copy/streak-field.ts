import type { StreakParameterKey } from '@/features/immersive/studio/effects'
import {
  STREAK_FIELD_DEFAULTS,
  type StreakFieldTuning,
} from '@/features/immersive/ui/streak-field-tuning'
import type { Dependency, EffectCopy, ParameterCopy } from '../parameters'

/**
 * What the Inspector says about each Streak Field parameter. Ranges, steps,
 * options and defaults are never restated here: they come from the effect's
 * contract. This file owns only the reading: the label, the one-line meaning
 * (from docs/streak-field.md), the unit, and when a control does nothing
 * until another setting changes.
 */

type StreakDependency = Dependency<StreakFieldTuning>

const PARAMETERS: Record<StreakParameterKey, ParameterCopy> = {
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

const needsNoise: StreakDependency = {
  active: (t) => t.noise !== 'none',
  reason: 'Runs when Noise is not None.',
  fix: { noise: 'fbm' },
  fixLabel: 'Set Noise to fBm',
}
const needsPointer: StreakDependency = {
  active: (t) => t.pointerRadius > 0,
  reason: 'Runs when Radius is above 0.',
  fix: { pointerRadius: STREAK_FIELD_DEFAULTS.pointerRadius },
  fixLabel: 'Open the radius',
}

const DEPENDENCIES: Partial<Record<StreakParameterKey, StreakDependency>> = {
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

const option = (key: StreakParameterKey, value: string) =>
  PARAMETERS[key].optionLabels?.[value] ?? value.replace(/^./, (c) => c.toUpperCase())

export const STREAK_FIELD_COPY: EffectCopy<StreakFieldTuning, StreakParameterKey> = {
  title: 'Streak Field Studio',
  noun: 'field',
  parameters: PARAMETERS,
  dependencies: DEPENDENCIES,
  ranges: [{ keys: ['minLength', 'maxLength'], label: 'Length' }],
  pointerGroup: 'Interaction',
  pointerNote:
    'Pointer terms run only where a placement allows them and the editor enabled them. Radius 0 turns every term off.',
  hint: (key, tuning) =>
    key === 'noise' && tuning.noise !== 'none' ? `${tuning.noiseOctaves} octaves` : undefined,
  summary(group, tuning) {
    switch (group) {
      case 'Composition':
        return `${option('layout', tuning.layout)} · ${option('shape', tuning.shape)}`
      case 'Motion':
        return option('motion', tuning.motion)
      case 'Flow':
        return tuning.noise === 'none'
          ? option('noise', 'none')
          : `${option('noise', tuning.noise)} · ${tuning.noiseScale}`
      case 'Relief':
        return `${tuning.relief} · floor ${tuning.reliefFloor}`
      case 'Color':
        return { swatches: [tuning.ink, tuning.paperInk] }
      case 'Life':
        return `${tuning.lifetime} s`
      default:
        return ''
    }
  },
}
