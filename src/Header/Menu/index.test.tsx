import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Header as HeaderType } from '@/payload-types'
import { TakeoverMenu } from './index'

// The takeover's open/close animation is driven entirely by GSAP against a
// `[data-page-frame]` element that doesn't exist in this test DOM, so the
// real animation code always bails out early (see `if (!overlay || !frame)
// return` in index.tsx). Stubbing these out keeps the tests focused on the
// click-handling/markup behavior added in this PR instead of GSAP internals.
vi.mock('@gsap/react', () => ({
  useGSAP: () => {},
}))

vi.mock('gsap', () => {
  const gsapStub = {
    registerPlugin: vi.fn(),
    matchMedia: vi.fn(() => ({ add: vi.fn() })),
    utils: { toArray: vi.fn(() => []) },
    timeline: vi.fn(),
    set: vi.fn(),
    to: vi.fn(),
    fromTo: vi.fn(),
  }
  return { default: gsapStub, ...gsapStub }
})

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

const mockHeaderData: HeaderType = {
  id: 1,
  navItems: [
    {
      id: 'nav-1',
      link: { type: 'custom', label: 'About', url: '/about', newTab: false },
    },
    {
      id: 'nav-2',
      link: { type: 'custom', label: 'Contact', url: '/contact', newTab: false },
    },
  ],
}

function renderMenu(open = true) {
  const onClose = vi.fn()
  const menuButtonRef: React.RefObject<HTMLButtonElement | null> = { current: null }
  const utils = render(
    <TakeoverMenu
      data={mockHeaderData}
      open={open}
      onClose={onClose}
      menuButtonRef={menuButtonRef}
    />,
  )
  return { onClose, ...utils }
}

describe('TakeoverMenu', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders each nav item, a trailing Search link, and a mobile-only theme toggle', () => {
    renderMenu()

    expect(screen.getByRole('link', { name: 'About' }).getAttribute('href')).toBe('/about')
    expect(screen.getByRole('link', { name: 'Contact' }).getAttribute('href')).toBe('/contact')
    expect(screen.getByRole('link', { name: /Search/ }).getAttribute('href')).toBe('/search')

    const themeToggleButton = screen.getByRole('button', {
      name: /switch to (dark|light) theme/i,
    })
    const themeToggleItem = themeToggleButton.closest('li')
    expect(themeToggleItem).not.toBeNull()
    expect(themeToggleItem?.className).toContain('md:hidden')
  })

  it('closes the menu when the backdrop overlay itself is clicked', () => {
    const { onClose, container } = renderMenu()

    const overlay = container.querySelector('#site-menu') as HTMLElement
    expect(overlay).not.toBeNull()

    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when clicking inside the nav, since the click is stopped from bubbling to the overlay', () => {
    const { onClose } = renderMenu()

    fireEvent.click(screen.getByRole('navigation', { name: 'Site menu' }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not close when the mobile theme toggle inside the menu is clicked', () => {
    const { onClose } = renderMenu()

    fireEvent.click(screen.getByRole('button', { name: /switch to (dark|light) theme/i }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('still closes when a nav item link is clicked, since onClickCapture fires ahead of the nav stopPropagation', () => {
    const { onClose } = renderMenu()

    fireEvent.click(screen.getByRole('link', { name: 'About' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('still closes when the Search link is clicked', () => {
    const { onClose } = renderMenu()

    fireEvent.click(screen.getByRole('link', { name: /Search/ }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})