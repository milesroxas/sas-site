import { PLACEMENT_LIMITS, type VisualPlacement } from './placement'

/**
 * Code-owned rollout switch for live Streak Field rendering. Off, every
 * shader visual still renders its authored poster; nothing falls back to a
 * retained upload. `NEXT_PUBLIC_STREAK_LIVE=off` disables it per deployment
 * without a code change; the constant is the shipped default.
 */
const STREAK_LIVE_DEFAULT = true

export const streakLiveEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_STREAK_LIVE === 'off' ? false : STREAK_LIVE_DEFAULT

/** Whether this placement may attempt a live field at all (rollout and placement policy). */
export const placementAllowsLive = (placement: VisualPlacement): boolean =>
  streakLiveEnabled() && PLACEMENT_LIMITS[placement].live
