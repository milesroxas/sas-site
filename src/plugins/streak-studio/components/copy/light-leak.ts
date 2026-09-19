import type { LeakParameterKey } from '@/features/immersive/studio/effects'
import {
  LIGHT_LEAK_DEFAULTS,
  type LightLeakTuning,
} from '@/features/immersive/ui/light-leak-tuning'
import type { Dependency, EffectCopy, ParameterCopy } from '../parameters'

/**
 * What the Inspector says about each light leak parameter. Ranges, steps,
 * options and defaults are never restated here: they come from the effect's
 * contract. The meanings are the ones `LightLeakProps` documents.
 */

type LeakDependency = Dependency<LightLeakTuning>

const PARAMETERS: Record<LeakParameterKey, ParameterCopy> = {
  blendMode: {
    label: 'Blend',
    description:
      'How the light adds to a dark ground. A light ground always multiplies: that face is derived.',
    optionLabels: { 'plus-lighter': 'Plus lighter' },
    options: {
      'plus-lighter': 'Straight addition. The brightest, and the one that clips first.',
      screen: 'Addition that eases off toward white, so highlights roll off instead of clipping.',
      lighten: 'Keeps whichever is brighter, channel by channel. The leak never lifts the ground.',
    },
  },
  gain: {
    label: 'Gain',
    description: 'Overall brightness of the leak. On a light ground it is the weight of the stain.',
  },
  gainEnergy: { label: 'Scroll gain', description: 'Extra brightness added by scrolling.' },
  saturation: {
    label: 'Saturation',
    description: 'Colour punch. 0 is gray, above 1 is oversaturated.',
  },
  vignette: { label: 'Vignette', description: 'Darkens the corners of the frame.' },
  grain: { label: 'Grain', description: 'Film grain, only where the leak is visible.' },
  grainLuminance: {
    label: 'Core grain',
    description: 'Extra grain in the bright core of the leak.',
  },
  blobWarm: { label: 'Warm bloom', description: 'Strength of the lower-left warm bloom.' },
  blobCool: { label: 'Cool bloom', description: 'Strength of the upper-right cool bloom.' },
  streak: { label: 'Seam', description: 'Strength of the long seam leak.' },
  streakAngle: {
    label: 'Seam angle',
    description: 'Direction of the seam. 0 is horizontal, 1.57 is vertical.',
    unit: 'rad',
  },
  streakSpread: {
    label: 'Seam spread',
    description: 'Thickness of the seam. Lower is a razor leak, higher is a wash.',
  },
  slats: { label: 'Slats', description: 'Strength of the blinds, the stained-glass bars.' },
  slatAngle: { label: 'Slat angle', description: 'Direction of the bars.', unit: 'rad' },
  slatTopSpread: { label: 'Fan top', description: 'Width of the ray fan at its top end.' },
  slatBottomSpread: {
    label: 'Fan bottom',
    description: 'Width of the ray fan at its bottom end. Differ from the top and the bars splay.',
  },
  slatFrequency: { label: 'Slat count', description: 'How many bars. Higher is tighter stripes.' },
  slatSharpness: {
    label: 'Slat edge',
    description: 'Edge hardness. Low is soft bands, high is hard blinds.',
  },
  coolTint: {
    label: 'Cool tint',
    description: 'Red, green, blue multipliers on dim leak: the shadow side. Above 1 runs hot.',
  },
  warmTint: {
    label: 'Warm tint',
    description: 'Red, green, blue multipliers on bright leak: the highlight side.',
  },
  amber: { label: 'Core', description: 'Red, green, blue dumped into the brightest core.' },
  dispersion: {
    label: 'Dispersion',
    description: 'Resting rainbow split when nothing is moving.',
  },
  dispersionEnergy: {
    label: 'Scroll split',
    description: 'Extra spectral split added by scrolling.',
  },
  dispersionDirection: {
    label: 'Split axis',
    description: 'X and Y of the axis the spectrum slides along. Red bends least, violet most.',
  },
  timeScale: { label: 'Time scale', description: 'Speed of the idle drift. 0 freezes the field.' },
  warpAmount: {
    label: 'Warp',
    description: 'How much noise melts the blooms into organic film. 0 stays geometric.',
  },
  warpScale: {
    label: 'Warp scale',
    description: 'Size of the warp wrinkles. Higher is tighter and noisier.',
  },
  scrollSpeed: {
    label: 'Full flick',
    description: 'Scroll speed that counts as a full-strength flick.',
    unit: 'px/s',
  },
  scrollCurve: {
    label: 'Response curve',
    description: 'Below 1 reacts to the slightest movement, above 1 waits for a hard flick.',
  },
  scrollDecay: {
    label: 'Decay',
    description: 'How fast scroll velocity dies after you stop. Higher settles sooner.',
    unit: '/s',
  },
  scrollIntensity: {
    label: 'Intensity',
    description: 'Master strength of everything scrolling drives: brightness, split, morph.',
  },
  scrollSmooth: {
    label: 'Smoothing',
    description: 'How quickly the leak eases toward the current scroll energy.',
    unit: '/s',
  },
  scrollDrift: {
    label: 'Drift',
    description: 'How far the field physically slides as you scroll.',
  },
  morph: { label: 'Morph', description: 'How much scrolling kneads the field into a new shape.' },
  morphScale: {
    label: 'Morph scale',
    description: 'Size of the scroll-driven wrinkles. Higher is tighter and more turbulent.',
  },
  inkChroma: {
    label: 'Ink chroma',
    description:
      'Light ground only. How hard the stain takes the leak’s hue: 0 prints gray, high prints dye.',
  },
  inkDensity: {
    label: 'Ink density',
    description:
      'Light ground only. Neutral darkening under the leak. Keep it low: it eats the contrast of copy.',
  },
  excite: {
    label: 'Hover flare',
    description: 'Whether the leak answers the pointer at all, inside the section it sits in.',
  },
  exciteTargets: {
    label: 'Flares at',
    description: 'What counts as a full flare, within the section the leak sits in.',
    optionLabels: { interactive: 'Links and buttons', marked: 'Marked elements' },
    options: {
      interactive: 'Every link and button in the section, plus anything marked in code.',
      marked: 'Only the elements the design marks to excite the leak.',
    },
  },
  sectionExcite: {
    label: 'Section hover',
    description:
      'How far the pointer merely crossing the section flares the leak, as a fraction of a full flare. 0 waits for a target.',
  },
  hoverBloom: {
    label: 'Bloom',
    description: 'Light that gathers under the pointer while hovering an excite target.',
  },
  exciteEase: {
    label: 'Flare ease',
    description: 'How fast excitement eases in and out. Low keeps the flare a wash, not a flash.',
    unit: '/s',
  },
  pointerEase: {
    label: 'Follow ease',
    description: 'How fast the gathered light follows the pointer.',
    unit: '/s',
  },
  gainExcite: { label: 'Flare gain', description: 'Extra brightness while hovering.' },
  saturationExcite: { label: 'Flare colour', description: 'Extra colour punch while hovering.' },
  dispersionExcite: { label: 'Flare split', description: 'Extra spectral split while hovering.' },
  slatFrequencyExcite: { label: 'Flare slats', description: 'Extra bars while hovering.' },
}

const needsSeam: LeakDependency = {
  active: (t) => t.streak > 0,
  reason: 'Runs when Seam is above 0.',
  fix: { streak: LIGHT_LEAK_DEFAULTS.streak },
  fixLabel: 'Add the seam',
}
const needsSlats: LeakDependency = {
  active: (t) => t.slats > 0,
  reason: 'Runs when Slats is above 0.',
  fix: { slats: LIGHT_LEAK_DEFAULTS.slats },
  fixLabel: 'Add the slats',
}
const needsFlare: LeakDependency = {
  active: (t) => t.excite,
  reason: 'Runs when Hover flare is on.',
  fix: { excite: true },
  fixLabel: 'Turn the flare on',
}

const DEPENDENCIES: Partial<Record<LeakParameterKey, LeakDependency>> = {
  streakAngle: needsSeam,
  streakSpread: needsSeam,
  slatAngle: needsSlats,
  slatTopSpread: needsSlats,
  slatBottomSpread: needsSlats,
  slatFrequency: needsSlats,
  slatSharpness: needsSlats,
  warpScale: {
    active: (t) => t.warpAmount > 0,
    reason: 'Runs when Warp is above 0.',
    fix: { warpAmount: LIGHT_LEAK_DEFAULTS.warpAmount },
    fixLabel: 'Add the warp',
  },
  morphScale: {
    active: (t) => t.morph > 0,
    reason: 'Runs when Morph is above 0.',
    fix: { morph: LIGHT_LEAK_DEFAULTS.morph },
    fixLabel: 'Add the morph',
  },
  exciteTargets: needsFlare,
  sectionExcite: needsFlare,
  hoverBloom: needsFlare,
  exciteEase: needsFlare,
  pointerEase: needsFlare,
  gainExcite: needsFlare,
  saturationExcite: needsFlare,
  dispersionExcite: needsFlare,
  slatFrequencyExcite: needsFlare,
}

export const LIGHT_LEAK_COPY: EffectCopy<LightLeakTuning, LeakParameterKey> = {
  title: 'Light Leak Studio',
  noun: 'leak',
  parameters: PARAMETERS,
  dependencies: DEPENDENCIES,
  pointerGroup: 'Interaction',
  pointerNote:
    'The flare runs only where a placement allows the pointer and the editor enabled it. It listens inside the section the leak sits in and nowhere else: the links and marked elements of that band, and the pointer crossing it.',
  summary(group, tuning) {
    switch (group) {
      case 'Light':
        return `gain ${tuning.gain}`
      case 'Field':
        return `seam ${tuning.streak} · slats ${tuning.slats}`
      case 'Color':
        return { swatches: [tuning.coolTint, tuning.warmTint] }
      case 'Dispersion':
        return String(tuning.dispersion)
      case 'Motion':
        return `× ${tuning.timeScale}`
      case 'Scroll':
        return `intensity ${tuning.scrollIntensity}`
      case 'Paper':
        return `chroma ${tuning.inkChroma}`
      default:
        return ''
    }
  },
}
