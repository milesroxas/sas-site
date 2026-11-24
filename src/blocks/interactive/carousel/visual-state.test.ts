import { describe, expect, it } from 'vitest'
import { packedShift, projectedHalfWidth, slideVisualState } from './visual-state'

/** Width the pose shaves off one edge of a slide at `distance`, as a fraction of its width. */
const edgeLoss = (distance: number) => 0.5 - projectedHalfWidth(distance)

/**
 * A slide's visible edges in a frame where slides are one unit wide and sit
 * one unit apart (gutter folded out): centre at the signed distance, shifted
 * by the pack, spanning the projected half-width either side.
 */
const visibleEdges = (signed: number) => {
  const centre = signed + packedShift(signed)
  const halfWidth = projectedHalfWidth(Math.abs(signed))
  return { left: centre - halfWidth, right: centre + halfWidth }
}

describe('packedShift', () => {
  it('leaves the active slide where it is', () => {
    expect(packedShift(0)).toBeCloseTo(0)
    expect(slideVisualState(0).transform).toMatch(/^translateX\(0\.00%\) perspective/)
  })

  it('pulls each neighbour inward by what its pose shaved off the inner edge', () => {
    expect(packedShift(1)).toBeCloseTo(-edgeLoss(1))
    expect(packedShift(-1)).toBeCloseTo(edgeLoss(1))
    expect(slideVisualState(1).transform).toMatch(/^translateX\(-12\.79%\)/)
  })

  it('packs far slides against the neighbours between them and the active slide', () => {
    // The second slide out closes its own inner edge plus both edges of the
    // slide it sits behind.
    expect(packedShift(2)).toBeCloseTo(-(edgeLoss(2) + 2 * edgeLoss(1)))
    expect(packedShift(-2.5)).toBeCloseTo(edgeLoss(2.5) + 2 * edgeLoss(1.5) + 2 * edgeLoss(0.5))
  })

  it('keeps every adjacent pair one gutter apart at every scroll position', () => {
    for (const progress of [0, 0.15, 0.5, 0.85, 1]) {
      for (let index = -2; index <= 3; index += 1) {
        const near = visibleEdges(index - progress)
        const far = visibleEdges(index + 1 - progress)
        expect(far.left - near.right, `progress ${progress}, slide ${index}`).toBeCloseTo(0, 9)
      }
    }
  })

  it('is continuous where the running sum picks up a slide', () => {
    for (const boundary of [1, 2]) {
      expect(packedShift(boundary - 1e-9)).toBeCloseTo(packedShift(boundary + 1e-9), 6)
    }
  })
})
