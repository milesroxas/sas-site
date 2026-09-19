/**
 * Light entry for the visual contract: the effects a slot can choose, look
 * ids, descriptors, resolvers, posters and placement policy. No Three, R3F or
 * DOM imports, so the Payload config, server components, validation hooks and
 * the menu resolver can use it. A live runtime is reached only through its
 * effect's client slot (`StreakVisual`, `LeakVisual`), which imports it on
 * demand.
 */
export { type Effect, isLookId } from '../studio/effect'
export {
  DEFAULT_EFFECT,
  EFFECT_IDS,
  EFFECT_OPTIONS,
  EFFECTS,
  type EffectId,
  effectOf,
  isEffectId,
} from '../studio/effects'
export { LIGHT_LEAK_SCOPE_ATTR, leakScope } from '../ui/light-leak-excite'
export { LEAK_EXCITE_TARGETS, LEAK_ORIGINS, type LeakExciteTargets } from '../ui/light-leak-tuning'
export {
  isValidStreakSeed,
  LEAK_SECTION_HOVER_RANGE,
  MENU_PREVIEW_TYPES,
  type MediaVisual,
  type MenuPreviewType,
  normalizeStreakMultiplier,
  type PosterMediaSource,
  parseStreakDescriptor,
  type ResolveVisualOptions,
  resolveMenuPreviewVisual,
  resolveStreakDescriptor,
  resolveVisual,
  STREAK_INTENSITY_RANGE,
  STREAK_SEED_MAX,
  STREAK_SPEED_RANGE,
  type StoredMenuPreviewSlot,
  type StoredStreakVisual,
  type StoredVisualSlot,
  type StreakFieldVisual,
  type StreakVisualDescriptor,
  seedFromKey,
  serializeStreakDescriptor,
  VISUAL_TYPES,
  type Visual,
  type VisualType,
  visualMedia,
} from './descriptor'
export { VISUAL_HOST } from './host'
export { LeakVisual } from './leak-visual'
export {
  STREAK_FALLBACK_LOOK,
  STREAK_LOOK_IDS,
  STREAK_LOOK_REVISION,
  type StreakLook,
  type StreakLookMotion,
} from './looks'
export { VisualMotionToggle } from './motion-toggle'
export {
  degradedLimits,
  PLACEMENT_LIMITS,
  type PlacementLimits,
  STREAK_LIVE_CEILING,
  type VisualPlacement,
} from './placement'
export type { VisualSurface } from './poster'
export {
  mediaPosterImage,
  type PosterImage,
  presetPosterImage,
  STREAK_POSTER_MIME,
  STREAK_POSTER_SIZE,
  type StreakPosterSurface,
  visualPosters,
} from './posters'
export { placementAllowsLive, streakLiveEnabled } from './rollout'
export {
  StreakVisual,
  type StreakVisualProps,
  type StreakVisualSurface,
} from './streak-visual'
