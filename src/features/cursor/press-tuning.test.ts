import { afterEach, describe, expect, it } from 'vitest'
import { readPressTuning } from './press-tuning'

describe('readPressTuning', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style')
  })

  it('reads the site press tokens, converting ms to seconds', () => {
    document.documentElement.style.setProperty('--press-duration', '150ms')
    document.documentElement.style.setProperty('--press-release-duration', '0.35s')
    const tuning = readPressTuning()
    expect(tuning.duration).toBeCloseTo(0.15)
    expect(tuning.releaseDuration).toBeCloseTo(0.35)
  })

  it('turns a token cubic-bezier into an ease that spans 0 → 1', () => {
    document.documentElement.style.setProperty('--press-ease', 'cubic-bezier(0, 0, 0.2, 1)')
    const { ease } = readPressTuning()
    expect(typeof ease).toBe('function')
    const curve = ease as (progress: number) => number
    expect(curve(0)).toBeCloseTo(0)
    expect(curve(1)).toBeCloseTo(1)
    // Decelerating curve: half the time is well past half the distance.
    expect(curve(0.5)).toBeGreaterThan(0.5)
  })

  it('falls back to the mirrored tuning when the tokens are unreadable', () => {
    const tuning = readPressTuning()
    expect(tuning.duration).toBeCloseTo(0.15)
    expect(tuning.releaseDuration).toBeCloseTo(0.35)
    expect(tuning.ease).toBe('power2.out')
  })
})
