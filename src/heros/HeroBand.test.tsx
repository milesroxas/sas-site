import { cleanup, render } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ChromeThemeProvider, useChromeTheme } from '@/providers/ChromeTheme'
import { HeroBand } from './HeroBand'

/** Fixed bars at their resting sizes on a 900px-tall viewport. */
const HEADER_BOTTOM = 64
const FOOTER_TOP = 900 - 56

let bandBottom = 900

const rect = (top: number, bottom: number) =>
  ({ top, bottom, left: 0, right: 0, width: 0, height: bottom - top, x: 0, y: top }) as DOMRect

/** jsdom has no layout: rects come from what each element is, not where it sits. */
const measure = function (this: Element) {
  if (this.hasAttribute('data-site-header')) return rect(0, HEADER_BOTTOM)
  if (this.hasAttribute('data-site-footer')) return rect(FOOTER_TOP, 900)
  if (this.hasAttribute('data-theme')) return rect(bandBottom - 900, bandBottom)
  return rect(0, 0)
}

const mountChrome = () => {
  const header = document.createElement('header')
  header.setAttribute('data-site-header', '')
  const footer = document.createElement('footer')
  footer.setAttribute('data-site-footer', '')
  document.body.append(header, footer)
}

const ChromeProbe = () => {
  const { chromeTheme } = useChromeTheme()
  return <output data-testid="probe">{`${chromeTheme.header}/${chromeTheme.footer}`}</output>
}

const Band = ({ inert = false }: { inert?: boolean }) => (
  <div data-page-frame {...(inert ? { inert: true } : {})}>
    <HeroBand>band</HeroBand>
  </div>
)

const scrollTo = (nextBandBottom: number) => {
  bandBottom = nextBandBottom
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('HeroBand', () => {
  const nativeMeasure = Element.prototype.getBoundingClientRect

  beforeEach(() => {
    bandBottom = 900
    Element.prototype.getBoundingClientRect = measure
    mountChrome()
  })

  afterEach(() => {
    cleanup()
    document.body.replaceChildren()
    Element.prototype.getBoundingClientRect = nativeMeasure
  })

  it('pins both bars while the band runs under them and stamps its own palette', () => {
    const { getByTestId, getByText } = render(
      <ChromeThemeProvider>
        <ChromeProbe />
        <Band />
      </ChromeThemeProvider>,
    )
    expect(getByText('band').getAttribute('data-theme')).toBe('dark')
    expect(getByTestId('probe').textContent).toBe('dark/dark')
  })

  it('releases the footer first, then the header, as the band scrolls out', () => {
    const { getByTestId } = render(
      <ChromeThemeProvider>
        <ChromeProbe />
        <Band />
      </ChromeThemeProvider>,
    )
    scrollTo(FOOTER_TOP - 1)
    expect(getByTestId('probe').textContent).toBe('dark/null')
    scrollTo(HEADER_BOTTOM - 1)
    expect(getByTestId('probe').textContent).toBe('null/null')
    scrollTo(900)
    expect(getByTestId('probe').textContent).toBe('dark/dark')
  })

  it('releases both bars on unmount', () => {
    const { getByTestId, rerender } = render(
      <ChromeThemeProvider>
        <ChromeProbe />
        <Band />
      </ChromeThemeProvider>,
    )
    expect(getByTestId('probe').textContent).toBe('dark/dark')
    rerender(
      <ChromeThemeProvider>
        <ChromeProbe />
      </ChromeThemeProvider>,
    )
    expect(getByTestId('probe').textContent).toBe('null/null')
  })

  it('does not measure while the page frame is inert, and measures once it is released', async () => {
    const { getByTestId, container } = render(
      <ChromeThemeProvider>
        <ChromeProbe />
        <Band inert />
      </ChromeThemeProvider>,
    )
    expect(getByTestId('probe').textContent).toBe('null/null')
    scrollTo(900)
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
