import { STREAK_FIELD_PAPER } from '../../presets'
import { STREAK_FIELD_DEFAULTS, type StreakFieldTuning } from '../../ui/streak-field-tuning'
import { STREAK_FALLBACK_LOOK, STREAK_LOOK_REVISION, STREAK_LOOKS } from '../../visual/looks'
import { PLACEMENT_LIMITS, type VisualPlacement } from '../../visual/placement'
import { type EffectContract, range, unit } from '../effect'

/** The count a field may run at under a noise formula that costs a second field evaluation per streak. */
const EXPENSIVE_NOISE_COUNT = 4000
const isExpensiveNoise = (tuning: StreakFieldTuning) =>
  tuning.noise === 'curl' || tuning.noise === 'gradient'

/**
 * Final caps apply after all creative overrides, including slot multipliers.
 * Idempotent, and it holds both ends of every code-owned number, so a snapshot
 * read back from storage is safe to draw once it has been through here.
 */
export function limitStreakTuning(
  tuning: StreakFieldTuning,
  placement: VisualPlacement,
): StreakFieldTuning {
  const limits = PLACEMENT_LIMITS[placement]
  const expensiveNoise = isExpensiveNoise(tuning)
  const count = Math.min(
    tuning.count,
    limits.count || 1000,
    expensiveNoise ? EXPENSIVE_NOISE_COUNT : PLACEMENT_LIMITS.hero.count,
    Math.floor(
      800000 /
        Math.max(
          1,
          tuning.maxLength * (tuning.shape === 'dot' ? tuning.maxLength : tuning.thickness),
        ),
    ),
  )
  return {
    ...tuning,
    count: Math.max(1, count),
    dpr: Math.max(1, Math.min(tuning.dpr, limits.dpr)),
    segments: 1,
    noiseOctaves: Math.max(1, Math.min(tuning.noiseOctaves, expensiveNoise ? 2 : 3)),
    pointerRadius: limits.pointer ? tuning.pointerRadius : 0,
  }
}

/**
 * The Streak Field's authoring contract. Resource allocation stays code-owned:
 * `dpr`, `segments` and `noiseOctaves` are absent from the parameters and are
 * set by the placement. `count` is the exception, because it is a composition
 * lever before it is a cost one: at a fixed count, widening `rowPitch` only
 * packs the surviving rows tighter, so without it a sparse field cannot be
 * authored at all and every look ships at its placement ceiling. Its range
 * stops at the ceiling the most generous placement grants
 * (`PLACEMENT_LIMITS.hero`), so a recipe can ask for less than code allows and
 * never for more.
 */
export const STREAK_FIELD_EFFECT = {
  id: 'streakField',
  label: 'Streak Field',
  renderer: 'streak-1',
  defaults: STREAK_FIELD_DEFAULTS,
  parameters: {
    layout: { group: 'Composition', options: ['rows', 'grid'] },
    shape: { group: 'Composition', options: ['dash', 'dot'] },
    count: range('Composition', 100, PLACEMENT_LIMITS.hero.count, 100),
    columnPitch: range('Composition', 4, 100, 1),
    rowPitch: range('Composition', 4, 100, 1),
    rowJitter: unit('Composition'),
    thickness: range('Composition', 0.2, 4, 0.1),
    minLength: range('Composition', 1, 80, 1),
    maxLength: range('Composition', 1, 80, 1),
    lengthBias: range('Composition', 1, 10, 0.1),
    motion: { group: 'Motion', options: ['drift', 'flow'] },
    flowSpeed: range('Motion', 0, 100, 1),
    drift: range('Motion', -50, 50, 1),
    driftSpread: unit('Motion'),
    timeScale: range('Motion', 0, 1.5, 0.05),
    noise: {
      group: 'Flow',
      options: ['none', 'value', 'simplex', 'fbm', 'ridged', 'curl', 'gradient'],
    },
    noiseScale: range('Flow', 100, 2000, 10),
    noiseStrength: range('Flow', 0, 200, 1),
    noiseSpeed: range('Flow', 0, 0.5),
    noiseGain: range('Flow', 0, 0.6),
    noiseAxis: unit('Flow'),
    orient: unit('Flow'),
    relief: unit('Relief'),
    reliefFloor: unit('Relief'),
    reliefContrast: range('Relief', 0.5, 5, 0.05),
    reliefLength: unit('Relief'),
    ink: { group: 'Color', color: true },
    paperInk: { group: 'Color', color: true },
    brightness: range('Color', 0, 1.5),
    brightnessSpread: unit('Color'),
    flicker: unit('Color'),
    flickerRate: range('Color', 0, 2),
    tail: unit('Color'),
    cap: range('Color', 0, 8, 0.1),
    lifetime: range('Life', 2, 30, 0.1),
    lifeSpread: range('Life', 0, 0.9),
    fadeIn: range('Life', 0, 0.4),
    fadeOut: range('Life', 0, 0.4),
    pointerRadius: range('Interaction', 0, 500, 10),
    pointerPush: range('Interaction', -100, 100, 1),
    pointerSwirl: range('Interaction', -100, 100, 1),
    pointerWake: range('Interaction', 0, 0.2),
    pointerAgitate: range('Interaction', 0, 4.2, 0.1),
    pointerGlow: range('Interaction', 0, 3, 0.1),
    pointerLift: range('Interaction', -1, 1),
    pointerEase: range('Interaction', 1, 20, 0.5),
  },
  looks: STREAK_LOOKS,
  fallbackLook: STREAK_FALLBACK_LOOK,
  lookRevision: STREAK_LOOK_REVISION,
  posterDirectory: 'streak-field',
  seeded: true,
  slot: { seed: true, bleed: false, media: false },
  face: (tuning, surface) => ({
    ...tuning,
    ...(surface === 'light' ? STREAK_FIELD_PAPER : {}),
    surface,
  }),
  limit: limitStreakTuning,
  check(tuning) {
    if (tuning.minLength > tuning.maxLength)
      throw new Error('Minimum length cannot exceed maximum length.')
  },
  budget(limited, requested, placement) {
    const capped = limited.count < requested.count
    const particles = capped
      ? `${limited.count.toLocaleString()} of ${requested.count.toLocaleString()} particles, capped to the ${placement} budget`
      : `${limited.count.toLocaleString()} particles`
    return {
      capped,
      text: `${particles} · DPR ≤ ${limited.dpr} · ${limited.noiseOctaves} octaves · ${limited.segments} segment`,
    }
  },
  lookTag: (look) => STREAK_LOOKS[look.id as keyof typeof STREAK_LOOKS]?.motion,
} as const satisfies EffectContract<StreakFieldTuning>

export type StreakParameterKey = keyof typeof STREAK_FIELD_EFFECT.parameters
