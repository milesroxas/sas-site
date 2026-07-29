import type React from 'react'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { HeroDarkTheme, HeroDescription, HeroLinks } from '@/heros/shared'
import type { Page } from '@/payload-types'

export const MediumImpactHero: React.FC<Page['hero']> = ({
  description,
  eyebrow,
  links,
  media,
  richText,
}) => {
  return (
    <div
      className="relative isolate flex min-h-[37.5rem] flex-col overflow-clip bg-background text-foreground"
      data-theme="dark"
    >
      <HeroDarkTheme />
      <div className="container relative z-10 flex flex-1 flex-col justify-between gap-6 py-12">
        {eyebrow && (
          <p className="font-heading text-sm font-light tracking-tight text-accent-foreground">
            {eyebrow}
          </p>
        )}

        {richText && (
          <RichText
            className="max-w-xl prose-headings:font-light prose-headings:tracking-tight prose-h1:text-5xl prose-h1:leading-tight prose-h2:text-5xl prose-h2:leading-tight"
            data={richText}
            enableGutter={false}
          />
        )}

        <div className="flex flex-col items-start gap-8">
          <HeroDescription description={description} />
          <HeroLinks links={links} />
        </div>
      </div>

      {media && typeof media === 'object' && (
        <Media fill imgClassName="-z-10 object-cover select-none" priority resource={media} />
      )}
    </div>
  )
}
