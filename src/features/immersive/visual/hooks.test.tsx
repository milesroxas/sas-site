import { act, cleanup, render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGroundSurface } from './hooks'

const Probe = () => {
  const ref = useRef<HTMLSpanElement>(null)
  return (
    <span data-testid="probe" ref={ref}>
      {useGroundSurface(ref)}
    </span>
  )
}

/** MutationObserver callbacks are microtasks. */
const setSiteTheme = async (theme: 'dark' | 'light') => {
  await act(async () => {
    document.documentElement.setAttribute('data-theme', theme)
    await Promise.resolve()
  })
}

/**
 * jsdom does not run the site stylesheet, so stand in for the scheme it
 * resolves (globals.css palettes, the `dark` variant): the nearest pin
 * decides, and an inverted band is the opposite of the document theme.
 */
const resolvedScheme = (element: Element) => {
  const scope = element.closest('[data-theme], .band-inverted')
  if (!scope) return 'light'
  if (scope.classList.contains('band-inverted')) {
    return document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  }
  return scope.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

describe('useGroundSurface', () => {
  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element) => ({ colorScheme: resolvedScheme(element) }) as CSSStyleDeclaration,
    )
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    document.documentElement.removeAttribute('data-theme')
  })

  it('follows the site theme on an unpinned ground (a `site` hero band)', async () => {
    await setSiteTheme('dark')
    const { getByTestId } = render(
      <header data-hero-band-pin="site">
        <Probe />
      </header>,
    )
    expect(getByTestId('probe').textContent).toBe('dark')
    await setSiteTheme('light')
    expect(getByTestId('probe').textContent).toBe('light')
    await setSiteTheme('dark')
    expect(getByTestId('probe').textContent).toBe('dark')
  })

  it('holds a pinned band against the site theme', async () => {
    await setSiteTheme('light')
    const { getByTestId } = render(
      <section data-theme="dark">
        <Probe />
      </section>,
    )
    expect(getByTestId('probe').textContent).toBe('dark')
    await setSiteTheme('dark')
    await setSiteTheme('light')
    expect(getByTestId('probe').textContent).toBe('dark')
  })

  it('flips an inverted band against the site theme', async () => {
    await setSiteTheme('light')
    const { getByTestId } = render(
      <section className="band-inverted">
        <Probe />
      </section>,
    )
    expect(getByTestId('probe').textContent).toBe('dark')
    await setSiteTheme('dark')
    expect(getByTestId('probe').textContent).toBe('light')
  })
})
