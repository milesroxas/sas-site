'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo/Logo'

import type { Header } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const _pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
  }, [setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  return (
    <header
      className="container relative z-20"
      // Pull the header out of the page snapshot so it stays static during transitions.
      style={{ viewTransitionName: 'site-header' }}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="py-8 flex justify-between">
        <Link href="/" transitionTypes={[...lateralNavTransitionTypes]}>
          <Logo loading="eager" priority="high" className="max-w-44 dark:invert" />
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
