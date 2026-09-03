'use client'
import { IconMenu2, IconX } from '@tabler/icons-react'
import Link from 'next/link'
import type React from 'react'
import { useEffect } from 'react'
import { Container } from '@/components/Container'
import type { Header } from '@/payload-types'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition'
import { cn } from '@/utilities/ui'
import type { MenuContent } from './getMenuContent'
import { TakeoverMenu } from './Menu'
import { useTakeoverMenuState } from './Menu/useTakeoverMenuState'
import { ThemeToggle } from './ThemeToggle'

/** Phone menu glyphs: stacked in one grid cell, swapped by opacity + a quarter turn. */
const HEADER_ICON =
  'col-start-1 row-start-1 size-6 transition-[opacity,rotate] duration-200 ease-out motion-reduce:transition-none'

interface HeaderClientProps {
  data: Header
  menuContent: MenuContent
  /** Site Info › Ask › Hide Ask: the takeover menu renders without the composer. */
  askHidden?: boolean
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, menuContent, askHidden }) => {
  const { menuOpen, setMenuOpen, menuButtonRef } = useTakeoverMenuState()

  // Past a small scroll threshold both fixed bars shrink (globals.css keys
  // --header-bar-height/--footer-bar-height off this attribute) so more of
  // the page shows.
  //
  // Frozen while the takeover menu holds the page frame: docking sets the
  // frame fixed and locks html overflow, so the document collapses and
  // scrollY snaps to 0 on the next frame. Reading that as "back at the top"
  // grew the bar mid-dock (3rem to 4rem) and moved the preview slot the
  // timeline had just measured, so the window landed 1rem above it. The
  // frame's `inert` spans the whole open, dock through undock; `restoreFrame`
  // drops it before restoring the scroll offset, so the next scroll event
  // re-syncs with the real position.
  useEffect(() => {
    const onScroll = () => {
      if (document.querySelector('[data-page-frame][inert]')) return
      document.documentElement.toggleAttribute('data-scrolled', window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      // SiteChrome unmounts the header on demo routes with no other writer for
      // this attribute; clear it so --header-bar-height consumers there (the
      // demo shell's site-menu band) don't inherit the shrunk scrolled value.
      document.documentElement.removeAttribute('data-scrolled')
    }
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
        {/* One 3-col grid at every width; cells are placed per breakpoint.
            Phone: menu / close on the left, brand centered, theme toggle on
            the right (only while the menu is open, in the spot the close
            control used to hold). md+: brand left, MENU centered, theme toggle
            always on the end. The band narrows toward the takeover layout
            while the menu is open. */}
        <Container className="h-full">
          <div
            className={cn(
              'relative mx-auto grid h-full grid-cols-[1fr_auto_1fr] items-center transition-[max-width] duration-300 motion-reduce:transition-none',
              menuOpen ? 'max-w-[47rem]' : 'max-w-full',
            )}
          >
            <Link
              href="/"
              transitionTypes={[...lateralNavTransitionTypes]}
              className="col-start-2 row-start-1 justify-self-center whitespace-nowrap text-base font-medium tracking-[0.19em] md:col-start-1 md:justify-self-start"
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
              // demo-kit's ShellSiteMenu portal renders a standalone echo of this
              // pill recipe: restyle both together.
              className={cn(
                'pressable col-start-1 row-start-1 justify-self-start rounded-full outline-none hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background md:col-start-2 md:justify-self-center md:text-sm md:font-black md:tracking-[0.58em]',
                menuOpen &&
                  'md:h-8 md:bg-secondary md:px-6 md:text-secondary-foreground md:focus-visible:ring-offset-0',
              )}
            >
              {/* Phone: both glyphs share one cell and cross-fade with a quarter
                  turn, so a toggle mid-flight retargets from wherever the swap
                  is instead of cutting (a conditional render would). */}
              <span aria-hidden className="grid size-6 place-items-center md:hidden">
                <IconMenu2
                  className={cn(HEADER_ICON, menuOpen && 'motion-safe:-rotate-90 opacity-0')}
                />
                <IconX
                  className={cn(HEADER_ICON, !menuOpen && 'motion-safe:rotate-90 opacity-0')}
                />
              </span>
              {/* -mr compensates the trailing letter-space so the label (and the
                  focus ring around the button box) reads centered. */}
              <span className="hidden md:mr-[-0.58em] md:inline">
                {menuOpen ? 'CLOSE' : 'MENU'}
              </span>
            </button>

            {/* Phone: the toggle takes the close control's old corner while the
                menu is open, rising in on the overlay's beat and leaving
                first on close (visibility flips at the fade's end). */}
            <span
              className={cn(
                'col-start-3 row-start-1 justify-self-end transition-[opacity,translate,visibility] duration-300 ease-out motion-reduce:transition-none',
                !menuOpen && 'max-md:invisible max-md:opacity-0 max-md:motion-safe:translate-y-1',
              )}
            >
              <ThemeToggle />
            </span>
          </div>
        </Container>
      </header>

      <TakeoverMenu
        data={data}
        menuContent={menuContent}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuButtonRef={menuButtonRef}
        askHidden={askHidden}
      />
    </>
  )
}
