import type React from 'react'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import { HeroDarkTheme, HeroDescription, HeroLinks, HeroTitle } from '@/heros/shared'
import type { Page } from '@/payload-types'

export const MediumImpactHero: React.FC<Page['hero']> = ({
  description,
  eyebrow,
  links,
  media,
  title,
}) => {
  return (
    <div
      className="relative isolate flex min-h-[37.5rem] flex-col items-start overflow-clip bg-background py-12 text-foreground"
      data-theme="dark"
    >
      <HeroDarkTheme />
      <Container className="relative z-10 flex w-full flex-1 flex-col items-start justify-between gap-6">
        {eyebrow && (
          <p className="font-heading text-sm font-normal tracking-tight text-accent-foreground">
            {eyebrow}
          </p>
        )}

        <HeroTitle title={title} />

        <div className="flex flex-col items-start gap-8">
          <HeroDescription description={description} />
          <HeroLinks links={links} />
        </div>
      </Container>

      {media && typeof media === 'object' && (
        // data-hero-media: takeover-menu dissolve source (src/Header/Menu).
        <div data-hero-media className="contents">
          <Media fill imgClassName="-z-10 object-cover select-none" priority resource={media} />
        </div>
      )}
    </div>
  )
}
