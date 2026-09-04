import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { onChromeScroll, pageFrameFrozen, useScrolledChrome } from './chrome-scroll'

const setScrollY = (value: number) =>
  Object.defineProperty(window, 'scrollY', { value, configurable: true })

const scrollTo = (value: number) => {
  setScrollY(value)
  window.dispatchEvent(new Event('scroll'))
}

/** MutationObserver callbacks are microtasks. */
const flushObservers = () => Promise.resolve()

let frame: HTMLElement

beforeEach(() => {
  frame = document.createElement('div')
  frame.setAttribute('data-page-frame', '')
  document.body.append(frame)
  setScrollY(0)
})

afterEach(() => {
  document.body.replaceChildren()
  document.documentElement.removeAttribute('data-scrolled')
  setScrollY(0)
  vi.restoreAllMocks()
})

describe('onChromeScroll', () => {
  it('fans the scroll position out to every subscriber', () => {
    const first = vi.fn()
    const second = vi.fn()
    const stopFirst = onChromeScroll(first)
    const stopSecond = onChromeScroll(second)
    try {
      scrollTo(120)
      expect(first).toHaveBeenCalledWith(120)
      expect(second).toHaveBeenCalledWith(120)
    } finally {
      stopFirst()
      stopSecond()
    }
  })

  it('skips scroll events while the page frame is frozen and runs once when it thaws', async () => {
    const listener = vi.fn()
    const stop = onChromeScroll(listener)
    try {
      frame.setAttribute('inert', '')
      expect(pageFrameFrozen()).toBe(true)
      // The docked document collapses and reports 0: never seen by subscribers.
      scrollTo(0)
      expect(listener).not.toHaveBeenCalled()

      // restoreFrame: the offset is final before the attribute drops, and no
      // scroll event follows when it already matches.
      setScrollY(640)
      frame.removeAttribute('inert')
      await flushObservers()
      expect(pageFrameFrozen()).toBe(false)
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(640)
    } finally {
      stop()
    }
  })

  it('drops the window listener once the last subscriber leaves', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const first = vi.fn()
    const second = vi.fn()
    const stopFirst = onChromeScroll(first)
    const stopSecond = onChromeScroll(second)
    stopFirst()
    expect(remove).not.toHaveBeenCalledWith('scroll', expect.any(Function))
    stopSecond()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
    scrollTo(50)
    expect(first).not.toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
  })

  it('finds the page frame again after it has been replaced', async () => {
    const listener = vi.fn()
    const stop = onChromeScroll(listener)
    try {
      frame.remove()
      const next = document.createElement('div')
      next.setAttribute('data-page-frame', '')
      next.setAttribute('inert', '')
      document.body.append(next)
      expect(pageFrameFrozen()).toBe(true)
      scrollTo(10)
      expect(listener).not.toHaveBeenCalled()
      next.removeAttribute('inert')
      scrollTo(20)
      expect(listener).toHaveBeenCalledWith(20)
    } finally {
      stop()
    }
  })
})

describe('useScrolledChrome', () => {
  it('toggles html[data-scrolled] past the threshold and clears it on unmount', () => {
    const root = document.documentElement
    const { unmount } = renderHook(() => useScrolledChrome())
    expect(root.hasAttribute('data-scrolled')).toBe(false)

    act(() => scrollTo(8))
    expect(root.hasAttribute('data-scrolled')).toBe(false)
    act(() => scrollTo(9))
    expect(root.hasAttribute('data-scrolled')).toBe(true)
    act(() => scrollTo(0))
    expect(root.hasAttribute('data-scrolled')).toBe(false)

    act(() => scrollTo(300))
    expect(root.hasAttribute('data-scrolled')).toBe(true)
    unmount()
    expect(root.hasAttribute('data-scrolled')).toBe(false)
  })

  it('writes the root only when the state flips', () => {
    const root = document.documentElement
    const toggle = vi.spyOn(root, 'toggleAttribute')
    renderHook(() => useScrolledChrome())
    act(() => scrollTo(100))
    act(() => scrollTo(200))
    act(() => scrollTo(300))
    expect(toggle).toHaveBeenCalledTimes(1)
  })

  it('re-syncs when the frame thaws at a position no scroll event announces', async () => {
    const root = document.documentElement
    renderHook(() => useScrolledChrome())
    act(() => scrollTo(900))
    expect(root.hasAttribute('data-scrolled')).toBe(true)

    // Docked: the collapsed document reads 0, which must not be believed.
    frame.setAttribute('inert', '')
    act(() => scrollTo(0))
    expect(root.hasAttribute('data-scrolled')).toBe(true)

    // A menu-link navigation lands the new route at 0: the collapsed
    // document was already there, so the thaw is the only signal.
    await act(async () => {
      frame.removeAttribute('inert')
      await flushObservers()
    })
    expect(root.hasAttribute('data-scrolled')).toBe(false)
  })
})
