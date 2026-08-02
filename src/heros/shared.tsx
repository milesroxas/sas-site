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
  return (
    <h1 className="max-w-xl font-heading text-6xl font-normal tracking-tight text-foreground">
      {title}
    </h1>
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
