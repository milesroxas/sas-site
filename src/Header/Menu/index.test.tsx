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

// Stub MenuAsk with the same structural contract: chat-view state lives
// inside, changes are reported via onViewChange, and the exit action is
// handed to the menu through exitChatViewRef.
vi.mock('@/features/ask/MenuAsk', async () => {
  const { useEffect, useState } = await import('react')
  const MenuAsk = ({
    open,
    onViewChange,
    exitChatViewRef,
  }: {
    open: boolean
    onViewChange?: (chatView: boolean) => void
    exitChatViewRef?: React.RefObject<(() => void) | null>
  }) => {
    const [chatView, setChatView] = useState(false)
    useEffect(() => {
      onViewChange?.(chatView)
    }, [chatView, onViewChange])
    useEffect(() => {
      if (!exitChatViewRef) return
      exitChatViewRef.current = () => setChatView(false)
      return () => {
        exitChatViewRef.current = null
      }
    })
    return (
      <>
        <div data-menu-preview-slot data-open={open} data-chat-view={chatView} />
        <form data-menu-item>
          <input placeholder="Ask anything…" />
          <button type="button" onClick={() => setChatView(true)}>
            show transcript
          </button>
        </form>
      </>
    )
  }
  return { MenuAsk }
})

const routerPush = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: routerPush }),
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
  cta: { label: 'Get in touch', link: { type: 'custom', url: '/contact', newTab: false } },
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

  it('renders nav items and a mobile-only theme toggle', () => {
    renderMenu()

    expect(screen.getByRole('link', { name: 'About' }).getAttribute('href')).toBe('/about')
    expect(screen.getByRole('link', { name: 'Contact' }).getAttribute('href')).toBe('/contact')
    expect(screen.queryByRole('link', { name: /Search/ })).toBeNull()

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

  it('never closes the menu on structural backdrop clicks (overlay and nav container)', () => {
    const { onClose, container } = renderMenu()

    const overlay = container.querySelector('#site-menu') as HTMLElement
    expect(overlay).not.toBeNull()
    fireEvent.click(overlay)
    fireEvent.click(screen.getByRole('navigation', { name: 'Site menu' }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('steps back from the chat view on backdrop click, and later clicks stay inert', () => {
    const { onClose, container } = renderMenu()
    const overlay = container.querySelector('#site-menu') as HTMLElement
    const slot = () => container.querySelector('[data-menu-preview-slot]') as HTMLElement

    fireEvent.click(screen.getByRole('button', { name: 'show transcript' }))
    expect(slot().getAttribute('data-chat-view')).toBe('true')

    // First backdrop click dismisses only the transcript.
    fireEvent.click(overlay)
    expect(onClose).not.toHaveBeenCalled()
    expect(slot().getAttribute('data-chat-view')).toBe('false')

    // Further backdrop clicks do nothing — the menu never closes this way.
    fireEvent.click(overlay)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('steps back from the chat view on Escape instead of closing the menu', () => {
    const { onClose, container } = renderMenu()
    const slot = () => container.querySelector('[data-menu-preview-slot]') as HTMLElement

    fireEvent.click(screen.getByRole('button', { name: 'show transcript' }))
    expect(slot().getAttribute('data-chat-view')).toBe('true')

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
    expect(slot().getAttribute('data-chat-view')).toBe('false')

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
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

  it('falls back to the plain close when a link has media but the handoff preconditions fail', () => {
    // jsdom rects are all zero, so the preview slot is unmeasurable — the
    // click must take the ordinary close path (Link navigates, menu undocks)
    // instead of starting a hero handoff.
    const withMedia: MenuContent = {
      ...mockMenuContent,
      expertise: [
        {
          title: 'Clarifying Complex Stories',
          href: '/expertise/clarifying-complex-stories',
          media: { url: '/media/hero.jpg', mime: 'image/jpeg' },
        },
      ],
    }
    const onClose = vi.fn()
    render(
      <TakeoverMenu
        data={mockHeaderData}
        menuContent={withMedia}
        open
        onClose={onClose}
        menuButtonRef={{ current: null }}
      />,
    )

    fireEvent.click(screen.getByRole('link', { name: 'Clarifying Complex Stories' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(routerPush).not.toHaveBeenCalled()
    expect(document.querySelector('[data-menu-hero-traveler]')).toBeNull()
  })
})
