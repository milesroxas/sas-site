'use client'
import { IconMoon, IconSun } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import type { Header } from '@/payload-types'
import { useTheme } from '@/providers/Theme'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition'
import { cn } from '@/utilities/ui'
import { TakeoverMenu } from './Menu'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const { theme: siteTheme, setTheme: setSiteTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  /* Theme resolves client-side from the DOM, so gate the toggle icon on mount
     to keep server and hydration renders identical. */
  const [mounted, setMounted] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  // Close the takeover menu whenever a navigation lands.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the re-run trigger, not a value the effect reads
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    setMounted(true)
  }, [])

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
        {/* Mobile: flex keeps brand/MENU/toggle from colliding — the brand is
            wider than a 1fr column on phone widths. md+: original 3-col grid
            with a truly centered MENU. */}
        <div className="flex h-full items-center justify-between gap-3 px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:px-20">
          <Link
            href="/"
            transitionTypes={[...lateralNavTransitionTypes]}
            className="justify-self-start whitespace-nowrap text-xs font-medium tracking-widest md:text-base md:tracking-[0.19em]"
          >
            SUITS &amp; SANDALS
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((v) => !v)}
            // -mr compensates the trailing letter-space so the label reads centered.
            className="mr-[-0.58em] text-sm font-black tracking-[0.58em] transition-opacity hover:opacity-70"
          >
            {menuOpen ? 'CLOSE' : 'MENU'}
          </button>

          <button
            type="button"
            aria-label={
              mounted && siteTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
            }
            onClick={() => setSiteTheme(siteTheme === 'dark' ? 'light' : 'dark')}
            className="justify-self-end transition-opacity hover:opacity-70"
          >
            {mounted && siteTheme === 'dark' ? (
              <IconSun className="size-6" />
            ) : (
              <IconMoon className="size-6" />
            )}
          </button>
        </div>
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
