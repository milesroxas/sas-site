import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  collectHeldMedia,
  NAV_CURTAIN_ATTR,
  NAV_CURTAIN_LIFT_ATTR,
  startNavCurtain,
} from './navCurtain'

/**
 * The controller's value is its sequencing (undock done vs route commit vs
 * paint, aborts, timeouts) and the hold contract, not the CSS lift itself —
 * jsdom has no animations, so the lift resolves instantly here and the
 * animation path is exercised through a stubbed `getAnimations`.
 */

/** A decoded image, as the menu's readiness gate sees one. */
const readyImage = (opacity = '1') => {
  const img = document.createElement('img')
  Object.defineProperty(img, 'complete', { value: true })
  Object.defineProperty(img, 'naturalWidth', { value: 100 })
  img.style.opacity = opacity
  return img
}

const coldImage = () => {
  const img = document.createElement('img')
  Object.defineProperty(img, 'complete', { value: false })
  Object.defineProperty(img, 'naturalWidth', { value: 0 })
  img.style.opacity = '0'
  return img
}

const getCurtain = () => document.querySelector<HTMLElement>(`[${NAV_CURTAIN_ATTR}]`)

describe('collectHeldMedia', () => {
  let layer: HTMLElement
  beforeEach(() => {
    layer = document.createElement('div')
  })

  it('holds the whole ready stack, in order, when something in it is opaque', () => {
    const base = readyImage('1')
    base.setAttribute('data-menu-hero-base', '')
    const hover = readyImage('0.4')
    hover.setAttribute('data-menu-hover-item', '/a.jpg')
    layer.append(base, hover)
    expect(collectHeldMedia(layer)).toEqual([base, hover])
  })

  it('holds nothing when the stack is mid-dissolve or cold', () => {
    const base = readyImage('0.6')
    base.setAttribute('data-menu-hero-base', '')
    layer.append(base)
    expect(collectHeldMedia(layer)).toEqual([])

    const cold = coldImage()
    cold.setAttribute('data-menu-hero-base', '')
    layer.replaceChildren(cold)
    expect(collectHeldMedia(layer)).toEqual([])
  })

  it('leaves pending previews, unready media and non-media children behind', () => {
    const base = readyImage('1')
    base.setAttribute('data-menu-hero-base', '')
    const pending = readyImage('0')
    pending.setAttribute('data-menu-hover-item', '/b.jpg')
    pending.dataset.menuHoverPending = ''
    const cold = coldImage()
    cold.setAttribute('data-menu-hover-item', '/c.jpg')
    const cover = document.createElement('div')
    cover.setAttribute('data-menu-chat-cover', '')
    layer.append(base, pending, cold, cover)
    expect(collectHeldMedia(layer)).toEqual([base])
  })
})

describe('startNavCurtain', () => {
  let frame: HTMLElement
  let layer: HTMLElement
  let base: HTMLImageElement
  let onDone: ReturnType<typeof vi.fn<() => void>>
  const startViewTransition = vi.fn()

  const start = () =>
    startNavCurtain({
      media: [base],
      frame,
      onDone,
    })

  /** Two frames of paint cushion after the commit. */
  const settlePaint = () => vi.advanceTimersByTime(50)

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'],
    })
    frame = document.createElement('div')
    layer = document.createElement('div')
    base = readyImage('0.5')
    base.setAttribute('data-menu-hero-base', '')
    layer.appendChild(base)
    frame.appendChild(layer)
    document.body.appendChild(frame)
    onDone = vi.fn<() => void>()
    Object.defineProperty(document, 'startViewTransition', {
      value: startViewTransition,
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
    Reflect.deleteProperty(document, 'startViewTransition')
  })

  it('pins the held media opaque and suppresses the platform transition for the flight', () => {
    const curtain = start()
    expect(base.style.opacity).toBe('1')
    expect(document.startViewTransition).toBeUndefined()
    expect(curtain.active).toBe(true)
    curtain.abort()
    expect(document.startViewTransition).toBe(startViewTransition)
  })

  it('undock done, then route: moves the media into a fixed curtain and lifts once painted', () => {
    const footer = document.createElement('footer')
    document.body.appendChild(footer)
    const curtain = startNavCurtain({ media: [base], frame, chrome: [footer], onDone })
    curtain.raise()
    const el = getCurtain()
    expect(el).not.toBeNull()
    expect(el?.contains(base)).toBe(true)
    expect(layer.contains(base)).toBe(false)
    // Persistent chrome rides above the curtain for its life.
    expect(footer.style.zIndex).toBe('47')
    // Nothing lifts before the route commits.
    settlePaint()
    expect(el?.hasAttribute(NAV_CURTAIN_LIFT_ATTR)).toBe(false)

    curtain.routeChanged()
    expect(el?.hasAttribute(NAV_CURTAIN_LIFT_ATTR)).toBe(false)
    settlePaint()
    // jsdom runs no CSS animation: the lift resolves at once.
    expect(getCurtain()).toBeNull()
    expect(footer.style.zIndex).toBe('')
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(curtain.active).toBe(false)
    expect(document.startViewTransition).toBe(startViewTransition)
  })

  it('route first (prefetched), then undock done: lifts on raise', () => {
    const curtain = start()
    curtain.routeChanged()
    expect(getCurtain()).toBeNull()
    curtain.raise()
    settlePaint()
    expect(getCurtain()).toBeNull()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('waits for the lift animation to finish before dropping the curtain', async () => {
    const curtain = start()
    curtain.raise()
    const el = getCurtain() as HTMLElement
    let finish!: () => void
    const finished = new Promise<void>((resolve) => {
      finish = resolve
    })
    el.getAnimations = () => [{ finished } as unknown as Animation]
    curtain.routeChanged()
    settlePaint()
    expect(el.hasAttribute(NAV_CURTAIN_LIFT_ATTR)).toBe(true)
    expect(getCurtain()).toBe(el)
    finish()
    await finished
    await Promise.resolve()
    expect(getCurtain()).toBeNull()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('holds until a cold destination hero can paint, with a grace timeout', () => {
    const curtain = start()
    const wrap = document.createElement('div')
    wrap.setAttribute('data-hero-media', '')
    wrap.appendChild(coldImage())
    frame.appendChild(wrap)
    curtain.raise()
    curtain.routeChanged()
    settlePaint()
    expect(getCurtain()).not.toBeNull()
    // The image never decodes in jsdom: the grace timeout lifts anyway.
    vi.advanceTimersByTime(1600)
    expect(getCurtain()).toBeNull()
  })

  it('lifts anyway when the route never commits', () => {
    const curtain = start()
    curtain.raise()
    vi.advanceTimersByTime(5100)
    expect(getCurtain()).toBeNull()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('abort before the undock finishes leaves the media where it is', () => {
    const curtain = start()
    curtain.abort()
    expect(layer.contains(base)).toBe(true)
    expect(getCurtain()).toBeNull()
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(document.startViewTransition).toBe(startViewTransition)
    // Idempotent: a late raise/route is a no-op.
    curtain.raise()
    curtain.routeChanged()
    expect(getCurtain()).toBeNull()
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
