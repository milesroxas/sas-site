/**
 * Light entry for the visual contract: the effects a slot can choose, look
 * ids, descriptors, resolvers, posters and placement policy. No Three, R3F or
 * DOM imports, so the Payload config, server components, validation hooks and
 * the menu resolver can use it. A live runtime is reached only through its
 * effect's client slot (`StreakVisual`, `LeakVisual`), which imports it on
 * demand.
 */
export { type Effect, isLookId, type Surface } from '../studio/effect'
export {
  DEFAULT_EFFECT,
  EFFECT_IDS,
  EFFECT_OPTIONS,
  EFFECTS,
  type EffectId,
  effectOf,
  isEffectId,
} from '../studio/effects'
export { leakScope } from '../ui/light-leak-excite'
export { LEAK_EXCITE_TARGETS, LEAK_ORIGINS } from '../ui/light-leak-tuning'
export {
  type EffectVisual,
  isValidStreakSeed,
  LEAK_SECTION_HOVER_RANGE,
  openingHandoffVisual,
  parseStreakDescriptor,
  resolveMenuPreviewVisual,
  resolveOpening,
  resolveVisual,
  STREAK_INTENSITY_RANGE,
  STREAK_SEED_MAX,
  STREAK_SPEED_RANGE,
  type StoredMenuPreviewSlot,
  type StoredVisualSlot,
  type StreakVisualDescriptor,
  VISUAL_SURFACES,
  type Visual,
  type VisualSurface,
  visualMedia,
  visualSurface,
} from './descriptor'
export { VISUAL_HOST } from './host'
export { LeakVisual } from './leak-visual'
export { VisualMotionToggle } from './motion-toggle'
export type { VisualPlacement } from './placement'
export { visualPosters } from './posters'
export { StreakVisual } from './streak-visual'
