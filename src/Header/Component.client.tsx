'use client'
import { IconMenu2, IconX } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Container } from '@/components/Container'
import type { Header } from '@/payload-types'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition'
import { cn } from '@/utilities/ui'
import type { MenuContent } from './getMenuContent'
import { TakeoverMenu } from './Menu'
import { ThemeToggle } from './ThemeToggle'

interface HeaderClientProps {
  data: Header
  menuContent: MenuContent
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, menuContent }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  // Close the takeover menu whenever a navigation lands.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the re-run trigger, not a value the effect reads
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Past a small scroll threshold both fixed bars shrink (globals.css keys
  // --header-bar-height/--footer-bar-height off this attribute) so more of
  // the page shows.
  useEffect(() => {
    const onScroll = () =>
      document.documentElement.toggleAttribute('data-scrolled', window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 h-(--header-bar-height) transition-[height,background-color,color] duration-300 motion-reduce:transition-none',
          // Solid like the footer; transparent only under the open takeover
          // overlay so its background surface reads through.
          menuOpen ? 'bg-transparent text-foreground' : 'bg-background text-foreground',
        )}
        // Pull the header out of the page snapshot so it stays static during transitions.
        style={{ viewTransitionName: 'site-header' }}
      >
        {/* Mobile: centered brand + menu icon on the right.
            md+: 3-col grid with MENU text centered and theme on the end.
            The band narrows toward the takeover layout while the menu is open. */}
        <Container className="h-full">
          <div
            className={cn(
              'relative mx-auto flex h-full items-center justify-end transition-[max-width] duration-300 motion-reduce:transition-none md:grid md:grid-cols-[1fr_auto_1fr]',
              menuOpen ? 'max-w-[47rem]' : 'max-w-full',
            )}
          >
            <Link
              href="/"
              transitionTypes={[...lateralNavTransitionTypes]}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-base font-medium tracking-[0.19em] md:static md:translate-x-0 md:justify-self-start"
            >
              SUITS &amp; SANDALS
            </Link>

            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
              // Open state wraps the label in a secondary capsule (the
              // redesigned menu's CLOSE pill) without changing the button element.
              className={cn(
                'pressable rounded-full outline-none hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background md:text-sm md:font-black md:tracking-[0.58em]',
                menuOpen &&
                  'md:h-8 md:bg-secondary md:px-6 md:text-secondary-foreground md:focus-visible:ring-offset-0',
              )}
            >
              <span className="md:hidden">
                {menuOpen ? <IconX className="size-6" /> : <IconMenu2 className="size-6" />}
              </span>
              {/* -mr compensates the trailing letter-space so the label — and the
                  focus ring around the button box — reads centered. */}
              <span className="hidden md:mr-[-0.58em] md:inline">
                {menuOpen ? 'CLOSE' : 'MENU'}
              </span>
            </button>

            <ThemeToggle className="hidden justify-self-end md:inline-flex" />
          </div>
        </Container>
      </header>

      <TakeoverMenu
        data={data}
        menuContent={menuContent}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuButtonRef={menuButtonRef}
      />
    </>
  )
}
