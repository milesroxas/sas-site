import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { HeroHandoffOptions } from './heroHandoff'
import { startHeroHandoff } from './heroHandoff'

/**
 * The controller's value is its sequencing under races (route commit vs menu
 * fade, missing heroes, aborts), not GSAP's interpolation — so gsap is faked
 * with tweens the test completes by hand.
 */
type FakeTween = {
  targets: unknown
  vars: Record<string, unknown> & { onComplete?: () => void }
  kill: () => void
  killed: boolean
}

const fakes = vi.hoisted(() => {
  const tweens: FakeTween[] = []
  return { tweens }
})

vi.mock('gsap', () => {
  const make = (targets: unknown, vars: FakeTween['vars']): FakeTween => {
    const tween: FakeTween = {
      targets,
      vars,
      killed: false,
      kill() {
        this.killed = true
      },
    }
    fakes.tweens.push(tween)
    return tween
  }
  const gsap = {
    set: vi.fn(),
    to: vi.fn((targets: unknown, vars: FakeTween['vars']) => make(targets, vars)),
    timeline: vi.fn((vars: FakeTween['vars'] = {}) => {
      const tl = make('timeline', vars) as FakeTween & { to: () => unknown }
      tl.to = vi.fn(() => tl)
      return tl
    }),
  }
  return { default: gsap, ...gsap }
})

const tweenFor = (targets: unknown) =>
  fakes.tweens.find(
    (t) => t.targets === targets || (Array.isArray(t.targets) && t.targets.includes(targets)),
  )

const timelineTween = () => fakes.tweens.find((t) => t.targets === 'timeline')

const getTraveler = () => document.querySelector<HTMLElement>('[data-menu-hero-traveler]')

/** Completes the traveler's fade-in tween (phase-1 gate). */
const completeTravelerFade = () => {
  const traveler = getTraveler()
  expect(traveler).not.toBeNull()
  const fade = tweenFor(traveler)
  expect(fade?.vars.onComplete).toBeDefined()
  fade?.vars.onComplete?.()
}

/** Completes the slot→fullscreen expansion tween (phase-2 gate). */
const completeFullscreen = () => {
  const traveler = getTraveler()
  expect(traveler).not.toBeNull()
  const fullscreen = fakes.tweens.filter((t) => t.targets === traveler).at(-1)
  // The expansion lands on identity — full viewport, nothing clipped.
  expect(fullscreen?.vars.scale).toBe(1)
  expect(fullscreen?.vars.x).toBe(0)
  expect(fullscreen?.vars.y).toBe(0)
  expect(fullscreen?.vars.clipPath).toBe('inset(0px 0px 0px 0px round 0px)')
  fullscreen?.vars.onComplete?.()
}

const makeRect = (width: number, height: number): DOMRect =>
  ({
    width,
    height,
    left: 10,
    top: 20,
    right: 10 + width,
    bottom: 20 + height,
    x: 10,
    y: 20,
  }) as DOMRect

describe('startHeroHandoff', () => {
  let frame: HTMLElement
  let overlay: HTMLElement
  let restoreFrame: ReturnType<typeof vi.fn<(navigated: boolean) => void>>
  let onDone: ReturnType<typeof vi.fn<() => void>>

  const start = (media = { url: '/media/hero.jpg', mime: 'image/jpeg' }) =>
    startHeroHandoff({
      media,
      overlay,
      frame,
      items: [],
      slotRect: makeRect(400, 225),
      desktop: true,
      restoreFrame,
      onDone,
    } satisfies HeroHandoffOptions)

  /** Mounts a measurable destination hero inside the frame. */
  const mountDestinationHero = () => {
    const wrap = document.createElement('div')
    wrap.setAttribute('data-hero-media', '')
    const img = document.createElement('img')
    img.src = '/media/full-hero.jpg'
    img.getBoundingClientRect = () => makeRect(800, 450)
    wrap.appendChild(img)
    frame.appendChild(wrap)
    return img
  }

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'performance',
      ],
    })
    fakes.tweens.length = 0
    frame = document.createElement('div')
    overlay = document.createElement('div')
    document.body.append(frame, overlay)
    restoreFrame = vi.fn<(navigated: boolean) => void>()
    onDone = vi.fn<() => void>()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('runs the full sequence: hold → fullscreen → route commit → collapse → settle → cleanup', () => {
    const handoff = start()
    expect(getTraveler()).not.toBeNull()
    expect(handoff.active).toBe(true)

    completeTravelerFade()
    // Traveler ready but not yet at full screen — nothing collapses.
    expect(timelineTween()).toBeUndefined()

    mountDestinationHero()
    handoff.routeChanged()
    // Route commit unfreezes the frame immediately (behind the opaque overlay).
    expect(restoreFrame).toHaveBeenCalledExactlyOnceWith(true)
    // Hero measurable, but the collapse still waits for the fullscreen beat.
    expect(timelineTween()).toBeUndefined()

    completeFullscreen()
    const collapse = timelineTween() as (FakeTween & { to: ReturnType<typeof vi.fn> }) | undefined
    expect(collapse).toBeDefined()

    // Clip-only, one axis per step: horizontal insets close first (top/bottom
    // stay 0), then vertical joins with the horizontal values already final.
    const clipCalls = (collapse?.to.mock.calls ?? []).map(
      (call) => (call[1] as { clipPath: string }).clipPath,
    )
    const vh = window.innerHeight
    expect(clipCalls).toEqual([
      'inset(0px 0px 0px 10px round 0px)',
      `inset(20px 0px ${vh - 470}px 10px round 0px)`,
    ])

    // Landing → settle. The image never fires `load` in jsdom, so the settle
    // grace timeout is what triggers the dissolve.
    collapse?.vars.onComplete?.()
    vi.advanceTimersByTime(1600)
    const dissolve = fakes.tweens.at(-1)
    expect(dissolve?.targets).toBe(getTraveler())
    dissolve?.vars.onComplete?.()

    expect(getTraveler()).toBeNull()
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(restoreFrame).toHaveBeenCalledTimes(1)
    expect(handoff.active).toBe(false)
  })

  it('defers the frame restore until the traveler is opaque when the route commits first', () => {
    // Prefetched routes can commit before the traveler's fade-in finishes;
    // restoring the frame then would pop the still-translucent slot.
    const handoff = start()
    mountDestinationHero()
    handoff.routeChanged()
    expect(restoreFrame).not.toHaveBeenCalled()

    completeTravelerFade()
    expect(restoreFrame).toHaveBeenCalledExactlyOnceWith(true)
    completeFullscreen()
    expect(timelineTween()).toBeDefined()
  })

  it('waits for the route before collapsing, even when already at full screen', () => {
    const handoff = start()
    mountDestinationHero()
    completeTravelerFade()
    completeFullscreen()
    expect(timelineTween()).toBeUndefined()

    handoff.routeChanged()
    expect(timelineTween()).toBeDefined()
  })

  it('falls back to a plain fade when the destination never mounts hero media', () => {
    const handoff = start()
    completeTravelerFade()
    handoff.routeChanged()
    expect(restoreFrame).toHaveBeenCalledExactlyOnceWith(true)

    // Poll past the hero-mount deadline (rAF ticks + performance are faked).
    vi.advanceTimersByTime(3000)

    const fallback = fakes.tweens.at(-1)
    expect(Array.isArray(fallback?.targets)).toBe(true)
    expect(fallback?.targets).toContain(overlay)
    fallback?.vars.onComplete?.()

    expect(getTraveler()).toBeNull()
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(handoff.active).toBe(false)
  })

  it('falls back without the navigated scroll contract when the route never commits', () => {
    start()
    completeTravelerFade()

    vi.advanceTimersByTime(5100)

    expect(restoreFrame).toHaveBeenCalledExactlyOnceWith(false)
    const fallback = fakes.tweens.at(-1)
    fallback?.vars.onComplete?.()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('suppresses the platform view transition for the whole flight', () => {
    // React starts a view transition on every route commit whatever the
    // tagging says, and its capture freezes rendering (and rAF) mid-flight —
    // the traveler would stall and snap forward. The API must be gone from
    // the click until the traveler is, and back afterwards.
    const native = vi.fn()
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      writable: true,
      value: native,
    })

    const handoff = start()
    expect(document.startViewTransition).toBeUndefined()

    completeTravelerFade()
    mountDestinationHero()
    handoff.routeChanged()
    completeFullscreen()
    expect(document.startViewTransition).toBeUndefined()

    handoff.abort()
    expect(document.startViewTransition).toBe(native)

    Reflect.deleteProperty(document, 'startViewTransition')
  })

  it('abort tears down instantly and restores the frame exactly once', () => {
    const handoff = start()
    handoff.abort()

    expect(getTraveler()).toBeNull()
    expect(restoreFrame).toHaveBeenCalledExactlyOnceWith(false)
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(handoff.active).toBe(false)
    // Every tween created before the abort is dead.
    expect(fakes.tweens.every((t) => t.killed)).toBe(true)

    // Idempotent — a late signal cannot re-run cleanup.
    handoff.abort()
    handoff.routeChanged()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('hard-cuts on a second route commit mid-flight', () => {
    const handoff = start()
    completeTravelerFade()
    mountDestinationHero()
    handoff.routeChanged()
    expect(handoff.active).toBe(true)

    handoff.routeChanged()

    expect(getTraveler()).toBeNull()
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(handoff.active).toBe(false)
  })
})
