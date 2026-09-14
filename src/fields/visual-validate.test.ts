import { describe, expect, it } from 'vitest'
import {
  shaderSlotOf,
  slotChoseShader,
  validateIntensityValue,
  validatePresetValue,
  validateSeedValue,
  validateSpeedValue,
} from './visual-validate'

describe('shaderSlotOf', () => {
  it('walks a group path to the owning slot', () => {
    const data = { hero: { visualType: 'streakField', shader: { preset: null } } }
    expect(shaderSlotOf(data, ['hero', 'shader', 'preset'])).toBe(data.hero)
  })

  it('walks array and block paths', () => {
    const data = { layout: [{ visualType: 'media' }, { visualType: 'streakField', shader: {} }] }
    expect(slotChoseShader(shaderSlotOf(data, ['layout', 1, 'shader', 'preset']))).toBe(true)
    expect(slotChoseShader(shaderSlotOf(data, ['layout', 0, 'shader', 'preset']))).toBe(false)
  })

  it('reads a root-level menu preview slot', () => {
    const data = { menuPreviewType: 'streakField', menuPreviewShader: {} }
    expect(slotChoseShader(shaderSlotOf(data, ['menuPreviewShader', 'preset']))).toBe(true)
  })

  it('returns an empty slot for missing data', () => {
    expect(shaderSlotOf(undefined, ['hero', 'shader', 'preset'])).toEqual({})
    expect(shaderSlotOf({ hero: null }, ['hero', 'shader', 'preset'])).toEqual({})
  })
})

describe('shader field validators', () => {
  it('requires a shipped look only when the slot chose the shader', () => {
    expect(validatePresetValue(null, false)).toBe(true)
    expect(validatePresetValue(null, true)).toMatch(/Choose/)
    expect(validatePresetValue('signal-v1', true)).toBe(true)
    expect(validatePresetValue('aurora-v9', false)).toMatch(/not a shipped/)
  })

  it('bounds seeds, speed and intensity', () => {
    expect(validateSeedValue(null)).toBe(true)
    expect(validateSeedValue(12)).toBe(true)
    expect(validateSeedValue(1.5)).toMatch(/whole number/)
    expect(validateSpeedValue(0.5)).toBe(true)
    expect(validateSpeedValue(2)).toMatch(/between/)
    expect(validateSpeedValue(Number.POSITIVE_INFINITY)).toMatch(/number/)
    expect(validateIntensityValue(0.4)).toMatch(/between/)
    expect(validateIntensityValue(1.25)).toBe(true)
  })
})
