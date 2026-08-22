import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Header as HeaderType } from '@/payload-types'
import type { MenuContent } from '../getMenuContent'
import { TakeoverMenu } from './index'

// The takeover's open/close animation is driven entirely by GSAP against a
// `[data-page-frame]` element that doesn't exist in this test DOM, so the
// real animation code always bails out early (see `if (!overlay || !frame)
// return` in index.tsx). Stubbing these out keeps the tests focused on the
// click-handling/markup behavior instead of GSAP internals.
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

// MenuAsk imports React's canary-only `ViewTransition` (aliased by Next at
// build time, absent from the stable react vitest resolves) — stub it with the
// same structural contract: the preview slot plus a composer input.
vi.mock('@/features/ask/MenuAsk', () => ({
  MenuAsk: ({ open }: { open: boolean }) => (
    <>
      <div data-menu-preview-slot data-open={open} />
      <form data-menu-item>
        <input placeholder="Ask anything…" />
      </form>
    </>
  ),
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

const mockMenuContent: MenuContent = {
  expertise: [
    {
      title: 'Clarifying Complex Stories',
      href: '/expertise/clarifying-complex-stories',
      media: null,
    },
  ],
  audiences: [
    { title: 'Healthtech & Life Sciences', href: '/who-we-help/healthtech', media: null },
  ],
  works: [
    { title: 'Trialbee Hive', href: '/works/trialbee-hive', eyebrow: 'Healthcare', media: null },
  ],
  pageMedia: {},
}

function renderMenu(open = true) {
  const onClose = vi.fn()
  const menuButtonRef: React.RefObject<HTMLButtonElement | null> = { current: null }
  const utils = render(
    <TakeoverMenu
      data={mockHeaderData}
      menuContent={mockMenuContent}
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

  it('renders nav items, a trailing Search link, and a mobile-only theme toggle', () => {
    renderMenu()

    expect(screen.getByRole('link', { name: 'About' }).getAttribute('href')).toBe('/about')
    expect(screen.getByRole('link', { name: 'Contact' }).getAttribute('href')).toBe('/contact')
    expect(screen.getByRole('link', { name: /Search/ }).getAttribute('href')).toBe('/search')

    const themeToggleButton = screen.getByRole('button', {
      name: /switch to (dark|light) theme/i,
    })
    // The toggle lives in the trailing utility row, hidden from md up.
    const themeToggleItem = themeToggleButton.closest('[data-menu-item]')
    expect(themeToggleItem).not.toBeNull()
    expect(themeToggleItem?.className).toContain('md:hidden')
  })

  it('renders the editorial columns from menuContent and the contact CTA', () => {
    renderMenu()

    expect(
      screen.getByRole('link', { name: 'Clarifying Complex Stories' }).getAttribute('href'),
    ).toBe('/expertise/clarifying-complex-stories')
    expect(
      screen.getByRole('link', { name: 'Healthtech & Life Sciences' }).getAttribute('href'),
    ).toBe('/who-we-help/healthtech')

    const workLink = screen.getByRole('link', { name: /Trialbee Hive/ })
    expect(workLink.getAttribute('href')).toBe('/works/trialbee-hive')
    expect(workLink.textContent).toContain('Healthcare')

    expect(screen.getByRole('link', { name: /Get in touch/i }).getAttribute('href')).toBe(
      '/contact',
    )
  })

  it('closes when structural backdrop space is clicked (overlay and nav container)', () => {
    const { onClose, container } = renderMenu()

    const overlay = container.querySelector('#site-menu') as HTMLElement
    expect(overlay).not.toBeNull()
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('navigation', { name: 'Site menu' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('does not close when the mobile theme toggle inside the menu is clicked', () => {
    const { onClose } = renderMenu()

    fireEvent.click(screen.getByRole('button', { name: /switch to (dark|light) theme/i }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not close when the Ask composer is clicked', () => {
    const { onClose } = renderMenu()

    fireEvent.click(screen.getByPlaceholderText('Ask anything…'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes when a nav item link is clicked, via onClickCapture', () => {
    const { onClose } = renderMenu()

    fireEvent.click(screen.getByRole('link', { name: 'About' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes when an editorial column link is clicked', () => {
    const { onClose } = renderMenu()

    fireEvent.click(screen.getByRole('link', { name: 'Clarifying Complex Stories' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('still closes when the Search link is clicked', () => {
    const { onClose } = renderMenu()

    fireEvent.click(screen.getByRole('link', { name: /Search/ }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
