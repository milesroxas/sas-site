import { describe, expect, it } from 'vitest'
import { coveragePitch } from './streak-field-scene'

describe('coveragePitch', () => {
  it('leaves rows layouts and uncapped grids alone', () => {
    expect(
      coveragePitch({ count: 20000, layout: 'rows', columnPitch: 4, rowPitch: 4 }, 800, 600),
    ).toEqual({
      columnPitch: 4,
      rowPitch: 4,
    })
    expect(
      coveragePitch({ count: 100000, layout: 'grid', columnPitch: 4, rowPitch: 4 }, 800, 600),
    ).toEqual({
      columnPitch: 4,
      rowPitch: 4,
    })
  })

  it('widens both pitches so a capped count still covers the frame', () => {
    const { columnPitch, rowPitch } = coveragePitch(
      { count: 4000, layout: 'grid', columnPitch: 18, rowPitch: 14 },
      1920,
      1080,
    )
    // Same factor on both axes keeps the grid's proportions.
    expect(columnPitch / rowPitch).toBeCloseTo(18 / 14)
    const cells = Math.floor(1920 / columnPitch) * Math.floor(1080 / rowPitch)
    expect(cells).toBeLessThanOrEqual(4000)
    // And not far below it: the frame is filled, not thinned.
    expect(cells).toBeGreaterThan(4000 * 0.85)
  })
})
