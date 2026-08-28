/**
 * Single source of truth for a slide's look at a given signed snap distance
 * from the active slide (negative = left). Used by the server render for
 * initial inline styles (no hydration flicker) and by the client tween for
 * every scroll frame — the two can never drift.
 */

export const INACTIVE_SCALE = 0.8
export const INACTIVE_OPACITY = 0.5
/** Coverflow: inactive slides turn their outer edge away from the viewer. */
export const INACTIVE_ROTATE_DEG = 7
/**
 * Per-slide camera distance. CSS `perspective` on an ancestor only reaches its
 * direct children, so each slide carries its own perspective() in its
 * transform — without it the rotateY renders as a flat horizontal squash.
 */
export const PERSPECTIVE_PX = 1200
/** Depth-of-field: recession and defocus grow per snap of distance from the active slide. */
export const DEPTH_PER_SNAP_PX = 90
export const BLUR_PER_SNAP_PX = 2
/** Distance cap (in snaps) so far loop slides don't shrink/blur into mush. */
export const MAX_SNAP_DISTANCE = 2.5

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

/**
 * Snaps of distance over which a caption fades. Far steeper than the pose:
 * a caption is the one part of a slide that must not peek — a sliver of a
 * neighbour showing two letters of its caption reads as clipped text rather
 * than as a slide continuing off-frame — so the ink is gone a third of a snap
 * out, while the media is still only slightly recessed.
 */
export const CAPTION_FADE_SNAPS = 0.35

/**
 * Caption ink at a signed snap distance, on the same scroll position every
 * other slide value derives from. Left linear: it multiplies with the slide's
 * own opacity ramp above, and the product is already curved.
 */
export const captionOpacity = (signedSnapDistance: number): number =>
  1 - clamp(Math.abs(signedSnapDistance) / CAPTION_FADE_SNAPS, 0, 1)

export type SlideVisualState = {
  transform: string
  opacity: number
  filter: string
}

export const slideVisualState = (signedSnapDistance: number): SlideVisualState => {
  const distance = clamp(Math.abs(signedSnapDistance), 0, MAX_SNAP_DISTANCE)
  const t = 1 - clamp(distance, 0, 1)

  const scale = INACTIVE_SCALE + (1 - INACTIVE_SCALE) * t
  // Left slides rotate their left edge back (+deg), right slides the right
  // edge (-deg) — each turns away from the active slide.
  const rotate = -clamp(signedSnapDistance, -1, 1) * INACTIVE_ROTATE_DEG
  // Depth of field keeps growing with distance, so the second slide out sits
  // deeper and softer than the first.
  const depth = -DEPTH_PER_SNAP_PX * distance
  const blur = BLUR_PER_SNAP_PX * distance

  return {
    transform: `perspective(${PERSPECTIVE_PX}px) translateZ(${depth.toFixed(1)}px) rotateY(${rotate.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
    opacity: INACTIVE_OPACITY + (1 - INACTIVE_OPACITY) * t,
    filter: `grayscale(${(1 - t).toFixed(3)}) blur(${blur.toFixed(2)}px)`,
  }
}

/**
 * Rest-state signed distance for a slide by index, mirroring a centered embla
 * loop where index 0 is active: slides in the back half of the list approach
 * from the left. Only used for the server-rendered initial styles.
 */
export const restSignedDistance = (index: number, count: number): number =>
  index <= count / 2 ? index : index - count
