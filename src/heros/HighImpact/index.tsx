'use client'
import type React from 'react'
import { Media } from '@/components/Media'
import { ImmersiveShell, WebGLTunnel, WebGlBackdropScene } from '@/features/immersive'
import { HeroDarkTheme, HeroDescription, HeroLinks, HeroTitle } from '@/heros/shared'
import type { Page } from '@/payload-types'

export const HighImpactHero: React.FC<Page['hero']> = ({ description, links, media, title }) => {
  return (
    <ImmersiveShell
      webgl
      // vt-home-hero: hero recedes as its own view-transition group (see view-transition.css).
      // isolate: contains the -z-10 image above the page frame's opaque bg-background —
      // vt-home-hero's view-transition-name only provides that stacking context in
      // browsers that support view transitions.
      className="vt-home-hero relative isolate -mt-(--header-height) flex min-h-[80vh] flex-col items-start overflow-clip bg-background px-gutter py-12 text-foreground"
      data-theme="dark"
    >
      <HeroDarkTheme />
      <WebGLTunnel>
        <WebGlBackdropScene />
      </WebGLTunnel>

      <div className="relative z-10 flex w-full flex-1 flex-col items-start justify-center pt-(--header-height)">
        <HeroTitle title={title} />
      </div>

      <div className="relative z-10 flex w-full flex-col items-start gap-8">
        <HeroDescription description={description} />
        <HeroLinks links={links} />
      </div>

      {media && typeof media === 'object' && (
        <Media
          fill
          imgClassName="-z-10 object-cover opacity-85 mix-blend-soft-light select-none"
          priority
          resource={media}
        />
      )}
    </ImmersiveShell>
  )
}
