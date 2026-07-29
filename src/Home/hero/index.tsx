import type React from 'react'
import { Media } from '@/components/Media'
import { HeroDarkTheme } from '@/heros/shared'
import type { Home, Post } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { FeaturedCard } from './FeaturedCard'

type HomeHeroData = Home['hero']

export const RenderHomeHero: React.FC<HomeHeroData> = (props) => {
  const { type } = props || {}
  if (!type) return null
  return <HomeHero {...props} />
}

const HomeHero: React.FC<HomeHeroData> = ({
  description,
  featuredLabel,
  featuredPost,
  media,
  title,
  type,
}) => {
  const isCenter = type === 'center'
  const post = typeof featuredPost === 'object' && featuredPost ? (featuredPost as Post) : null

  return (
    <section
      // Pull under the fixed header; stop at the fixed footer so the first
      // screen is exactly header + hero + footer (page frame already pads the bottom).
      className="vt-home-hero relative isolate -mt-(--header-height) flex h-[calc(100svh-var(--footer-height))] flex-col overflow-clip bg-background text-foreground"
      data-theme="dark"
    >
      <HeroDarkTheme />

      {media && typeof media === 'object' && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Media
            fill
            htmlElement={null}
            imgClassName="object-cover opacity-85 mix-blend-soft-light select-none"
            priority
            resource={media}
            size="100vw"
          />
        </div>
      )}

      {/* Header inset only — section height already ends at the footer. */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col self-stretch px-4 pt-(--header-height) md:px-8 xl:px-16">
        <div className="flex min-h-0 flex-1 flex-col py-12">
          <div
            className={cn(
              'flex min-h-0 w-full flex-1 flex-col self-stretch',
              isCenter ? 'items-center justify-center' : 'items-start gap-12 pt-16',
            )}
          >
            {title && (
              <h1
                className={cn(
                  'font-heading font-light tracking-tight text-foreground',
                  isCenter
                    ? 'max-w-[36.5rem] text-center text-5xl leading-tight md:text-6xl'
                    : // max-w in em tracks font-size so "Make it" / "make sense" stays two lines.
                      // text-7xl pairs with text-sm; lg steps both up together (8xl / base).
                      'max-w-[5.35em] text-6xl leading-tight sm:text-7xl lg:text-8xl',
                )}
              >
                {title}
              </h1>
            )}

            {!isCenter && description && (
              <p className="max-w-[30rem] text-sm leading-relaxed text-muted-foreground md:max-w-[23.375rem] lg:text-base">
                {description}
              </p>
            )}
          </div>

          {(isCenter || post) && (
            <div
              className={cn(
                'flex w-full shrink-0 items-center self-stretch',
                isCenter ? 'justify-between gap-8' : 'justify-center md:justify-end',
              )}
            >
              {isCenter && description && (
                <p className="max-w-[30rem] text-sm leading-relaxed text-muted-foreground md:max-w-[23.375rem] lg:text-base">
                  {description}
                </p>
              )}

              {post && <FeaturedCard label={featuredLabel} post={post} />}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
