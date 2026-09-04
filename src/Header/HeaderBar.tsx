'use client'

import type React from 'react'
import { useChromeBarTheme } from '@/providers/ChromeTheme'
import { cn } from '@/utilities/ui'

/**
 * The fixed header bar shell: the one element that follows the hero band's
 * palette. Subscribes to its own chrome value so a pin flip re-renders this
 * shell alone; the bar's contents and the takeover menu (siblings owned by
 * `HeaderClient`) never re-render on scroll.
 *
 * Solid like the footer. Transparent over a hero band (its media runs under
 * the bar) and under the open takeover overlay, so that surface reads
 * through; the palette swap and the plate fade share one transition, so
 * leaving the band is a single settle. The pin stands aside while the
 * overlay is up, since the bar then reads against the overlay's site-theme
 * surface, not the page under it.
 */
export const HeaderBar: React.FC<{ menuOpen: boolean; children: React.ReactNode }> = ({
  menuOpen,
  children,
}) => {
  const heroTheme = useChromeBarTheme('header')
  const pinned = menuOpen ? null : heroTheme
  return (
    <header
      data-site-header
      data-theme={pinned ?? undefined}
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-(--header-bar-height) text-foreground transition-[height,background-color,color] duration-300 motion-reduce:transition-none',
        menuOpen || pinned ? 'bg-transparent' : 'bg-background',
      )}
      // Pull the header out of the page snapshot so it stays static during transitions.
      style={{ viewTransitionName: 'site-header' }}
    >
      {children}
    </header>
  )
}
