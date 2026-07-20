'use client'
import { IconMoon, IconSun } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import type { Header } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useTheme } from '@/providers/Theme'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition'
import { cn } from '@/utilities/ui'
import { TakeoverMenu } from './Menu'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const { theme: siteTheme, setTheme: setSiteTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  /* Theme resolves client-side from the DOM, so gate the toggle icon on mount
     to keep server and hydration renders identical. */
  const [mounted, setMounted] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
  }, [setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  // Close the takeover menu whenever a navigation lands.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the re-run trigger, not a value the effect reads
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Hero pages set headerTheme="dark" and want a transparent header over
  // their media until the page scrolls; the open menu overlay always wins.
  const overHero = theme === 'dark' && !scrolled

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 h-(--header-height) transition-colors duration-300',
          menuOpen
            ? 'bg-transparent text-secondary-foreground'
            : overHero
              ? // Scoped data-theme="dark" (set below) resolves foreground to its
                // dark value over hero media, so tokens follow the theme system.
                'bg-transparent text-foreground'
              : 'bg-background/85 text-foreground backdrop-blur-md',
        )}
        // Pull the header out of the page snapshot so it stays static during transitions.
        style={{ viewTransitionName: 'site-header' }}
        {...(theme && !menuOpen ? { 'data-theme': theme } : {})}
      >
        <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center px-6 md:px-20">
          <Link
            href="/"
            transitionTypes={[...lateralNavTransitionTypes]}
            className="justify-self-start whitespace-nowrap text-base/[1.625rem] font-medium tracking-[0.19em] md:text-[1.3125rem]"
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
            className="-mr-[0.58em] text-sm font-black tracking-[0.58em] transition-opacity hover:opacity-70"
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
