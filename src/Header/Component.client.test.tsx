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

const mockHeaderData: Header = {
  id: 1,
  navItems: [],
  cta: { label: 'Get in touch', link: { type: 'custom', url: '/contact', newTab: false } },
}
const mockMenuContent = { expertise: [], audiences: [], works: [], pageMedia: {} }

describe('HeaderClient', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/')
  })

  afterEach(() => {
    cleanup()
    usePathnameMock.mockReset()
  })

  it('renders the brand link and a closed menu button by default', () => {
    render(<HeaderClient data={mockHeaderData} menuContent={mockMenuContent} />)

    const brandLink = screen.getByRole('link', { name: 'SUITS & SANDALS' })
    expect(brandLink.getAttribute('href')).toBe('/')

    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    expect(menuButton.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByTestId('takeover-menu').getAttribute('data-open')).toBe('false')
  })

  it('keeps the ThemeToggle in the trailing cell, hidden on mobile until the menu opens', () => {
    render(<HeaderClient data={mockHeaderData} menuContent={mockMenuContent} />)

    const cell = screen.getByTestId('theme-toggle').parentElement as HTMLElement
    expect(cell.className).toContain('col-start-3')
    expect(cell.className).toContain('justify-self-end')
    expect(cell.className).toContain('max-md:invisible')

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(cell.className).not.toContain('max-md:invisible')
  })

  it('places the menu button in the leading cell on mobile and centers it from md up', () => {
    render(<HeaderClient data={mockHeaderData} menuContent={mockMenuContent} />)

    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    expect(menuButton.className).toContain('col-start-1')
    expect(menuButton.className).toContain('md:col-start-2')
  })

  it('does not toggle data-scrolled while the page frame is frozen by the menu', () => {
    const frame = document.createElement('div')
    frame.setAttribute('data-page-frame', '')
    document.body.appendChild(frame)
    try {
      render(<HeaderClient data={mockHeaderData} menuContent={mockMenuContent} />)
      Object.defineProperty(window, 'scrollY', { value: 900, configurable: true })
      fireEvent.scroll(window)
      expect(document.documentElement.hasAttribute('data-scrolled')).toBe(true)

      // Docked: the frame is inert and the collapsed document reads scrollY 0.
      frame.setAttribute('inert', '')
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
      fireEvent.scroll(window)
      expect(document.documentElement.hasAttribute('data-scrolled')).toBe(true)

      // Undocked and restored: the next scroll event re-syncs.
      frame.removeAttribute('inert')
      fireEvent.scroll(window)
      expect(document.documentElement.hasAttribute('data-scrolled')).toBe(false)
    } finally {
      frame.remove()
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    }
  })

  it('toggles the menu label, aria-expanded, and the takeover menu open state', () => {
    render(<HeaderClient data={mockHeaderData} menuContent={mockMenuContent} />)
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
    render(<HeaderClient data={mockHeaderData} menuContent={mockMenuContent} />)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByTestId('takeover-menu').getAttribute('data-open')).toBe('true')

    fireEvent.click(screen.getByText('mock-close'))

    expect(screen.getByRole('button', { name: 'Open menu' })).not.toBeNull()
    expect(screen.getByTestId('takeover-menu').getAttribute('data-open')).toBe('false')
  })
})
