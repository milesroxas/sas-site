import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Header } from '@/payload-types'
import { HeaderClient } from './Component.client'

const { usePathnameMock } = vi.hoisted(() => ({ usePathnameMock: vi.fn() }))

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    transitionTypes,
    ...rest
  }: {
    href: string
    children?: React.ReactNode
    transitionTypes?: readonly string[]
  } & Record<string, unknown>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('./Menu', () => ({
  TakeoverMenu: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="takeover-menu" data-open={open}>
      <button type="button" onClick={onClose}>
        mock-close
      </button>
    </div>
  ),
}))

vi.mock('./ThemeToggle', () => ({
  ThemeToggle: ({ className }: { className?: string }) => (
    <button type="button" data-testid="theme-toggle" className={className}>
      theme
    </button>
  ),
}))

const mockHeaderData: Header = { id: 1, navItems: [] }

describe('HeaderClient', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/')
  })

  afterEach(() => {
    cleanup()
    usePathnameMock.mockReset()
  })

  it('renders the brand link and a closed menu button by default', () => {
    render(<HeaderClient data={mockHeaderData} />)

    const brandLink = screen.getByRole('link', { name: 'SUITS & SANDALS' })
    expect(brandLink.getAttribute('href')).toBe('/')

    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    expect(menuButton.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByTestId('takeover-menu').getAttribute('data-open')).toBe('false')
  })

  it('renders the ThemeToggle hidden on mobile and inline-flex from md up', () => {
    render(<HeaderClient data={mockHeaderData} />)

    const toggle = screen.getByTestId('theme-toggle')
    expect(toggle.className).toContain('hidden')
    expect(toggle.className).toContain('justify-self-end')
    expect(toggle.className).toContain('md:inline-flex')
  })

  it('toggles the menu label, aria-expanded, and the takeover menu open state', () => {
    render(<HeaderClient data={mockHeaderData} />)
    const menuButton = screen.getByRole('button', { name: 'Open menu' })

    fireEvent.click(menuButton)

    expect(screen.getByRole('button', { name: 'Close menu' })).not.toBeNull()
    expect(menuButton.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByTestId('takeover-menu').getAttribute('data-open')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }))

    expect(screen.getByRole('button', { name: 'Open menu' })).not.toBeNull()
    expect(screen.getByTestId('takeover-menu').getAttribute('data-open')).toBe('false')
  })

  it('closes the menu when the takeover menu invokes its onClose callback', () => {
    render(<HeaderClient data={mockHeaderData} />)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByTestId('takeover-menu').getAttribute('data-open')).toBe('true')

    fireEvent.click(screen.getByText('mock-close'))

    expect(screen.getByRole('button', { name: 'Open menu' })).not.toBeNull()
    expect(screen.getByTestId('takeover-menu').getAttribute('data-open')).toBe('false')
  })
})
