import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CHROME_THEME_SITE,
  ChromeThemeProvider,
  type ChromeThemeStore,
  createChromeThemeStore,
  useChromeBarTheme,
  useChromeThemeStore,
} from './index'

afterEach(cleanup)

describe('createChromeThemeStore', () => {
  it('starts on the site theme and notifies only when a bar changes', () => {
    const store = createChromeThemeStore()
    const listener = vi.fn()
    store.subscribe(listener)
    expect(store.read()).toBe(CHROME_THEME_SITE)

    store.write({ header: null, footer: null })
    expect(listener).not.toHaveBeenCalled()

    store.write({ header: 'dark', footer: null })
    expect(listener).toHaveBeenCalledTimes(1)
    store.write({ header: 'dark', footer: null })
    expect(listener).toHaveBeenCalledTimes(1)
    store.write(CHROME_THEME_SITE)
    expect(listener).toHaveBeenCalledTimes(2)
  })
})

describe('useChromeBarTheme', () => {
  it('re-renders a bar for its own value only', () => {
    let store: ChromeThemeStore | null = null
    const Capture = () => {
      store = useChromeThemeStore()
      return null
    }
    const headerRenders = vi.fn()
    const footerRenders = vi.fn()
    const Header = () => {
      headerRenders()
      return <output data-testid="header">{String(useChromeBarTheme('header'))}</output>
    }
    const Footer = () => {
      footerRenders()
      return <output data-testid="footer">{String(useChromeBarTheme('footer'))}</output>
    }
    const { getByTestId } = render(
      <ChromeThemeProvider>
        <Capture />
        <Header />
        <Footer />
      </ChromeThemeProvider>,
    )
    expect(headerRenders).toHaveBeenCalledTimes(1)
    expect(footerRenders).toHaveBeenCalledTimes(1)

    act(() => store?.write({ header: 'dark', footer: null }))
    expect(getByTestId('header').textContent).toBe('dark')
    expect(getByTestId('footer').textContent).toBe('null')
    expect(headerRenders).toHaveBeenCalledTimes(2)
    expect(footerRenders).toHaveBeenCalledTimes(1)

    act(() => store?.write({ header: 'dark', footer: 'dark' }))
    expect(getByTestId('footer').textContent).toBe('dark')
    expect(headerRenders).toHaveBeenCalledTimes(2)
    expect(footerRenders).toHaveBeenCalledTimes(2)
  })

  it('shares one fallback store outside a provider', () => {
    const stores: ChromeThemeStore[] = []
    const Capture = () => {
      stores.push(useChromeThemeStore())
      return null
    }
    render(
      <>
        <Capture />
        <Capture />
      </>,
    )
    expect(stores).toHaveLength(2)
    expect(stores[0]).toBe(stores[1])
  })
})
