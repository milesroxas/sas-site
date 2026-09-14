import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clipPathInset } from '@/shared/ui/hero-landing'
import {
  canStartHeroHandoff,
  cloneHeroSource,
  getCardMotion,
  getViewportCrop,
  isInAppNavClick,
  isMediaReady,
  MENU_MEDIA_GROUND_ATTR,
  menuMediaUrl,
  onMediaReady,
} from './motion'

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
    mediaReady: true,
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
    // Cold cache: the traveler would expand a box with nothing in it.
    expect(canStartHeroHandoff({ ...openGate, mediaReady: false })).toBe(false)
  })
})

describe('media readiness', () => {
  // jsdom never loads anything, so painted state is stubbed the way the DOM
  // reports it: a decoded image has pixels, a video has buffered a frame.
  const paintedImage = () => {
    const img = document.createElement('img')
    Object.defineProperty(img, 'naturalWidth', { value: 1200, configurable: true })
    return img
  }
  const bufferedVideo = () => {
    const video = document.createElement('video')
    Object.defineProperty(video, 'readyState', {
      value: HTMLMediaElement.HAVE_CURRENT_DATA,
      configurable: true,
    })
    return video
  }

  it('calls an element ready only once it has pixels to show', () => {
    expect(isMediaReady(document.createElement('img'))).toBe(false)
    expect(isMediaReady(paintedImage())).toBe(true)
    expect(isMediaReady(document.createElement('video'))).toBe(false)
    expect(isMediaReady(bufferedVideo())).toBe(true)
    // Anything else carries its own pixels — nothing to wait for.
    expect(isMediaReady(document.createElement('div'))).toBe(true)
  })

  it('resolves immediately for media that can already paint', () => {
    const done = vi.fn()
    onMediaReady(paintedImage(), done)
    expect(done).toHaveBeenCalledWith(true)
    onMediaReady(bufferedVideo(), done)
    expect(done).toHaveBeenLastCalledWith(true)
  })

  it('waits for the load, and reports a failure as not-ready', () => {
    const img = document.createElement('img')
    const done = vi.fn()
    onMediaReady(img, done)
    expect(done).not.toHaveBeenCalled()
    img.dispatchEvent(new Event('load'))
    expect(done).toHaveBeenCalledWith(true)

    const broken = document.createElement('img')
    const failed = vi.fn()
    onMediaReady(broken, failed)
    broken.dispatchEvent(new Event('error'))
    expect(failed).toHaveBeenCalledWith(false)

    const video = document.createElement('video')
    const played = vi.fn()
    onMediaReady(video, played)
    video.dispatchEvent(new Event('loadeddata'))
    expect(played).toHaveBeenCalledWith(true)
  })
})

describe('cloneHeroSource', () => {
  it('clones a bare copy pinned to the rendition on screen', () => {
    const source = document.createElement('img')
    source.id = 'hero'
    source.className = 'object-cover'
    source.setAttribute('srcset', '/hero-900.jpg 900w, /hero-1600.jpg 1600w')
    source.setAttribute('sizes', '100vw')
    source.src = '/hero-1600.jpg'
    Object.defineProperty(source, 'currentSrc', { value: '/hero-1600.jpg', configurable: true })
    const clone = cloneHeroSource(source)
    expect(clone.id).toBe('')
    expect(clone.className).toBe('')
    expect(clone.getAttribute('srcset')).toBeNull()
    expect(clone.getAttribute('src')).toBe('/hero-1600.jpg')
    expect(clone.style.backgroundColor).toBe('')
  })

  it('drops a Streak poster theme gate and pins the ground it was drawn on', () => {
    document.documentElement.dataset.theme = 'light'
    const band = document.createElement('div')
    band.dataset.theme = 'dark'
    const source = document.createElement('img')
    source.setAttribute('data-visual-poster', 'dark')
    source.src = '/images/streak-field/signal-v1-dark.webp'
    band.append(source)
    document.body.append(band)
    try {
      const clone = cloneHeroSource(source)
      expect(clone.hasAttribute('data-visual-poster')).toBe(false)
      expect(clone.hasAttribute(MENU_MEDIA_GROUND_ATTR)).toBe(true)
      expect(clone.dataset.theme).toBe('dark')
    } finally {
      band.remove()
      delete document.documentElement.dataset.theme
    }
  })

  it('takes the document theme for a poster outside any band', () => {
    document.documentElement.dataset.theme = 'light'
    const source = document.createElement('img')
    source.setAttribute('data-visual-poster', 'light')
    document.body.append(source)
    try {
      expect(cloneHeroSource(source).dataset.theme).toBe('light')
    } finally {
      source.remove()
      delete document.documentElement.dataset.theme
    }
  })
})

describe('menuMediaUrl', () => {
  const poster = {
    url: '/images/streak-field/signal-v1-dark.webp',
    lightUrl: '/images/streak-field/signal-v1-light.webp',
  }
  afterEach(() => {
    delete document.documentElement.dataset.theme
  })

  it('follows the site theme for a poster on the site ground', () => {
    document.documentElement.dataset.theme = 'light'
    expect(menuMediaUrl({ ...poster, ground: 'site' })).toBe(poster.lightUrl)
    document.documentElement.dataset.theme = 'dark'
    expect(menuMediaUrl({ ...poster, ground: 'site' })).toBe(poster.url)
  })

  it('keeps a pinned ground whatever the site theme is', () => {
    document.documentElement.dataset.theme = 'light'
    expect(menuMediaUrl({ ...poster, ground: 'dark' })).toBe(poster.url)
    document.documentElement.dataset.theme = 'dark'
    expect(menuMediaUrl({ ...poster, ground: 'light' })).toBe(poster.lightUrl)
  })

  it('has one URL for anything that is not a poster', () => {
    expect(menuMediaUrl({ url: '/hero.jpg' })).toBe('/hero.jpg')
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
