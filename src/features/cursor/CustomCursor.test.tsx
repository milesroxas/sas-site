import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomCursorProvider } from './CustomCursorProvider'
import {
  CURSOR_ACTIVE_ATTR,
  CURSOR_DEFAULTS,
  CURSOR_NATIVE_HIDDEN_ATTR,
  CURSOR_PROXIMITY_VAR,
  cursorTarget,
} from './index'
import { resolveCursorTargetVariant, resolveCursorVariant } from './variants'

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
        labelActivation: CURSOR_DEFAULTS.labelActivation,
        labelPlacement: CURSOR_DEFAULTS.labelPlacement,
        labelOffset: CURSOR_DEFAULTS.labelOffset,
        outerSize: CURSOR_DEFAULTS.outerSize,
        showInnerRing: CURSOR_DEFAULTS.showInnerRing,
        hideNativeCursor: CURSOR_DEFAULTS.hideNativeCursor,
      })
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
      outerSize: 96,
      proximityMaxOpacity: 1,
      showInnerRing: false,
      hideNativeCursor: true,
      selector: '[data-slot="carousel"]',
    })
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
    // jsdom has no checkVisibility — model the closed overlay's visibility:hidden.
    target.checkVisibility = () => false
    pointerMove(150, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
  })

  it('drops a hot target once it turns hidden', () => {
    const { target } = renderWithTarget()
    pointerMove(150, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('1')
    target.checkVisibility = () => false
    pointerMove(151, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
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
    // Nearest edge point hits the overlapping badge; the center is the target.
    document.elementFromPoint = vi
      .fn<Document['elementFromPoint']>()
      .mockReturnValueOnce(badge)
      .mockReturnValueOnce(target)
    // 50px below the rect's bottom edge with a 100px radius -> t = 0.5.
    pointerMove(150, 250)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('0.5')
    badge.remove()
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

  it('prunes a detached target from hot set during stationary-pointer revalidation', async () => {
    const { target } = renderWithTarget()
    pointerMove(150, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('1')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(true)

    // Remove the target from the DOM while the pointer stays stationary.
    target.remove()

    // Wait for revalidation interval to tick (REVALIDATE_MS = 250ms).
    await new Promise((resolve) => setTimeout(resolve, 260))

    // The detached element should have been pruned from the hot set and
    // cleared, and revalidation should have stopped (no active engagement).
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
  })

  it('prunes a target with removed data-cursor attribute during revalidation', async () => {
    const { target } = renderWithTarget()
    pointerMove(150, 150)
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('1')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(true)

    // Remove the data-cursor attribute while the pointer stays stationary.
    target.removeAttribute('data-cursor')

    // Wait for revalidation interval to tick.
    await new Promise((resolve) => setTimeout(resolve, 260))

    // The element should have been pruned and cleared.
    expect(target.style.getPropertyValue(CURSOR_PROXIMITY_VAR)).toBe('')
    expect(target.hasAttribute(CURSOR_ACTIVE_ATTR)).toBe(false)
  })
})
