import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ThemeToggle } from './ThemeToggle'

const { useThemeMock } = vi.hoisted(() => ({ useThemeMock: vi.fn() }))

vi.mock('@/providers/Theme', () => ({
  useTheme: useThemeMock,
}))

vi.mock('@tabler/icons-react', () => ({
  IconSun: (props: Record<string, unknown>) => <svg data-testid="icon-sun" {...props} />,
  IconMoon: (props: Record<string, unknown>) => <svg data-testid="icon-moon" {...props} />,
}))

describe('ThemeToggle', () => {
  afterEach(() => {
    cleanup()
    useThemeMock.mockReset()
  })

  it('renders the moon icon and a "switch to dark" label when the resolved theme is light', () => {
    useThemeMock.mockReturnValue({ theme: 'light', setTheme: vi.fn() })
    render(<ThemeToggle />)

    expect(screen.queryByTestId('icon-moon')).not.toBeNull()
    expect(screen.queryByTestId('icon-sun')).toBeNull()
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Switch to dark theme')
  })

  it('renders the sun icon and a "switch to light" label when the resolved theme is dark', () => {
    useThemeMock.mockReturnValue({ theme: 'dark', setTheme: vi.fn() })
    render(<ThemeToggle />)

    expect(screen.queryByTestId('icon-sun')).not.toBeNull()
    expect(screen.queryByTestId('icon-moon')).toBeNull()
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Switch to light theme')
  })

  it('treats an undefined theme as "not dark" and falls back to the moon icon', () => {
    useThemeMock.mockReturnValue({ theme: undefined, setTheme: vi.fn() })
    render(<ThemeToggle />)

    expect(screen.queryByTestId('icon-moon')).not.toBeNull()
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Switch to dark theme')
  })

  it('calls setTheme with the opposite theme when clicked from dark', () => {
    const setTheme = vi.fn()
    useThemeMock.mockReturnValue({ theme: 'dark', setTheme })
    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button'))

    expect(setTheme).toHaveBeenCalledTimes(1)
    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('calls setTheme with the opposite theme when clicked from light', () => {
    const setTheme = vi.fn()
    useThemeMock.mockReturnValue({ theme: 'light', setTheme })
    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button'))

    expect(setTheme).toHaveBeenCalledTimes(1)
    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('merges a custom className with the default button classes', () => {
    useThemeMock.mockReturnValue({ theme: 'light', setTheme: vi.fn() })
    render(<ThemeToggle className="text-secondary-foreground" />)

    const button = screen.getByRole('button')
    expect(button.className).toContain('transition-opacity')
    expect(button.className).toContain('text-secondary-foreground')
  })

  it('is a plain, non-submitting button', () => {
    useThemeMock.mockReturnValue({ theme: 'light', setTheme: vi.fn() })
    render(<ThemeToggle />)

    expect(screen.getByRole('button').getAttribute('type')).toBe('button')
  })

  it('renders the mount-gated (moon / "switch to dark") markup on the server, regardless of theme', () => {
    // Effects never run during a static server render, so `mounted` stays
    // false — this is exactly the hydration-safe output the component must
    // produce, even if the resolved theme is already "dark".
    useThemeMock.mockReturnValue({ theme: 'dark', setTheme: vi.fn() })
    const html = renderToStaticMarkup(<ThemeToggle />)

    expect(html).toContain('data-testid="icon-moon"')
    expect(html).not.toContain('data-testid="icon-sun"')
    expect(html).toContain('Switch to dark theme')
  })
})