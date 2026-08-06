import type React from 'react'
import { HeroDarkTheme } from '@/heros/shared'
import type { Home, Post } from '@/payload-types'
import { SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD, ScrollReveal } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
import { FeaturedCard } from './FeaturedCard'
import { HeroBackground } from './HeroBackground'

type HomeHeroData = Home['hero']

const descriptionClassName =
  'max-w-[30rem] text-sm leading-relaxed text-muted-foreground md:max-w-[23.375rem] lg:text-base'

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

      {media && typeof media === 'object' && <HeroBackground media={media} />}

      {/* Header inset only — section height already ends at the footer. */}
      <ScrollReveal
        as="div"
        className="relative z-10 flex min-h-0 flex-1 flex-col self-stretch px-gutter pt-(--header-height)"
        enterThreshold={SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD}
        variant="intro"
      >
        <div className="flex min-h-0 flex-1 flex-col py-8 sm:py-12">
          <div
            className={cn(
              'flex min-h-0 w-full flex-1 flex-col self-stretch',
              isCenter
                ? 'items-center justify-center px-2'
                : 'items-start gap-8 pt-8 sm:gap-12 sm:pt-16',
            )}
          >
            {title && (
              <h1
                data-reveal
                className={cn(
                  'font-heading font-light tracking-tight text-foreground',
                  isCenter
                    ? // Center stays a short statement: fluid size, balanced wrap, never wider than the band.
                      'max-w-[18ch] text-center text-balance text-4xl leading-tight sm:max-w-[22ch] sm:text-5xl md:max-w-[36.5rem] md:text-6xl'
                    : // Left: em width tracks type so "Make it" / "make sense" stays two lines.
                      'max-w-[5.35em] text-6xl leading-tight sm:text-7xl lg:text-8xl',
                )}
              >
                {title}
              </h1>
            )}

            {!isCenter && description && (
              <p className={descriptionClassName} data-reveal>
                {description}
              </p>
            )}
          </div>

          {(isCenter || post) && (
            <div
              data-reveal
              className={cn(
                'flex w-full shrink-0 self-stretch',
                isCenter
                  ? cn(
                      // Stacked: card sets width, description matches. md+: Paper row.
                      'flex-col gap-10 md:w-full md:flex-row md:items-end md:justify-between md:gap-8',
                      post ? 'w-fit max-w-full items-stretch' : 'w-full items-start',
                    )
                  : 'items-center justify-center md:justify-end',
              )}
            >
              {isCenter && description && (
                <p
                  className={cn(
                    'text-left text-base leading-relaxed text-muted-foreground lg:text-lg',
                    post
                      ? // Fill the card width without expanding the stack.
                        'w-0 min-w-full md:w-auto md:min-w-0 md:max-w-[23.375rem]'
                      : 'max-w-[23.375rem]',
                  )}
                >
                  {description}
                </p>
              )}

              {post && <FeaturedCard label={featuredLabel} post={post} />}
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  )
}
