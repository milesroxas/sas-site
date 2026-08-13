'use client'
import { IconMenu2, IconX } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import type { Header } from '@/payload-types'
import { Container } from '@/components/Container'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition'
import { cn } from '@/utilities/ui'
import { TakeoverMenu } from './Menu'
import { ThemeToggle } from './ThemeToggle'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
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
          // overlay so its secondary surface reads through.
          menuOpen ? 'bg-transparent text-secondary-foreground' : 'bg-background text-foreground',
        )}
        // Pull the header out of the page snapshot so it stays static during transitions.
        style={{ viewTransitionName: 'site-header' }}
      >
        {/* Mobile: centered brand + menu icon on the right.
            md+: 3-col grid with MENU text centered and theme on the end. */}
        <Container className="relative flex h-full items-center justify-end md:grid md:grid-cols-[1fr_auto_1fr]">
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
            // -mr compensates the trailing letter-space so the desktop label reads centered.
            className="transition-opacity hover:opacity-70 md:mr-[-0.58em] md:text-sm md:font-black md:tracking-[0.58em]"
          >
            <span className="md:hidden">
              {menuOpen ? <IconX className="size-6" /> : <IconMenu2 className="size-6" />}
            </span>
            <span className="hidden md:inline">{menuOpen ? 'CLOSE' : 'MENU'}</span>
          </button>

          <ThemeToggle className="hidden justify-self-end md:inline-flex" />
        </Container>
      </header>

      <TakeoverMenu
        data={data}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuButtonRef={menuButtonRef}
      />
    </>
  )
}
