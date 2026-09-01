'use client'

import type React from 'react'
import { useEffect } from 'react'
import { CMSLink } from '@/components/Link'
import type { Page } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'

type Hero = NonNullable<Page['hero']>

/** Forces the fixed site header onto the dark theme while a dark hero is mounted. */
export const HeroDarkTheme: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  return null
}

export const HeroTitle: React.FC<{ title: Hero['title'] }> = ({ title }) => {
  if (!title) return null
  return <h1 className="max-w-xl text-heading-1 text-foreground">{title}</h1>
}

/** Hairline-and-label kicker above an index or hero title. */
export const HeroEyebrow: React.FC<{ eyebrow: Hero['eyebrow'] }> = ({ eyebrow }) => {
  if (!eyebrow) return null
  return (
    <p className="flex items-center gap-2 font-mono text-sm/none tracking-tight">
      <span aria-hidden="true" className="h-px w-4 shrink-0 bg-border" />
      {eyebrow}
    </p>
  )
}

export const HeroLinks: React.FC<{ links: Hero['links'] }> = ({ links }) => {
  if (!Array.isArray(links) || links.length === 0) return null
  return (
    <ul className="flex gap-4">
      {links.map(({ link }, i) => (
        <li key={i}>
          <CMSLink {...link} />
        </li>
      ))}
    </ul>
  )
}

export const HeroDescription: React.FC<{ description: Hero['description'] }> = ({
  description,
}) => {
  if (!description) return null
  return <p className="max-w-sm text-base leading-relaxed text-muted-foreground">{description}</p>
}
