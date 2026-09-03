'use client'

import type React from 'react'
import { useChromeTheme } from '@/providers/ChromeTheme'
import { cn } from '@/utilities/ui'

/**
 * The fixed footer bar. Viewport-fixed like the header (mounted outside
 * [data-page-frame] so menu transforms never steal its containing block);
 * hidden while the takeover menu is open. Bar is full-bleed; items sit in the
 * page column.
 *
 * A hero band under the bar pins it to the band's palette (HeroBand) and
 * lifts the plate so the band's media runs under it; the palette swap and the
 * plate fade share one transition, so leaving the band is a single settle.
 * Children inherit `color` from here rather than restating `text-foreground`,
 * or they would snap to the new palette while the bar is still fading.
 */
export const FooterBar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const heroTheme = useChromeTheme().chromeTheme.footer
  return (
    <footer
      data-site-footer
      data-theme={heroTheme ?? undefined}
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 h-(--footer-bar-height) text-foreground transition-[height,background-color,color] duration-300 motion-reduce:transition-none',
        heroTheme ? 'bg-transparent' : 'bg-background',
      )}
      // Keep the footer static during page transitions.
      style={{ viewTransitionName: 'site-footer' }}
    >
      {children}
    </footer>
  )
}
