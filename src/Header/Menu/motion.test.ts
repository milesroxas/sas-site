import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { clipPathInset } from '@/shared/ui/hero-landing'
import { canStartHeroHandoff, getCardMotion, getViewportCrop, isInAppNavClick } from './motion'

const setViewport = (width: number, height: number) => {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    value: width,
    configurable: true,
  })
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true })
}

const makeRect = (left: number, top: number, width: number, height: number): DOMRect =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
  }) as DOMRect

describe('isInAppNavClick', () => {
  const noModifiers = { metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }
  const makeAnchor = (href: string, target = '') => {
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.target = target
    return anchor
  }

  it('accepts a plain same-origin click', () => {
    expect(isInAppNavClick(makeAnchor('/work'), noModifiers)).toBe(true)
  })

  it('rejects a missing anchor', () => {
    expect(isInAppNavClick(null, noModifiers)).toBe(false)
  })

  it('rejects cross-origin and new-tab anchors', () => {
    expect(isInAppNavClick(makeAnchor('https://example.com/x'), noModifiers)).toBe(false)
    expect(isInAppNavClick(makeAnchor('/work', '_blank'), noModifiers)).toBe(false)
  })

  it('lets every modified click through to the browser', () => {
    for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const) {
      expect(isInAppNavClick(makeAnchor('/work'), { ...noModifiers, [key]: true })).toBe(false)
    }
  })
})

describe('canStartHeroHandoff', () => {
  const openGate = {
    slotRect: { width: 448, height: 252 },
    reducedMotion: false,
    handoffActive: false,
    timelineProgress: 1,
    destinationPathname: '/work',
    currentPathname: '/',
  }

  it('passes when the menu is fully open on a laid-out slot toward another page', () => {
    expect(canStartHeroHandoff(openGate)).toBe(true)
  })

  it('falls back on every unmet precondition', () => {
    expect(canStartHeroHandoff({ ...openGate, slotRect: { width: 0, height: 0 } })).toBe(false)
    expect(canStartHeroHandoff({ ...openGate, reducedMotion: true })).toBe(false)
    expect(canStartHeroHandoff({ ...openGate, handoffActive: true })).toBe(false)
    // Mid-open click reverses the dock instead.
    expect(canStartHeroHandoff({ ...openGate, timelineProgress: 0.4 })).toBe(false)
    expect(canStartHeroHandoff({ ...openGate, timelineProgress: undefined })).toBe(false)
    // Same-page links re-land where they are.
    expect(canStartHeroHandoff({ ...openGate, destinationPathname: '/' })).toBe(false)
  })
})

describe('getViewportCrop', () => {
  it('crops the sides equally when the viewport is wider than the target aspect', () => {
    const crop = getViewportCrop(2000, 500, 16 / 9)
    expect(crop.clipH).toBe(500)
    expect(crop.clipW).toBeCloseTo(500 * (16 / 9))
    expect(crop.insetT).toBe(0)
    expect(crop.insetB).toBe(0)
    expect(crop.insetL).toBeCloseTo((2000 - crop.clipW) / 2)
    expect(crop.insetL).toBeCloseTo(crop.insetR)
  })

  it('crops top and bottom equally when the viewport is taller than the target aspect', () => {
    const crop = getViewportCrop(800, 1000, 16 / 9)
    expect(crop.clipW).toBe(800)
    expect(crop.clipH).toBeCloseTo(800 / (16 / 9))
    expect(crop.insetL).toBe(0)
    expect(crop.insetR).toBe(0)
    expect(crop.insetT).toBeCloseTo((1000 - crop.clipH) / 2)
    expect(crop.insetT).toBeCloseTo(crop.insetB)
  })
})

describe('getCardMotion', () => {
  beforeEach(() => setViewport(1200, 800))

  afterEach(() => {
    Reflect.deleteProperty(document.documentElement, 'clientWidth')
    Reflect.deleteProperty(window, 'innerHeight')
  })

  it('lands the scaled, clipped viewport element exactly on the target rect', () => {
    const target = makeRect(150, 90, 448, 252) // 16:9 slot
    const motion = getCardMotion(target, 24)
    const crop = getViewportCrop(1200, 800, target.width / target.height)

    // The visible window (clip region × scale) matches the target size…
    expect(crop.clipW * motion.scale).toBeCloseTo(target.width)
    expect(crop.clipH * motion.scale).toBeCloseTo(target.height)
    // …and its top-left corner sits on the target's viewport position.
    expect(motion.x + crop.insetL * motion.scale).toBeCloseTo(target.left)
    expect(motion.y + crop.insetT * motion.scale).toBeCloseTo(target.top)
  })

  it('emits structurally identical clip-path strings for dock and open states, so GSAP can interpolate them', () => {
    const motion = getCardMotion(makeRect(0, 0, 300, 200), 20)
    const shape = /^inset\((.+?)px (.+?)px (.+?)px (.+?)px round (.+?)px\)$/
    expect(motion.clipPath).toMatch(shape)
    expect(motion.openClipPath).toMatch(shape)
    expect(motion.openClipPath).toBe(clipPathInset(0, 0, 0, 0, 0))
  })
})
