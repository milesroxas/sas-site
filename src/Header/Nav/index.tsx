'use client'

import { IconSearch } from '@tabler/icons-react'
import Link from 'next/link'
import type React from 'react'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <Link href="/search" transitionTypes={[...lateralNavTransitionTypes]}>
        <span className="sr-only">Search</span>
        <IconSearch className="size-5 text-primary" />
      </Link>
    </nav>
  )
}
