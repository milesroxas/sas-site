/**
 * Loop-aware snap geometry for the carousel tween.
 *
 * Every slide's pose is a pure function of its signed distance (in snaps)
 * from embla's current scroll position. This module owns that math — free of
 * GSAP and the DOM so the loop-seam handling can be unit-tested directly.
 */

type LoopPoint = {
  index: number
  target: () => number
}

/** The slice of embla's internal engine the geometry depends on. */
export type SnapEngine = {
  options: { loop: boolean }
  slideRegistry: number[][]
  slideLooper: { loopPoints: LoopPoint[] }
}

/** Multiplier converting embla's 0–1 progress-space diff into whole snap units. */
export const computeTweenFactor = (snaps: number[]): number => {
  if (snaps.length < 2) return 1
  const spacing = Math.abs(snaps[1] - snaps[0])
  return spacing > 0 ? 1 / spacing : 1
}

/**
 * Diff from a snap to the current progress, corrected for slides embla has
 * shifted across the loop seam: those render at a target() offset of ±1 in
 * progress space, so they are measured against the wrapped progress instead.
 */
export const loopAwareDiff = (
  engine: SnapEngine,
  slideIndex: number,
  scrollSnap: number,
  scrollProgress: number,
): number => {
  const loopPoint = engine.options.loop
    ? engine.slideLooper.loopPoints.find(
        (point) => point.index === slideIndex && point.target() !== 0,
      )
    : undefined
  if (!loopPoint) return scrollSnap - scrollProgress
  return Math.sign(loopPoint.target()) === -1
    ? scrollSnap - (1 + scrollProgress)
    : scrollSnap + (1 - scrollProgress)
}

/** Visit every slide with its signed distance (in snaps) from the scroll position. */
export const forEachSnapDistance = (
  engine: SnapEngine,
  snaps: number[],
  scrollProgress: number,
  tweenFactor: number,
  visit: (slideIndex: number, signed: number) => void,
): void => {
  snaps.forEach((scrollSnap, snapIndex) => {
    for (const slideIndex of engine.slideRegistry[snapIndex]) {
      const diff = loopAwareDiff(engine, slideIndex, scrollSnap, scrollProgress)
      visit(slideIndex, diff * tweenFactor)
    }
  })
}
