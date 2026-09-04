import { cleanup, render } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ChromeThemeProvider, useChromeBarTheme } from '@/providers/ChromeTheme'
import { HeroBand } from './HeroBand'

/**
 * A 900px viewport. The bars measure at their resting sizes (4rem / 3.5rem);
 * the scrolled tokens the pin keys off are 3rem / 2.5rem at a 16px root.
 */
const VIEWPORT = 900
const HEADER_BOTTOM_SCROLLED = 48
const FOOTER_TOP_SCROLLED = VIEWPORT - 40

/** The band's document span; its viewport rect follows scrollY. */
let band = { top: 0, bottom: VIEWPORT }
let scrollY = 0

const rect = (top: number, bottom: number) =>
  ({ top, bottom, left: 0, right: 0, width: 0, height: bottom - top, x: 0, y: top }) as DOMRect

/** jsdom has no layout: rects come from what each element is and where the page is. */
const measure = function (this: Element) {
  if (this.hasAttribute('data-site-header')) return rect(0, 64)
  if (this.hasAttribute('data-site-footer')) return rect(VIEWPORT - 56, VIEWPORT)
  if (this.hasAttribute('data-theme')) return rect(band.top - scrollY, band.bottom - scrollY)
  return rect(0, 0)
}

const tokens: Record<string, string> = {
  '--header-bar-height-scrolled': '3rem',
  '--footer-bar-height-scrolled': '2.5rem',
}

const mountChrome = () => {
  const header = document.createElement('header')
  header.setAttribute('data-site-header', '')
  const footer = document.createElement('footer')
  footer.setAttribute('data-site-footer', '')
  document.body.append(header, footer)
}

const ChromeProbe = () => {
  const header = useChromeBarTheme('header')
  const footer = useChromeBarTheme('footer')
  return <output data-testid="probe">{`${header}/${footer}`}</output>
}

const Band = ({ inert = false }: { inert?: boolean }) => (
  <div data-page-frame {...(inert ? { inert: true } : {})}>
    <HeroBand>band</HeroBand>
  </div>
)

const setScrollY = (value: number) => {
  scrollY = value
  Object.defineProperty(window, 'scrollY', { value, configurable: true })
}

const scrollTo = (value: number) => {
  setScrollY(value)
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

const mountWithProbe = (inert = false) =>
  render(
    <ChromeThemeProvider>
      <ChromeProbe />
      <Band inert={inert} />
    </ChromeThemeProvider>,
  )

describe('HeroBand', () => {
  const nativeMeasure = Element.prototype.getBoundingClientRect

  beforeEach(() => {
    band = { top: 0, bottom: VIEWPORT }
    setScrollY(0)
    Object.defineProperty(window, 'innerHeight', { value: VIEWPORT, configurable: true })
    Element.prototype.getBoundingClientRect = measure
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          fontSize: '16px',
          getPropertyValue: (name: string) => tokens[name] ?? '',
        }) as unknown as CSSStyleDeclaration,
    )
    mountChrome()
  })

  afterEach(() => {
    cleanup()
    document.body.replaceChildren()
    Element.prototype.getBoundingClientRect = nativeMeasure
    vi.restoreAllMocks()
  })

  it('pins both bars while the band runs under them and stamps its own palette', () => {
    const { getByTestId, getByText } = mountWithProbe()
    expect(getByText('band').getAttribute('data-theme')).toBe('dark')
    expect(getByTestId('probe').textContent).toBe('dark/dark')
  })

  it('releases the footer first, then the header, as the band scrolls out', () => {
    const { getByTestId } = mountWithProbe()
    // The band's bottom edge leaves the viewport bottom: the footer's plate
    // would show page through, so it goes solid at once.
    scrollTo(1)
    expect(getByTestId('probe').textContent).toBe('dark/null')
    // The header holds until the band's bottom edge reaches its own.
    scrollTo(VIEWPORT - HEADER_BOTTOM_SCROLLED)
    expect(getByTestId('probe').textContent).toBe('dark/null')
    scrollTo(VIEWPORT - HEADER_BOTTOM_SCROLLED + 1)
    expect(getByTestId('probe').textContent).toBe('null/null')
    scrollTo(0)
    expect(getByTestId('probe').textContent).toBe('dark/dark')
  })

  it('does not read layout on scroll', () => {
    const { getByTestId } = mountWithProbe()
    const reads = vi.fn(measure)
    Element.prototype.getBoundingClientRect = reads
    scrollTo(1)
    scrollTo(VIEWPORT)
    scrollTo(0)
    expect(getByTestId('probe').textContent).toBe('dark/dark')
    expect(reads).not.toHaveBeenCalled()
  })

  it('pins the header only once a band that starts below it has scrolled fully under', () => {
    // A medium-impact band sits under the page frame's header offset.
    band = { top: 64, bottom: 664 }
    const { getByTestId } = mountWithProbe()
    expect(getByTestId('probe').textContent).toBe('null/null')
    scrollTo(63)
    expect(getByTestId('probe').textContent).toBe('null/null')
    scrollTo(64)
    expect(getByTestId('probe').textContent).toBe('dark/null')
    scrollTo(664 - HEADER_BOTTOM_SCROLLED)
    expect(getByTestId('probe').textContent).toBe('dark/null')
    scrollTo(664 - HEADER_BOTTOM_SCROLLED + 1)
    expect(getByTestId('probe').textContent).toBe('null/null')
  })

  it('never pins the footer for a band that stops at its top edge', () => {
    band = { top: 0, bottom: VIEWPORT - 56 }
    const { getByTestId } = mountWithProbe()
    expect(getByTestId('probe').textContent).toBe('dark/null')
    expect(FOOTER_TOP_SCROLLED).toBeGreaterThan(band.bottom)
  })

  it('releases both bars on unmount', () => {
    const { getByTestId, rerender } = mountWithProbe()
    expect(getByTestId('probe').textContent).toBe('dark/dark')
    rerender(
      <ChromeThemeProvider>
        <ChromeProbe />
      </ChromeThemeProvider>,
    )
    expect(getByTestId('probe').textContent).toBe('null/null')
  })

  it('re-measures on resize', () => {
    const { getByTestId } = mountWithProbe()
    scrollTo(VIEWPORT)
    expect(getByTestId('probe').textContent).toBe('null/null')
    // The band grows (a taller viewport, svh) while the page sits here: it
    // is back behind the header, and one pixel short of the viewport bottom.
    band = { top: 0, bottom: VIEWPORT * 2 - 1 }
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(getByTestId('probe').textContent).toBe('dark/null')
  })

  it('does not measure while the page frame is inert, and measures once it is released', async () => {
    const { getByTestId, container } = mountWithProbe(true)
    expect(getByTestId('probe').textContent).toBe('null/null')
    scrollTo(0)
    expect(getByTestId('probe').textContent).toBe('null/null')

    const frame = container.querySelector('[data-page-frame]') as HTMLElement
    await act(async () => {
      frame.removeAttribute('inert')
      // MutationObserver callbacks are microtasks.
      await Promise.resolve()
    })
    expect(getByTestId('probe').textContent).toBe('dark/dark')
  })
})
