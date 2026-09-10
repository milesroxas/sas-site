import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { videoFixture } from '@/blocks/fixtures'
import { VideoMedia } from './index'

type Callback = (entries: Pick<IntersectionObserverEntry, 'isIntersecting'>[]) => void

/**
 * Observers keyed by rootMargin so a test can open the "near" gate (the
 * two-screen source margin) and the "visible" gate (the element's own box)
 * independently, the way the page does as the reader scrolls.
 */
const observers = new Map<string, Callback>()

class ObserverMock {
  rootMargin: string
  constructor(cb: Callback, init?: IntersectionObserverInit) {
    this.rootMargin = init?.rootMargin ?? ''
    observers.set(this.rootMargin, cb)
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

const intersect = (rootMargin: string, isIntersecting: boolean) => {
  const cb = observers.get(rootMargin)
  if (!cb) throw new Error(`no observer for rootMargin "${rootMargin}"`)
  cb([{ isIntersecting }])
}

const NEAR = '200% 0px'
const VISIBLE = ''

describe('VideoMedia', () => {
  beforeEach(() => {
    observers.clear()
    vi.stubGlobal('IntersectionObserver', ObserverMock)
    // jsdom has no media pipeline; play() returns undefined and pause() throws
    // "not implemented". Stub both so the gate's play/pause calls are observable.
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve())
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders a self-playing video with the poster only until it is near the viewport', () => {
    const { container } = render(<VideoMedia resource={videoFixture} />)
    const video = container.querySelector('video')
    expect(video).not.toBeNull()
    expect(video?.getAttribute('preload')).toBe('none')
    expect(video?.getAttribute('poster')).toContain('poster')
    expect(video?.querySelector('source')).toBeNull()
  })

  it('attaches the source once near, then follows visibility with play and pause', async () => {
    const { container, rerender } = render(<VideoMedia resource={videoFixture} />)
    const video = container.querySelector('video') as HTMLVideoElement
    const play = HTMLMediaElement.prototype.play
    const pause = HTMLMediaElement.prototype.pause

    const { act } = await import('react')
    await act(async () => intersect(NEAR, true))
    rerender(<VideoMedia resource={videoFixture} />)
    expect(video.querySelector('source')?.getAttribute('src')).toContain(videoFixture.url)

    await act(async () => intersect(VISIBLE, true))
    expect(play).toHaveBeenCalled()

    // jsdom's `paused` is always true, so the pause branch cannot be reached
    // through the element; the source must still stay attached on exit.
    await act(async () => intersect(VISIBLE, false))
    expect(video.querySelector('source')).not.toBeNull()
    expect(pause).not.toHaveBeenCalled()
  })

  it('ships the source eagerly with preload="auto" for priority (hero) video', () => {
    const { container } = render(<VideoMedia priority resource={videoFixture} />)
    const video = container.querySelector('video')
    expect(video?.getAttribute('preload')).toBe('auto')
    expect(video?.querySelector('source')?.getAttribute('src')).toContain(videoFixture.url)
    expect(observers.size).toBe(0)
  })

  it('leaves loading to the caller when playback is external (autoPlay false)', () => {
    const { container } = render(<VideoMedia autoPlay={false} resource={videoFixture} />)
    const video = container.querySelector('video')
    expect(video?.hasAttribute('autoplay')).toBe(false)
    expect(video?.getAttribute('preload')).toBe('metadata')
    expect(video?.querySelector('source')).not.toBeNull()
    expect(observers.size).toBe(0)
  })
})
