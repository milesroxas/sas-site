'use client'
import type React from 'react'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { ImmersiveShell, WebGLTunnel, WebGlBackdropScene } from '@/features/immersive'
import { HeroDarkTheme, HeroDescription, HeroLinks } from '@/heros/shared'
import type { Page } from '@/payload-types'

export const HighImpactHero: React.FC<Page['hero']> = ({ description, links, media, richText }) => {
  return (
    <ImmersiveShell
      webgl
      // vt-home-hero: hero recedes as its own view-transition group (see view-transition.css).
      // isolate: contains the -z-10 image above the page frame's opaque bg-background —
      // vt-home-hero's view-transition-name only provides that stacking context in
      // browsers that support view transitions.
      className="vt-home-hero relative isolate -mt-(--header-height) flex min-h-[80vh] flex-col overflow-clip bg-background text-foreground"
      data-theme="dark"
    >
      <HeroDarkTheme />
      <WebGLTunnel>
        <WebGlBackdropScene />
      </WebGLTunnel>

      <div className="container relative z-10 flex flex-1 flex-col justify-center pt-(--header-height)">
        {richText && (
          <RichText
            className="max-w-xl prose-headings:font-light prose-headings:tracking-tight prose-h1:text-5xl prose-h1:leading-none md:prose-h1:text-[4rem]"
            data={richText}
            enableGutter={false}
          />
        )}
      </div>

      <div className="container relative z-10 flex flex-col items-start gap-8 pb-12">
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
