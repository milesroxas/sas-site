'use client'

import { usePathname } from 'next/navigation'
import type React from 'react'
import { cn } from '@/utilities/ui'

/**
 * Gates the fixed site chrome (header + footer bars) and the page-frame
 * offsets that make room for it. Demo playground routes bring their own app
 * shell (demo-kit DemoShell) which re-homes the chrome's content into its
 * sidebar, so here the bars unmount and the frame goes full-viewport.
 */
export function SiteChrome({
  chrome,
  children,
}: {
  chrome: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDemo = pathname === '/demo' || pathname.startsWith('/demo/')

  return (
    <>
      {isDemo ? null : chrome}
      {/* data-page-frame: the takeover menu (Header/Menu) crops this wrapper
          into a 16:9 preview window. Header/footer stay outside so they
          remain viewport-fixed chrome. */}
      {/* 'chromeless' opts the frame out of chrome-relative CSS (the admin-bar
          footer padding in globals.css) while presence selectors still match. */}
      <div
        data-page-frame={isDemo ? 'chromeless' : true}
        className={cn(
          'flex min-h-svh flex-col bg-background',
          !isDemo && 'pt-(--header-height) pb-(--footer-height)',
        )}
      >
        {children}
      </div>
    </>
  )
}
