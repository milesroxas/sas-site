import { describe, expect, it } from 'vitest'

import { HERO_LANDING, planHeroLanding } from '@/shared/ui/hero-landing'
import { settledMs, simRunSegments } from './sim-timeline'
import type { SimRun } from './use-sim-navigation'

const TIMINGS = {
  networkMs: 170,
  serverMs: 0,
  revealMs: 480,
  moveMs: 400,
  exitMs: 150,
  enterMs: 210,
  centerMs: 320,
  expandMs: 420,
}

const run = (overrides: Partial<SimRun>): SimRun => ({
  from: 'home',
  to: 'about',
  direction: 'lateral',
  morph: false,
  landing: null,
  ...TIMINGS,
  ...overrides,
})

const byLabel = (segments: ReturnType<typeof simRunSegments>) =>
  Object.fromEntries(segments.map((segment) => [segment.label, segment]))

describe('simRunSegments', () => {
  it('plots an untagged navigation as dead time and then a cut', () => {
    const segments = simRunSegments(run({ direction: null }))
    expect(segments.map((segment) => segment.label)).toEqual(['network', 'hard cut (untagged)'])
    expect(segments[1]).toMatchObject({ start: 170, duration: 0 })
    expect(settledMs(segments)).toBe(170)
  })

  it('runs the reveal and a post-image morph concurrently, after the wait', () => {
    const segments = byLabel(simRunSegments(run({ direction: 'forward', morph: true })))
    expect(segments['mask reveal']).toMatchObject({ start: 170, duration: 480 })
    expect(segments['image morph']).toMatchObject({ start: 170, duration: 400 })
    expect(settledMs(Object.values(segments))).toBe(650)
  })

  it('chains the takeover approach and offsets the measured landing from full screen', () => {
    const viewport = { width: 1200, height: 800 }
    const box = { left: 0, top: 0, ...viewport }
    const landing = planHeroLanding({
      box,
      viewport,
      // An edge-to-edge hero band: the horizontal axis is already home.
      target: { left: 0, top: 200, width: 1200, height: 500 },
      radius: 0,
    })
    const segments = byLabel(simRunSegments(run({ direction: 'work-open', landing })))

    expect(segments['page fade out']).toMatchObject({ start: 170, duration: 150 })
    expect(segments.center).toMatchObject({ start: 320, duration: 320 })
    expect(segments.expand).toMatchObject({ start: 640, duration: 420 })
    // Full screen at 1060: the page fades in under the media while the landing plays.
    expect(segments['page fade in']).toMatchObject({ start: 1060, duration: 210 })
    expect(segments.hold).toMatchObject({ start: 1060, duration: HERO_LANDING.hold * 1000 })
    expect(segments.horizontal).toBeUndefined()
    expect(segments.vertical).toMatchObject({
      start: 1060 + HERO_LANDING.hold * 1000,
      duration: HERO_LANDING.axisDuration * 1000,
    })
    expect(segments.dissolve).toMatchObject({
      start: 1060 + landing.settle.at * 1000,
      duration: HERO_LANDING.settleDuration * 1000,
    })
  })

  it('plots the approach alone while the landing is still unmeasured', () => {
    const labels = simRunSegments(run({ direction: 'work-open' })).map((segment) => segment.label)
    expect(labels).toEqual(['network', 'page fade out', 'center', 'expand', 'page fade in'])
  })
})
