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

/** 1 on the active slide, 0 from one snap out. Every ramp of the pose runs on it. */
const activeness = (distance: number): number => 1 - clamp(distance, 0, 1)

const poseScale = (distance: number): number =>
  INACTIVE_SCALE + (1 - INACTIVE_SCALE) * activeness(distance)

/** Depth is signed for the transform (negative = away); the magnitude keeps growing past one snap. */
const poseDepth = (distance: number): number =>
  -DEPTH_PER_SNAP_PX * clamp(distance, 0, MAX_SNAP_DISTANCE)

/**
 * Half the width the pose leaves a slide at `distance`, as a fraction of its
 * layout width: the scale-down, shrunk again by the perspective projection of
 * its depth. rotateY is deliberately left out. Its inner-edge recession is a
 * px quantity that depends on the slide's rendered width, which the server
 * render never knows, and leaving it out errs toward air: both inner edges
 * turn away, so the true gap is the gutter plus roughly a hundredth of the
 * slide's width, never an overlap.
 */
export const projectedHalfWidth = (distance: number): number =>
  (poseScale(distance) * PERSPECTIVE_PX) / (PERSPECTIVE_PX - poseDepth(distance)) / 2

/** Width, as a fraction of the slide, that the pose shaves off one of its edges. */
const edgeLoss = (distance: number): number => 0.5 - projectedHalfWidth(distance)

/**
 * Horizontal shift, as a fraction of the slide's own width, that packs the
 * deck. Scaling a neighbour about its centre opens a gap on its inner edge
 * that is a fraction of the slide's width: the wider the slide, the wider the
 * hole beside it, which is what capped the active slide's size. This pulls
 * every slide toward the active one by exactly what the pose shaved off the
 * edges between them (its own inner edge, plus both edges of each slide in
 * between), so the visible gap between any two neighbours is the layout
 * gutter alone at every scroll position, not just at rest. Continuous in the
 * distance: the running sum picks up a new term only as a slide's loss passes
 * through zero. Written as the leftmost transform function, so it lands in
 * screen space after the projection and is never itself scaled.
 */
export const packedShift = (signedSnapDistance: number): number => {
  const distance = Math.abs(signedSnapDistance)
  let shift = edgeLoss(distance)
  for (let between = distance - 1; between > 0; between -= 1) {
    shift += 2 * edgeLoss(between)
  }
  return -Math.sign(signedSnapDistance) * shift
}

export type SlideVisualState = {
  transform: string
  opacity: number
  filter: string
}

export const slideVisualState = (signedSnapDistance: number): SlideVisualState => {
  const distance = Math.abs(signedSnapDistance)
  const t = activeness(distance)

  const shift = packedShift(signedSnapDistance) * 100
  const scale = poseScale(distance)
  // Left slides turn their inner (right) edge back (+deg), right slides theirs
  // (-deg): each faces away from the active slide, so the inner edges recede.
  const rotate = -clamp(signedSnapDistance, -1, 1) * INACTIVE_ROTATE_DEG
  // Depth of field keeps growing with distance, so the second slide out sits
  // deeper and softer than the first.
  const depth = poseDepth(distance)
  const blur = BLUR_PER_SNAP_PX * clamp(distance, 0, MAX_SNAP_DISTANCE)

  return {
    transform: `translateX(${shift.toFixed(2)}%) perspective(${PERSPECTIVE_PX}px) translateZ(${depth.toFixed(1)}px) rotateY(${rotate.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
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
