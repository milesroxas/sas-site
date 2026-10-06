import { describe, expect, it } from 'vitest'
import { bandIndex, barPath, niceScale } from './chart'

describe('niceScale', () => {
  it('ends the axis on a round number', () => {
    expect(niceScale(43)).toEqual({ top: 50, ticks: [0, 10, 20, 30, 40, 50] })
    expect(niceScale(7)).toEqual({ top: 8, ticks: [0, 2, 4, 6, 8] })
  })

  it('never steps a count below one, or by a fraction', () => {
    expect(niceScale(2).ticks).toEqual([0, 1, 2])
    expect(niceScale(12).ticks).toEqual([0, 5, 10, 15])
  })

  it('draws an empty window on a fixed axis', () => {
    expect(niceScale(0).ticks).toEqual([0, 1, 2, 3, 4])
  })
})

describe('barPath', () => {
  it('stands on the baseline and reaches its top', () => {
    const path = barPath(10, 40, 20, 100)
    expect(path.startsWith('M10,100V42')).toBe(true)
    expect(path).toContain('H28')
    expect(path.endsWith('V100Z')).toBe(true)
  })

  it('keeps a short bar square rather than a pill', () => {
    expect(barPath(0, 99, 20, 100)).toContain('V100Q0,99 1,99')
  })

  it('draws nothing for a zero day', () => {
    expect(barPath(0, 100, 20, 100)).toBe('')
  })
})

describe('bandIndex', () => {
  it('finds the day whose band holds the pointer, and stays in range', () => {
    expect(bandIndex(64, 44, 10, 7)).toBe(2)
    expect(bandIndex(0, 44, 10, 7)).toBe(0)
    expect(bandIndex(999, 44, 10, 7)).toBe(6)
  })
})
