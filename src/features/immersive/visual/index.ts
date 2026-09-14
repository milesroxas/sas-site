/**
 * Light entry for the Streak Field visual contract: look ids, descriptors,
 * resolvers, posters and placement policy. No Three, R3F or DOM imports, so
 * the Payload config, server components, validation hooks and the menu
 * resolver can use it. The live runtime is reached only through the
 * `StreakVisual` client slot, which imports it on demand.
 */
export {
  isValidStreakSeed,
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
export {
  isStreakLookId,
  STREAK_FALLBACK_LOOK,
  STREAK_LOOK_IDS,
  STREAK_LOOK_OPTIONS,
  STREAK_LOOK_REVISION,
  STREAK_LOOKS,
  type StreakLook,
  type StreakLookId,
  type StreakLookMotion,
} from './looks'
export { VisualMotionToggle } from './motion-toggle'
export {
  degradedLimits,
  PLACEMENT_LIMITS,
  type PlacementLimits,
  STREAK_LIVE_CEILING,
  VISUAL_PLACEMENTS,
  type VisualPlacement,
} from './placement'
export {
  mediaPosterImage,
  type PosterImage,
  presetPosterImage,
  STREAK_POSTER_MIME,
  STREAK_POSTER_SIZE,
  type StreakPosterSurface,
  streakPosterSrc,
} from './posters'
export { placementAllowsLive, streakLiveEnabled } from './rollout'
export {
  StreakVisual,
  type StreakVisualProps,
  type StreakVisualStatus,
  type StreakVisualSurface,
} from './streak-visual'
