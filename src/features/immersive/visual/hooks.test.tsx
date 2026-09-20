import { act, cleanup, render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
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

describe('useGroundSurface', () => {
  afterEach(() => {
    cleanup()
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
})
