import { describe, expect, it } from 'vitest'
import { EFFECTS } from '@/features/immersive/visual'
import {
  shaderSlotOf,
  slotEffect,
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
    const data = { layout: [{ visualType: 'media' }, { visualType: 'lightLeak', shader: {} }] }
    expect(slotEffect(shaderSlotOf(data, ['layout', 1, 'shader', 'preset']))).toBe('lightLeak')
    expect(slotEffect(shaderSlotOf(data, ['layout', 0, 'shader', 'preset']))).toBeNull()
  })

  it('reads a root-level menu preview slot', () => {
    const data = { menuPreviewType: 'streakField', menuPreviewShader: {} }
    expect(slotEffect(shaderSlotOf(data, ['menuPreviewShader', 'preset']))).toBe('streakField')
  })

  it('returns an empty slot for missing data', () => {
    expect(shaderSlotOf(undefined, ['hero', 'shader', 'preset'])).toEqual({})
    expect(shaderSlotOf({ hero: null }, ['hero', 'shader', 'preset'])).toEqual({})
  })
})

describe('shader field validators', () => {
  it('requires a look the chosen effect ships, and only when the slot chose one', () => {
    expect(validatePresetValue(null, null)).toBe(true)
    expect(validatePresetValue(null, EFFECTS.streakField)).toMatch(/Choose a Streak Field look/)
    expect(validatePresetValue('signal-v1', EFFECTS.streakField)).toBe(true)
    expect(validatePresetValue('aurora-v9', EFFECTS.streakField)).toMatch(/not a shipped/)
    // A look id belongs to its effect: the other effect's is not a look here.
    expect(validatePresetValue('signal-v1', EFFECTS.lightLeak)).toMatch(/not a shipped Light leak/)
    expect(validatePresetValue('amber-v1', EFFECTS.lightLeak)).toBe(true)
    // A slot back on media keeps whatever preset it last held, unjudged.
    expect(validatePresetValue('amber-v1', null)).toBe(true)
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
