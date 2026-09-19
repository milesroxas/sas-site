import { describe, expect, it } from 'vitest'
import { CHART_CORPUS } from '../../corpus'
import type { ChartSpec } from '../../spec/chart'
import { chartBox, chartModel, directLabels, formatValue } from './model'

const spec = (name: keyof typeof CHART_CORPUS) => CHART_CORPUS[name]?.spec as ChartSpec

describe('chartModel', () => {
  it('re-keys series to fixed slots, so an authored key never becomes a data key or a style', () => {
    const model = chartModel(spec('posterWeight'))
    expect(model.slots.map((slot) => slot.key)).toEqual(['s0', 's1'])
    expect(model.data[0]).toEqual({ s0: 412, s1: 138, x: '1280 wide' })
  })
  it('draws a reference series neutral without spending a categorical color', () => {
    const { slots } = chartModel(spec('frameTimeByCount'))
    expect(slots.map((slot) => slot.color)).toEqual([
      'var(--figure-1)',
      'var(--figure-2)',
      'var(--figure-reference)',
    ])
  })
  it('puts time on a continuous scale under a line and on dated bands under bars', () => {
    expect(chartModel(spec('lcpByFace'))).toMatchObject({ continuousX: true })
    expect(chartModel(spec('lcpByFace')).data[0]?.x).toBe(Date.parse('2026-08-03T00:00:00Z'))
    expect(chartModel(spec('studioPublishes'))).toMatchObject({ continuousX: false })
    expect(chartModel(spec('studioPublishes')).data[0]?.x).toBe('Aug 17, 2026')
  })
  it('keeps a gap a gap: null stays null, never zero', () => {
    expect(chartModel(spec('lcpByFace')).data.at(-1)?.s1).toBeNull()
  })
  it('stands a diverging bar on its side by default and leaves other bars upright', () => {
    expect(chartModel(spec('deltaFromDefault')).horizontal).toBe(true)
    expect(chartModel(spec('posterWeight')).horizontal).toBe(false)
  })
})

describe('chartBox', () => {
  it('holds an aspect ratio for a standing chart and grows a horizontal one with its rows', () => {
    expect(chartBox(chartModel(spec('posterWeight')))).toEqual({
      className: 'aspect-4/3 sm:aspect-video',
    })
    expect(chartBox(chartModel(spec('noiseCost'))).height).toBe(7 * 44 + 56)
  })
})

describe('directLabels', () => {
  it('labels bar tips only for one series with few rows', () => {
    expect(directLabels(spec('noiseCost'), chartModel(spec('noiseCost')))).toBe('bar-tips')
    expect(directLabels(spec('posterWeight'), chartModel(spec('posterWeight')))).toBeNull()
  })
  it('labels line ends only while they sit far enough apart to read', () => {
    const lines = spec('frameTimeByCount')
    expect(directLabels(lines, chartModel(lines))).toBe('line-ends')
    const converged = {
      ...lines,
      rows: lines.rows.map((row) => ({ ...row, perStreak: row.instanced })),
    }
    expect(directLabels(converged, chartModel(converged))).toBeNull()
  })
})

describe('formatValue', () => {
  it('reads percent as a fraction of one and compacts large numbers', () => {
    expect(formatValue(spec('octavesVsDetail'), 0.42)).toBe('42%')
    expect(formatValue(spec('posterWeight'), 1580)).toBe('1.6K')
  })
})
