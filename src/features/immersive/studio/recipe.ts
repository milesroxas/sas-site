import { STREAK_FIELD_PAPER } from '../presets'
import {
  resolveStreakTuning,
  STREAK_FIELD_DEFAULTS,
  type StreakFieldTuning,
} from '../ui/streak-field-tuning'
import { STREAK_LOOKS, type StreakLookId } from '../visual/looks'
import { PLACEMENT_LIMITS, type VisualPlacement } from '../visual/placement'

export const STREAK_RENDERER_VERSION = 'streak-1'
export const STREAK_RECIPE_VERSION = 1
type Parameter =
  | { group: string; min: number; max: number; step?: number }
  | { group: string; options: readonly string[] }
  | { group: string; color: true }
const range = (group: string, min: number, max: number, step = 0.01): Parameter => ({
  group,
  min,
  max,
  step,
})
const unit = (group: string) => range(group, 0, 1)
/** Shared authoring contract. Resource allocation is deliberately absent. */
export const STREAK_PARAMETERS = {
  layout: { group: 'Composition', options: ['rows', 'grid'] },
  shape: { group: 'Composition', options: ['dash', 'dot'] },
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
} as const satisfies Partial<Record<keyof StreakFieldTuning, Parameter>>
export type RecipeDeltas = Partial<Pick<StreakFieldTuning, keyof typeof STREAK_PARAMETERS>>
export type StreakRecipe = { version: 1; seed: number; deltas: RecipeDeltas; frame: number }
export type StreakSnapshot = {
  renderer: string
  dark: StreakFieldTuning
  light: StreakFieldTuning
  frame: number
}
export const emptyRecipe = (): StreakRecipe => ({
  version: 1,
  seed: STREAK_FIELD_DEFAULTS.seed,
  deltas: {},
  frame: 150,
})

export function validateRecipe(raw: unknown): StreakRecipe {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('A recipe is required.')
  const value = raw as Record<string, unknown>
  if (Object.keys(value).some((key) => !['version', 'seed', 'deltas', 'frame'].includes(key)))
    throw new Error('Unknown recipe property.')
  if (value.version !== STREAK_RECIPE_VERSION)
    throw new Error('Unsupported recipe version. Duplicate a current starter to upgrade.')
  if (!Number.isInteger(value.seed) || Number(value.seed) < 0 || Number(value.seed) > 2147483647)
    throw new Error('Seed must be a nonnegative 31-bit integer.')
  if (!Number.isInteger(value.frame) || Number(value.frame) < 1 || Number(value.frame) > 600)
    throw new Error('Capture frame must be between 1 and 600.')
  if (!value.deltas || typeof value.deltas !== 'object' || Array.isArray(value.deltas))
    throw new Error('Recipe deltas must be an object.')
  for (const [key, val] of Object.entries(value.deltas)) {
    if (!Object.hasOwn(STREAK_PARAMETERS, key)) throw new Error(`Unsupported parameter: ${key}`)
    const spec: Parameter = STREAK_PARAMETERS[key as keyof RecipeDeltas]
    if ('options' in spec) {
      if (typeof val !== 'string' || !spec.options.includes(val)) throw new Error(`Invalid ${key}.`)
    } else if ('color' in spec) {
      if (
        !Array.isArray(val) ||
        val.length !== 3 ||
        val.some((n) => typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 1)
      )
        throw new Error(`${key} must be three color values from 0 to 1.`)
    } else if (typeof val !== 'number' || !Number.isFinite(val) || val < spec.min || val > spec.max)
      throw new Error(`${key} must be between ${spec.min} and ${spec.max}.`)
  }
  const recipe = value as unknown as StreakRecipe
  const tuning = resolveStreakTuning(recipe.deltas)
  if (tuning.minLength > tuning.maxLength)
    throw new Error('Minimum length cannot exceed maximum length.')
  return recipe
}

/** Final caps apply after all creative overrides, including slot multipliers. */
export function limitStudioTuning(
  tuning: StreakFieldTuning,
  placement: VisualPlacement,
): StreakFieldTuning {
  const limits = PLACEMENT_LIMITS[placement]
  const expensiveNoise = tuning.noise === 'curl' || tuning.noise === 'gradient'
  const count = Math.min(
    tuning.count,
    limits.count || 1000,
    expensiveNoise ? 4000 : 8000,
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
    dpr: Math.min(tuning.dpr, limits.dpr),
    segments: 1,
    noiseOctaves: Math.min(tuning.noiseOctaves, expensiveNoise ? 2 : 3),
    pointerRadius: limits.pointer ? tuning.pointerRadius : 0,
  }
}

export function snapshotRecipe(raw: unknown): StreakSnapshot {
  const recipe = validateRecipe(raw)
  const base = resolveStreakTuning({ ...recipe.deltas, seed: recipe.seed })
  return {
    renderer: STREAK_RENDERER_VERSION,
    frame: recipe.frame,
    dark: limitStudioTuning({ ...base, surface: 'dark' }, 'hero'),
    light: limitStudioTuning({ ...base, ...STREAK_FIELD_PAPER, surface: 'light' }, 'hero'),
  }
}

export function starterRecipe(id: StreakLookId): StreakRecipe {
  const tuning = resolveStreakTuning(STREAK_LOOKS[id].tuning)
  const deltas: Record<string, unknown> = {}
  for (const [key, spec] of Object.entries(STREAK_PARAMETERS)) {
    let value = tuning[key as keyof RecipeDeltas]
    if ('min' in spec && typeof value === 'number')
      value = Math.max(spec.min, Math.min(spec.max, value))
    if (JSON.stringify(value) !== JSON.stringify(STREAK_FIELD_DEFAULTS[key as keyof RecipeDeltas]))
      deltas[key] = value
  }
  return validateRecipe({ ...emptyRecipe(), deltas })
}

export type CaptureOptions = {
  width: number
  height: number
  scale: number
  surface: 'light' | 'dark'
  format: 'png' | 'webp' | 'jpeg'
  transparent: boolean
}
export const POSTER_CAPTURE: CaptureOptions = {
  width: 1600,
  height: 900,
  scale: 1,
  surface: 'dark',
  format: 'webp',
  transparent: true,
}
export function validateCapture(raw: unknown): CaptureOptions {
  if (!raw || typeof raw !== 'object') throw new Error('Capture settings required.')
  const v = raw as CaptureOptions
  if (
    !Number.isInteger(v.width) ||
    v.width < 320 ||
    v.width > 1920 ||
    !Number.isInteger(v.height) ||
    v.height < 320 ||
    v.height > 1920 ||
    ![1, 2].includes(v.scale) ||
    v.width * v.height * v.scale ** 2 > 8294400
  )
    throw new Error(
      'Choose 320 to 1920 logical pixels per side, at 1x or 2x, up to 8.3 megapixels.',
    )
  if (
    !['light', 'dark'].includes(v.surface) ||
    !['png', 'webp', 'jpeg'].includes(v.format) ||
    typeof v.transparent !== 'boolean'
  )
    throw new Error('Invalid capture format or surface.')
  if (v.transparent && v.format === 'jpeg') throw new Error('JPEG requires a filled background.')
  return {
    width: v.width,
    height: v.height,
    scale: v.scale,
    surface: v.surface,
    format: v.format,
    transparent: v.transparent,
  }
}
