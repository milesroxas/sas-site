import type React from 'react'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import { resolveOpening } from '@/features/immersive/visual'
import { HeroBand } from '@/heros/HeroBand'
import { HeroGround } from '@/heros/HeroGround'
import { HeroDescription, HeroLinks, HeroTitle } from '@/heros/shared'
import type { Page } from '@/payload-types'

export const MediumImpactHero: React.FC<Page['hero']> = (hero) => {
  const { description, eyebrow, links, title } = hero
  const { ground, media, surface } = resolveOpening(hero, { seedKey: title ?? 'hero' })
  return (
    <HeroBand
      as="div"
      className="relative isolate flex min-h-[37.5rem] flex-col items-start overflow-clip bg-background py-12 text-foreground"
      // A pinned effect takes the band with it, so the copy stays on its ground.
      theme={surface ?? undefined}
    >
      <Container className="relative z-10 flex w-full flex-1 flex-col items-start justify-between gap-6">
        {eyebrow && (
          <p className="font-heading text-sm font-normal tracking-tight text-secondary-foreground">
            {eyebrow}
          </p>
        )}

        <HeroTitle title={title} />

        <div className="flex flex-col items-start gap-8">
          <HeroDescription description={description} />
          <HeroLinks links={links} />
        </div>
      </Container>

      {media && (
        // data-hero-media: takeover-menu dissolve source (src/Header/Menu).
        <div data-hero-media className="contents">
          <Media
            fill
            imgClassName="-z-20 object-cover select-none"
            priority
            resource={media}
            videoClassName="-z-20 object-cover select-none"
          />
        </div>
      )}
      <HeroGround ground={ground} handoff={!media} />
    </HeroBand>
  )
}
