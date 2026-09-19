import { LIGHT_LEAK_AMBER, LIGHT_LEAK_PAPER } from '../../presets'
import {
  LEAK_EXCITE_TARGETS,
  LIGHT_LEAK_DEFAULTS,
  type LightLeakTuning,
} from '../../ui/light-leak-tuning'
import { PLACEMENT_LIMITS, type VisualPlacement } from '../../visual/placement'
import { type EffectContract, type EffectLook, range, type Tuning, unit, vector } from '../effect'

/**
 * What a live leak may cost per placement. `samples` is the leak's one real
 * lever: the field is evaluated `samples * 6` times per pixel and the count is
 * a compile-time constant, so it is code-owned and never an Inspector row. The
 * leak is all low-frequency light, so no placement earns more than DPR 1.
 */
export const LEAK_PLACEMENT_LIMITS: Record<VisualPlacement, { samples: number; dpr: number }> = {
  hero: { samples: LIGHT_LEAK_DEFAULTS.samples, dpr: 1 },
  block: { samples: 4, dpr: 1 },
  menu: { samples: 2, dpr: 1 },
  card: { samples: 2, dpr: 1 },
}

export function limitLeakTuning(
  tuning: LightLeakTuning,
  placement: VisualPlacement,
): LightLeakTuning {
  const limits = LEAK_PLACEMENT_LIMITS[placement]
  const excite = tuning.excite && PLACEMENT_LIMITS[placement].pointer
  return {
    ...tuning,
    samples: Math.max(1, Math.min(Math.round(tuning.samples), limits.samples)),
    dpr: Math.max(1, Math.min(tuning.dpr, limits.dpr)),
    excite,
    // The band's own answer is part of the flare, so it goes with it: a
    // placement that never sees the pointer reports no hover response at all.
    sectionExcite: excite ? tuning.sectionExcite : 0,
  }
}

/**
 * The strengths whose meaning flips with the ground: light added over film
 * becomes shade printed on paper, so what reads as a lit frame on one is a
 * heavy smudge on the other. `LIGHT_LEAK_PAPER` holds the shipped translation
 * of each; an authored value is carried across by the same ratio.
 */
const POLARITY_KEYS = [
  'dispersion',
  'dispersionEnergy',
  'gain',
  'gainEnergy',
  'saturationExcite',
  'hoverBloom',
  'grain',
  'grainLuminance',
] as const satisfies readonly (keyof typeof LIGHT_LEAK_PAPER)[]

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/**
 * The light-ground face of a leak authored on the dark one. A knob the author
 * never touched takes the shipped paper value, so an untouched leak is exactly
 * `LIGHT_LEAK_PAPER`. A knob they did touch is theirs: art direction (tints,
 * blooms, slats) carries over as authored, and a polarity strength is scaled
 * by the ratio the paper look applies to its default, held to the parameter's
 * range. The blend mode is never the author's to carry: it is the polarity.
 */
function paperFace(tuning: LightLeakTuning): LightLeakTuning {
  const face: Tuning = { ...tuning }
  for (const [key, paper] of Object.entries(LIGHT_LEAK_PAPER)) {
    const base = LIGHT_LEAK_DEFAULTS[key as keyof typeof LIGHT_LEAK_PAPER]
    const authored = face[key]
    if (key === 'blendMode' || sameValue(authored, base)) face[key] = paper
    else if ((POLARITY_KEYS as readonly string[]).includes(key)) {
      const spec = LIGHT_LEAK_EFFECT.parameters[key as (typeof POLARITY_KEYS)[number]]
      const scaled = (Number(authored) * Number(paper)) / Number(base)
      face[key] = Math.max(spec.min, Math.min(spec.max, scaled))
    }
  }
  return face as LightLeakTuning
}

const look = <T extends EffectLook<LightLeakTuning>>(value: T) => value

/**
 * The light leak's authoring contract. `samples` and `dpr` are code-owned and
 * set by the placement. The blend mode offers only the emissive modes: the
 * author tunes light over film, and the paper face is derived (`paperFace`).
 */
export const LIGHT_LEAK_EFFECT = {
  id: 'lightLeak',
  label: 'Light leak',
  renderer: 'leak-1',
  defaults: LIGHT_LEAK_DEFAULTS,
  parameters: {
    blendMode: {
      group: 'Light',
      options: ['plus-lighter', 'screen', 'lighten'],
      // The paper face's polarity (`paperFace`), never an author's choice.
      derived: [LIGHT_LEAK_PAPER.blendMode],
    },
    gain: range('Light', 0, 3),
    gainEnergy: range('Light', 0, 2),
    saturation: range('Light', 0, 3),
    vignette: range('Light', 0, 2),
    grain: range('Light', 0, 0.2, 0.001),
    grainLuminance: range('Light', 0, 0.3, 0.001),
    blobWarm: range('Field', 0, 3),
    blobCool: range('Field', 0, 3),
    streak: range('Field', 0, 3),
    streakAngle: range('Field', -3.14, 3.14),
    streakSpread: range('Field', 0.005, 0.5, 0.005),
    slats: range('Field', 0, 3),
    slatAngle: range('Field', -3.14, 3.14),
    slatTopSpread: range('Field', 0.01, 1.2),
    slatBottomSpread: range('Field', 0.01, 1.2),
    slatFrequency: range('Field', 1, 60, 0.5),
    slatSharpness: range('Field', 0.5, 8, 0.1),
    coolTint: vector('Color', 3, 0, 2),
    warmTint: vector('Color', 3, 0, 2),
    amber: vector('Color', 3, 0, 1),
    dispersion: range('Dispersion', 0, 0.08, 0.001),
    dispersionEnergy: range('Dispersion', 0, 0.2, 0.001),
    dispersionDirection: vector('Dispersion', 2, -3, 3, 0.1),
    timeScale: range('Motion', 0, 2),
    warpAmount: range('Motion', 0, 1.5),
    warpScale: range('Motion', 0.1, 8, 0.1),
    scrollSpeed: range('Scroll', 100, 3000, 10),
    scrollCurve: range('Scroll', 0.3, 3, 0.05),
    scrollDecay: range('Scroll', 0.1, 12, 0.1),
    scrollIntensity: unit('Scroll'),
    scrollSmooth: range('Scroll', 0.1, 12, 0.1),
    scrollDrift: range('Scroll', 0, 2),
    morph: range('Scroll', 0, 2),
    morphScale: range('Scroll', 0.1, 12, 0.1),
    inkChroma: range('Paper', 0, 3),
    inkDensity: range('Paper', 0, 1.5),
    excite: { group: 'Interaction', toggle: true },
    exciteTargets: { group: 'Interaction', options: LEAK_EXCITE_TARGETS },
    sectionExcite: unit('Interaction'),
    hoverBloom: range('Interaction', 0, 4),
    exciteEase: range('Interaction', 0.5, 12, 0.1),
    pointerEase: range('Interaction', 0.5, 12, 0.1),
    gainExcite: range('Interaction', 0, 2),
    saturationExcite: range('Interaction', 0, 2),
    dispersionExcite: range('Interaction', 0, 0.2, 0.001),
    slatFrequencyExcite: range('Interaction', 0, 20, 0.5),
  },
  looks: {
    'film-v1': look({
      id: 'film-v1',
      label: 'Film',
      description:
        'Blue shadow and cream highlight through a wide, splayed slat fan. The default leak.',
      tuning: {},
    }),
    'amber-v1': look({
      id: 'amber-v1',
      label: 'Amber',
      description: 'Hot gold over lilac, the fan pulled to a razor, with a stronger hover flare.',
      tuning: LIGHT_LEAK_AMBER,
    }),
  },
  fallbackLook: 'film-v1',
  lookRevision: 1,
  posterDirectory: 'light-leak',
  seeded: false,
  slot: { seed: false, bleed: true, media: true, hover: true },
  face: (tuning, surface) => (surface === 'light' ? paperFace(tuning) : tuning),
  limit: limitLeakTuning,
  blend: (tuning) => tuning.blendMode,
  budget: (limited) => ({
    capped: false,
    text: `${limited.samples * 6} field taps per pixel · DPR ≤ ${limited.dpr}`,
  }),
} as const satisfies EffectContract<LightLeakTuning>

export type LeakParameterKey = keyof typeof LIGHT_LEAK_EFFECT.parameters
export type LeakLookId = keyof typeof LIGHT_LEAK_EFFECT.looks
