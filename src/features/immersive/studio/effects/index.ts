import type { Effect } from '../effect'
import { LIGHT_LEAK_EFFECT } from './light-leak'
import { STREAK_FIELD_EFFECT } from './streak-field'

export {
  LEAK_PLACEMENT_LIMITS,
  type LeakLookId,
  type LeakParameterKey,
  LIGHT_LEAK_EFFECT,
  limitLeakTuning,
} from './light-leak'
export { limitStreakTuning, STREAK_FIELD_EFFECT, type StreakParameterKey } from './streak-field'

/**
 * Every effect the Studio can author and a visual slot can choose, in the order
 * an editor sees them. The id is stored twice in Payload: as a slot's
 * `visualType`, and as the `effect` a Studio look is filed under.
 */
export const EFFECTS = {
  streakField: STREAK_FIELD_EFFECT,
  lightLeak: LIGHT_LEAK_EFFECT,
} as const satisfies Record<string, Effect>

export type EffectId = keyof typeof EFFECTS
export const EFFECT_IDS = Object.keys(EFFECTS) as EffectId[]
/** The effect every look had before the library held more than one. */
export const DEFAULT_EFFECT: EffectId = 'streakField'

export const isEffectId = (value: unknown): value is EffectId =>
  typeof value === 'string' && Object.hasOwn(EFFECTS, value)

/** The contract for a stored effect id. Anything unknown reads as the first effect, as a missing one does. */
export const effectOf = (id: unknown): Effect => EFFECTS[isEffectId(id) ? id : DEFAULT_EFFECT]

export const EFFECT_OPTIONS = EFFECT_IDS.map((id) => ({ value: id, label: EFFECTS[id].label }))
