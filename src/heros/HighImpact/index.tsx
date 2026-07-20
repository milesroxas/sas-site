'use client'
import type React from 'react'
import { useEffect } from 'react'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { ImmersiveShell, WebGLTunnel, WebGlBackdropScene } from '@/features/immersive'
import type { Page } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  return (
    <ImmersiveShell
      webgl
      // vt-home-hero: hero recedes as its own view-transition group (see view-transition.css).
      // isolate: contains the -z-10 image above the page frame's opaque bg-background —
      // vt-home-hero's view-transition-name only provides that stacking context in
      // browsers that support view transitions.
      className="vt-home-hero relative isolate -mt-(--header-height) flex items-center justify-center text-white"
      data-theme="dark"
    >
      <WebGLTunnel>
        <WebGlBackdropScene />
      </WebGLTunnel>

      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-146 md:text-center">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        {media && typeof media === 'object' && (
          <Media
            fill
            imgClassName="-z-10 object-cover opacity-85 mix-blend-soft-light"
            priority
            resource={media}
          />
        )}
      </div>
    </ImmersiveShell>
  )
}
