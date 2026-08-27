import { describe, expect, it } from 'vitest'

import { clipPathInset, cssEasing, HERO_LANDING, planHeroLanding } from './hero-landing'

const VIEWPORT = { width: 1200, height: 800 }
/** The menu's traveler: a fixed, full-bleed box, so box space === screen space. */
const FULL_BLEED_BOX = { left: 0, top: 0, width: VIEWPORT.width, height: VIEWPORT.height }

const { hold, axisDuration, collapseEase } = HERO_LANDING

describe('planHeroLanding', () => {
  it('closes horizontally, then vertically, onto a target inside the viewport', () => {
    const plan = planHeroLanding({
      box: FULL_BLEED_BOX,
      viewport: VIEWPORT,
      target: { left: 100, top: 200, width: 800, height: 400 },
      radius: 12,
    })

    expect(plan.from).toBe(clipPathInset(0, 0, 0, 0, 0))
    expect(plan.steps).toEqual([
      // Horizontal first: top/bottom still open.
      {
        axis: 'horizontal',
        clipPath: clipPathInset(0, 300, 0, 100, 12),
        at: hold,
        duration: axisDuration,
        ease: collapseEase,
      },
      // Then vertical, with the horizontal insets already final — the window
      // never travels diagonally.
      {
        axis: 'vertical',
        clipPath: clipPathInset(200, 300, 200, 100, 12),
        at: hold + axisDuration,
        duration: axisDuration,
        ease: collapseEase,
      },
    ])
    expect(plan.settle.at).toBe(hold + axisDuration * 2)
    expect(plan.settle.duration).toBe(HERO_LANDING.settleDuration)
  })

  it('measures a box larger than the viewport from its own edges, starting at the visible crop', () => {
    // The work-open expansion overshoots horizontally: the group is 1600 wide,
    // centered, so 200px hang off each side.
    const plan = planHeroLanding({
      box: { left: -200, top: 0, width: 1600, height: 800 },
      viewport: VIEWPORT,
      target: { left: 100, top: 200, width: 800, height: 400 },
      radius: 0,
    })

    // The mask starts cropped to the viewport — an offscreen edge must not
    // spend the first frames of the collapse travelling into view.
    expect(plan.from).toBe(clipPathInset(0, 200, 0, 200, 0))
    expect(plan.steps.map((step) => step.clipPath)).toEqual([
      clipPathInset(0, 500, 0, 300, 0),
      clipPathInset(200, 500, 200, 300, 0),
    ])
  })

  it('skips an axis with no travel and drops both for a full-bleed target', () => {
    const band = planHeroLanding({
      box: FULL_BLEED_BOX,
      viewport: VIEWPORT,
      // Full-width hero band: nothing to close horizontally.
      target: { left: 0, top: 120, width: 1200, height: 500 },
      radius: 0,
    })
    expect(band.steps).toEqual([
      {
        axis: 'vertical',
        clipPath: clipPathInset(120, 0, 180, 0, 0),
        at: hold,
        duration: axisDuration,
        ease: collapseEase,
      },
    ])
    expect(band.settle.at).toBe(hold + axisDuration)

    const fullBleed = planHeroLanding({
      box: FULL_BLEED_BOX,
      viewport: VIEWPORT,
      target: FULL_BLEED_BOX,
      radius: 0,
    })
    expect(fullBleed.steps).toEqual([])
    // Nothing to collapse: hold, then straight into the dissolve.
    expect(fullBleed.settle.at).toBe(hold)
  })

  it('clamps a target larger than the viewport to the start mask', () => {
    const plan = planHeroLanding({
      box: FULL_BLEED_BOX,
      viewport: VIEWPORT,
      // A hero that bleeds past the viewport on every side.
      target: { left: -80, top: -60, width: 1400, height: 1000 },
      radius: 0,
    })
    expect(plan.steps).toEqual([])
  })
})

describe('cssEasing', () => {
  it('samples a GSAP ease into a linear() easing pinned at both ends', () => {
    const easing = cssEasing('power2.inOut', 4)
    expect(easing).toBe('linear(0,0.0625,0.5,0.9375,1)')
    // Monotonic in between — the CSS side must not re-time the curve.
    expect(cssEasing('power1.out', 2)).toBe('linear(0,0.75,1)')
  })
})
