import type React from 'react'
import { Container } from '@/components/Container'
import { HeroBand } from '@/heros/HeroBand'
import type { Home, Media, Post } from '@/payload-types'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { populatedDoc } from '@/utilities/relationshipId'
import { cn } from '@/utilities/ui'
import { FeaturedCard } from './FeaturedCard'
import { HeroBackground } from './HeroBackground'

type HomeHeroData = Home['hero']
type HeroLayout = HomeHeroData['type']

const descriptionClassName =
  'max-w-[30rem] text-sm leading-relaxed text-muted-foreground md:max-w-[23.375rem] lg:text-base'

const statementStackClassName: Record<HeroLayout, string> = {
  center: 'items-center justify-center px-2',
  left: 'items-start gap-8 pt-8 sm:gap-12 sm:pt-16',
}

const titleClassName: Record<HeroLayout, string> = {
  // Center stays a short statement: fluid size, balanced wrap, never wider than the band.
  center: 'max-w-[18ch] text-center text-balance text-heading-1 sm:max-w-[22ch] md:max-w-146',
  // Left: em width tracks type so "Make it" / "make sense" stays two lines.
  left: 'max-w-[5.35em] text-display',
}

const footerRowClassName: Record<HeroLayout, string> = {
  // Stacked: card sets width, description matches. md+: Paper row.
  center: 'flex-col gap-10 md:w-full md:flex-row md:items-end md:justify-between md:gap-8',
  left: 'items-center justify-center md:justify-end',
}

/**
 * The screen's bottom row. Only the centered layout keeps it without a
 * featured post — the left layout has nothing to put there, and the row's own
 * width rules depend on whether the card is present, not just on the layout.
 */
const HeroFooterRow = ({
  description,
  featuredLabel,
  post,
  type,
}: {
  description: HomeHeroData['description']
  featuredLabel: HomeHeroData['featuredLabel']
  post: Post | null
  type: HeroLayout
}) => {
  const isCenter = type === 'center'
  if (!isCenter && !post) return null

  return (
    <div
      data-reveal
      className={cn(
        'flex w-full shrink-0 self-stretch',
        footerRowClassName[type],
        isCenter && (post ? 'w-fit max-w-full items-stretch' : 'w-full items-start'),
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
  )
}

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
  const backgroundMedia = populatedDoc<Media>(media)
  const post = populatedDoc<Post>(featuredPost)

  return (
    <HeroBand
      // Pull under the fixed header; stop at the fixed footer so the first
      // screen is exactly header + hero + footer (page frame already pads the bottom).
      className="relative isolate -mt-(--header-height) flex h-[calc(100svh-var(--footer-height))] flex-col overflow-clip bg-background text-foreground"
    >
      {backgroundMedia && <HeroBackground media={backgroundMedia} />}

      {/* Header inset only — section height already ends at the footer. */}
      <ScrollReveal
        as="div"
        className="relative z-10 flex min-h-0 flex-1 flex-col self-stretch pt-(--header-height)"
        variant="intro"
      >
        <Container className="flex min-h-0 flex-1 flex-col py-8 sm:py-12">
          <div
            className={cn(
              'flex min-h-0 w-full flex-1 flex-col self-stretch',
              statementStackClassName[type],
            )}
          >
            {title && (
              <h1 data-reveal className={cn('font-light text-foreground', titleClassName[type])}>
                {title}
              </h1>
            )}

            {!isCenter && description && (
              <p className={descriptionClassName} data-reveal>
                {description}
              </p>
            )}
          </div>

          <HeroFooterRow
            description={description}
            featuredLabel={featuredLabel}
            post={post}
            type={type}
          />
        </Container>
      </ScrollReveal>
    </HeroBand>
  )
}
