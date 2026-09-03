'use client'
import type React from 'react'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import { ImmersiveShell, WebGLTunnel, WebGlBackdropScene } from '@/features/immersive'
import { HeroBand } from '@/heros/HeroBand'
import { HeroDescription, HeroLinks, HeroTitle } from '@/heros/shared'
import type { Page } from '@/payload-types'

export const HighImpactHero: React.FC<Page['hero']> = ({ description, links, media, title }) => {
  return (
    // The band owns the palette and the header pull; the immersive shell
    // inside it owns the WebGL layer and the layout.
    <HeroBand as="div" className="-mt-(--header-height)">
      <ImmersiveShell
        webgl
        // isolate: contains the -z-10 image above the page frame's opaque bg-background.
        className="relative isolate flex min-h-[80vh] flex-col items-start overflow-clip bg-background py-12 text-foreground"
      >
        <WebGLTunnel>
          <WebGlBackdropScene />
        </WebGLTunnel>

        <Container className="relative z-10 flex min-h-0 w-full flex-1 flex-col items-start">
          <div className="flex w-full flex-1 flex-col items-start justify-center pt-(--header-height)">
            <HeroTitle title={title} />
          </div>

          <div className="flex w-full flex-col items-start gap-8">
            <HeroDescription description={description} />
            <HeroLinks links={links} />
          </div>
        </Container>

        {media && typeof media === 'object' && (
          // data-hero-media: takeover-menu dissolve source (src/Header/Menu).
          <div data-hero-media className="contents">
            <Media
              fill
              imgClassName="-z-10 object-cover opacity-85 mix-blend-soft-light select-none"
              priority
              resource={media}
            />
          </div>
        )}
      </ImmersiveShell>
    </HeroBand>
  )
}
