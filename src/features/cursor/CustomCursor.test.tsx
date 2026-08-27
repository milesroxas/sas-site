import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomCursorProvider } from './CustomCursorProvider'
import {
  CURSOR_ACTIVE_ATTR,
  CURSOR_DEFAULTS,
  CURSOR_NATIVE_HIDDEN_ATTR,
  CURSOR_PROXIMITY_VAR,
  cursorTarget,
  subscribeCursorProximity,
} from './index'
import {
  resolveCursorPressScale,
  resolveCursorTargetVariant,
  resolveCursorVariant,
} from './variants'

/** jsdom has no matchMedia; report a fine pointer and no reduced-motion preference. */
function stubMatchMedia(finePointer: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: finePointer && query === '(pointer: fine)',
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }))
}

function pointerMove(clientX: number, clientY: number) {
  window.dispatchEvent(new MouseEvent('pointermove', { clientX, clientY }))
}

function pointerDown(button = 0) {
  window.dispatchEvent(new MouseEvent('pointerdown', { button }))
}

function pointerUp() {
  window.dispatchEvent(new MouseEvent('pointerup'))
}

const TARGET_RECT = {
  left: 100,
  right: 200,
  top: 100,
  bottom: 200,
  width: 100,
  height: 100,
  x: 100,
  y: 100,
  toJSON: () => ({}),
} as DOMRect

function renderWithTarget() {
  const view = render(
    <CustomCursorProvider>
      <button type="button" {...cursorTarget({ variant: 'emphasize', label: 'Read post' })}>
        target
      </button>
    </CustomCursorProvider>,
  )
  const target = view.getByRole('button')
  vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(TARGET_RECT)
  return { view, target }
}

describe('cursorTarget', () => {
  it('returns the variant and label as data attributes', () => {
    expect(cursorTarget({ variant: 'emphasize', label: 'Read post' })).toEqual({
      'data-cursor': 'emphasize',
      'data-cursor-label': 'Read post',
    })
  })

  it('omits the label attribute when no label is given', () => {
    expect(cursorTarget()).toEqual({ 'data-cursor': 'emphasize' })
  })
})

describe('resolveCursorVariant', () => {
  it('falls back to defaults for unknown or missing variant names', () => {
    for (const name of [undefined, 'not-a-variant']) {
      expect(resolveCursorVariant(name)).toEqual({
        proximityRadius: CURSOR_DEFAULTS.proximityRadius,
        proximityMaxOpacity: CURSOR_DEFAULTS.proximityMaxOpacity,
        hoverOuterScale: CURSOR_DEFAULTS.hoverOuterScale,
        pressScale: CURSOR_DEFAULTS.pressScale,
        grabbable: CURSOR_DEFAULTS.grabbable,
        labelActivation: CURSOR_DEFAULTS.labelActivation,
        labelPlacement: CURSOR_DEFAULTS.labelPlacement,
        labelOffset: CURSOR_DEFAULTS.labelOffset,
        outerSize: CURSOR_DEFAULTS.outerSize,
        showInnerRing: CURSOR_DEFAULTS.showInnerRing,
        hideNativeCursor: CURSOR_DEFAULTS.hideNativeCursor,
      })
    }
  })

  it('gives every non-drag variant the shared press amplitude, ungrabbable', () => {
    for (const name of [undefined, 'emphasize', 'view']) {
      expect(resolveCursorVariant(name).pressScale).toBe(CURSOR_DEFAULTS.pressScale)
      expect(resolveCursorVariant(name).grabbable).toBe(false)
    }
  })

  it('owns the automatic carousel target and uppercase drag label', () => {
    const carousel = document.createElement('div')
    carousel.dataset.slot = 'carousel'

    expect(resolveCursorTargetVariant(carousel)).toBe('drag')
    expect(resolveCursorVariant('drag')).toMatchObject({
      label: 'DRAG',
      labelActivation: 'proximity',
      labelPlacement: 'center',
      outerSize: 50,
      pressScale: 0.82,
      grabbable: true,
      proximityMaxOpacity: 1,
      showInnerRing: false,
      hideNativeCursor: true,
      selector: '[data-slot="carousel"]',
    })
  })
})

describe('resolveCursorPressScale', () => {
  const variant = resolveCursorVariant('emphasize')

  function element(html: string): Element {
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.appendChild(host)
    const target = host.firstElementChild
    if (!target) throw new Error('no element')
    return target
  }

  afterEach(() => {
    document.body.replaceChildren()
  })

  it('presses on clickable targets', () => {
    for (const html of [
      '<a href="/work">work</a>',
      '<button type="button">go</button>',
      '<div role="button" tabindex="0">go</div>',
    ]) {
      expect(resolveCursorPressScale(element(html), variant)).toBe(variant.pressScale)
    }
  })

  it('presses on a target nested inside a clickable ancestor', () => {
    const link = element('<a href="/work"><span>work</span></a>')
    const inner = link.firstElementChild
    if (!inner) throw new Error('no child')
    expect(resolveCursorPressScale(inner, variant)).toBe(variant.pressScale)
  })

  it('stays inert on targets a pointer cannot press', () => {
    for (const html of [
      '<div>decorative</div>',
      '<a>no href</a>',
      '<button type="button" disabled>go</button>',
      '<div role="button" aria-disabled="true">go</div>',
    ]) {
      expect(resolveCursorPressScale(element(html), variant)).toBe(1)
    }
  })

  it('presses a grabbable target whether or not it is clickable', () => {
    const drag = resolveCursorVariant('drag')
    expect(resolveCursorPressScale(element('<div data-slot="carousel"></div>'), drag)).toBe(
      drag.pressScale,
    )
  })
})

describe('CustomCursorProvider', () => {
  beforeEach(() => stubMatchMedia(true))
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    // jsdom implements neither; tests assign them directly, so remove between runs.
    delete (document as Partial<Document>).elementFromPoint
  })

  it('renders no overlay for coarse pointers', () => {
    stubMatchMedia(false)
    const { view } = renderWithTarget()
    expect(view.container.querySelector('[aria-hidden]')).toBeNull()
  })

  it('renders the overlay rings for fine pointers', () => {
    const { view } = renderWithTarget()
    expect(view.baseElement.querySelector('[aria-hidden]')).not.toBeNull()
  })

  it('publishes proximity and the active attribute while hovering a target', () => {
    const { target } = renderWithTarget()
    pointerMove(150, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('1')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(true)
  })

  it('publishes partial proximity without the active attribute nearby', () => {
    const { target } = renderWithTarget()
    // 50px below the rect's bottom edge with a 100px radius -> t = 0.5.
    pointerMove(150, 250)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('0.5')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
  })

  it('clears proximity and the active attribute once out of range', () => {
    const { target } = renderWithTarget()
    pointerMove(150, 150)
    pointerMove(150, 400)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
  })

  it('ignores targets inside an inert subtree (the docked page frame)', () => {
    const view = render(
      <CustomCursorProvider>
        <div inert>
          <button type="button" {...cursorTarget({ variant: 'emphasize' })}>
            behind menu
          </button>
        </div>
      </CustomCursorProvider>,
    )
    const target = view.getByRole('button', { hidden: true })
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(TARGET_RECT)
    pointerMove(150, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
  })

  it('drops a hot target once its subtree turns inert', () => {
    const { target } = renderWithTarget()
    pointerMove(150, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('1')
    target.parentElement?.setAttribute('inert', '')
    pointerMove(151, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
  })

  it('ignores hidden targets still in layout (the closed takeover menu)', () => {
    const { target } = renderWithTarget()
    // jsdom has no checkVisibility — model the closed overlay's visibility:hidden,
    // which the API only reports when the visibilityProperty option is set.
    target.checkVisibility = (options) => options?.visibilityProperty !== true
    pointerMove(150, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
  })

  it('drops a hot target once it turns hidden', () => {
    const { target } = renderWithTarget()
    pointerMove(150, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('1')
    target.checkVisibility = (options) => options?.visibilityProperty !== true
    pointerMove(151, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
  })

  /** Detachable target outside React's tree — removing a React-rendered node
   *  would break unmount. Callers remove it (or the test removes it itself). */
  function appendPlainTarget() {
    render(<CustomCursorProvider>page</CustomCursorProvider>)
    const target = document.createElement('button')
    for (const [attr, value] of Object.entries(cursorTarget({ variant: 'emphasize' }))) {
      target.setAttribute(attr, value)
    }
    document.body.appendChild(target)
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(TARGET_RECT)
    return target
  }

  it('releases a removed target while the pointer is stationary', () => {
    vi.useFakeTimers()
    try {
      const target = appendPlainTarget()
      pointerMove(150, 150)
      expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('1')
      target.remove()
      // No pointer movement — only the engaged-state revalidation interval runs.
      vi.advanceTimersByTime(300)
      expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
      expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('releases a target whose cursor attribute is removed under a still pointer', () => {
    vi.useFakeTimers()
    try {
      const target = appendPlainTarget()
      pointerMove(150, 150)
      expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('1')
      target.removeAttribute('data-cursor')
      vi.advanceTimersByTime(300)
      expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
      expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
      target.remove()
    } finally {
      vi.useRealTimers()
    }
  })

  it('ignores a target covered by an overlay (dialog, scrim)', () => {
    const { target } = renderWithTarget()
    const scrim = document.createElement('div')
    document.body.appendChild(scrim)
    document.elementFromPoint = () => scrim
    pointerMove(150, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
    scrim.remove()
  })

  it('keeps the approach tease when an overlap covers only the nearest edge', () => {
    const { target } = renderWithTarget()
    const badge = document.createElement('div')
    document.body.appendChild(badge)
    // Pointer sits in empty space below the target. Nearest-edge hit-testing
    // can land on the overlapping badge; the center is still the target.
    document.elementFromPoint = vi.fn<Document['elementFromPoint']>((_x, y) => {
      if (y > TARGET_RECT.bottom) return document.body
      if (y === TARGET_RECT.bottom) return badge
      return target
    })
    // 50px below the rect's bottom edge with a 100px radius -> t = 0.5.
    pointerMove(150, 250)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('0.5')
    badge.remove()
  })

  it('does not pull proximity while the pointer is over a dropdown', () => {
    const view = render(
      <CustomCursorProvider>
        <a href="/work" {...cursorTarget({ variant: 'view' })}>
          media
        </a>
        <button type="button" data-slot="dropdown-menu-trigger">
          industries
        </button>
      </CustomCursorProvider>,
    )
    const target = view.getByRole('link', { name: 'media' })
    const trigger = view.getByRole('button', { name: 'industries' })
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(TARGET_RECT)
    document.elementFromPoint = () => trigger
    // 50px below the rect — inside the view variant's 180px radius.
    pointerMove(150, 250)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
  })

  it('fans proximity out to JS subscribers alongside the CSS var', () => {
    const { target } = renderWithTarget()
    const seen: number[] = []
    const unsubscribe = subscribeCursorProximity(target, (t) => seen.push(t))
    // 50px below the rect's bottom edge with a 100px radius -> t = 0.5.
    pointerMove(150, 250)
    pointerMove(150, 150)
    pointerMove(150, 400)
    expect(seen).toEqual([0.5, 1, 0])
    unsubscribe()
    pointerMove(150, 150)
    expect(seen).toEqual([0.5, 1, 0])
  })

  it('automatically tracks carousels without cursor props at the call site', () => {
    const view = render(
      <CustomCursorProvider>
        <div data-slot="carousel">carousel</div>
      </CustomCursorProvider>,
    )
    const carousel = view.getByText('carousel')
    vi.spyOn(carousel, 'getBoundingClientRect').mockReturnValue(TARGET_RECT)

    pointerMove(150, 250)

    expect(carousel.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('0.5')
    expect(document.documentElement.hasAttribute(CURSOR_NATIVE_HIDDEN_ATTR)).toBe(true)
    expect(
      view.baseElement.querySelector('[aria-hidden]')?.getAttribute('data-cursor-variant'),
    ).toBe('drag')

    pointerMove(150, 400)
    expect(document.documentElement.hasAttribute(CURSOR_NATIVE_HIDDEN_ATTR)).toBe(false)
  })

  /** Carousel that the drag variant picks up automatically, rect-stubbed. */
  function renderCarousel() {
    const view = render(
      <CustomCursorProvider>
        <div data-slot="carousel">carousel</div>
      </CustomCursorProvider>,
    )
    const carousel = view.getByText('carousel')
    vi.spyOn(carousel, 'getBoundingClientRect').mockReturnValue(TARGET_RECT)
    return carousel
  }

  it('holds the grab while a drag leaves the carousel, and lets go on release', () => {
    const carousel = renderCarousel()
    pointerMove(150, 150)
    pointerDown()
    // Well past the drag variant's radius: the carousel keeps scrolling via
    // pointer capture, so the cursor must stay locked on rather than reset.
    pointerMove(150, 900)
    expect(carousel.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('1')
    expect(carousel.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(true)
    expect(document.documentElement.hasAttribute(CURSOR_NATIVE_HIDDEN_ATTR)).toBe(true)

    // Release without a following move — the drag ends where it ends.
    pointerUp()
    expect(carousel.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(carousel.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
    expect(document.documentElement.hasAttribute(CURSOR_NATIVE_HIDDEN_ATTR)).toBe(false)
  })

  it('does not grab on a secondary-button press (context menu, not a drag)', () => {
    const carousel = renderCarousel()
    pointerMove(150, 150)
    pointerDown(2)
    pointerMove(150, 900)
    expect(carousel.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(carousel.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
  })

  it('does not latch variants without a press response', () => {
    const { target } = renderWithTarget()
    pointerMove(150, 150)
    pointerDown()
    pointerMove(150, 900)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
    pointerUp()
  })
})
