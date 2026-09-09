import type React from 'react'
import type { CSSProperties } from 'react'
import { Container } from '@/components/Container'
import { HeroBand, type HeroIntroMode } from '@/heros/HeroBand'
import type { Home, Media, Post } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'
import { cn } from '@/utilities/ui'
import { FeaturedCard } from './FeaturedCard'
import { HeroBackground } from './HeroBackground'

type HomeHeroData = Home['hero']
type HeroLayout = HomeHeroData['type']

type HomeHeroProps = HomeHeroData & {
  /** Page-intro override for stories and demos; the page leaves it on `auto`. */
  intro?: HeroIntroMode
}

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

/** Inline stagger slot for a page-intro copy target (globals.css `--intro-slot`, reading order). */
const introSlot = (slot: number) => ({ '--intro-slot': slot }) as CSSProperties

/**
 * The screen's bottom row. Only the centered layout keeps it without a
 * featured post — the left layout has nothing to put there, and the row's own
 * width rules depend on whether the card is present, not just on the layout.
 */
const HeroFooterRow = ({
  description,
  featuredLabel,
  post,
  slot,
  type,
}: {
  description: HomeHeroData['description']
  featuredLabel: HomeHeroData['featuredLabel']
  post: Post | null
  slot: number
  type: HeroLayout
}) => {
  const isCenter = type === 'center'
  if (!isCenter && !post) return null

  return (
    <div
      data-intro="panel"
      style={introSlot(slot)}
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

export const RenderHomeHero: React.FC<HomeHeroProps> = (props) => {
  const { type } = props || {}
  if (!type) return null
  return <HomeHero {...props} />
}

const HomeHero: React.FC<HomeHeroProps> = ({
  description,
  featuredLabel,
  featuredPost,
  intro = 'auto',
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
      intro={intro}
      pinsChromeAtLoad
    >
      {backgroundMedia && <HeroBackground media={backgroundMedia} />}
      {/* Cold page intro only (globals.css "Page intro"): the band's own
          ground, retracting downward to uncover the media at the site
          reveal's tempo. Same negative z as the media group and a later
          sibling, so it paints over the media and under the copy. */}
      {backgroundMedia && (
        <div aria-hidden className="absolute inset-0 -z-10 bg-background" data-intro-cover />
      )}

      {/* Header inset only: section height already ends at the footer. */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col self-stretch pt-(--header-height)">
        <Container className="flex min-h-0 flex-1 flex-col py-8 sm:py-12">
          <div
            className={cn(
              'flex min-h-0 w-full flex-1 flex-col self-stretch',
              statementStackClassName[type],
            )}
          >
            {title && (
              <h1
                className={cn('font-light text-foreground', titleClassName[type])}
                data-intro="copy"
                style={introSlot(0)}
              >
                {title}
              </h1>
            )}

            {!isCenter && description && (
              <p className={descriptionClassName} data-intro="copy" style={introSlot(1)}>
                {description}
              </p>
            )}
          </div>

          <HeroFooterRow
            description={description}
            featuredLabel={featuredLabel}
            post={post}
            slot={isCenter ? 1 : 2}
            type={type}
          />
        </Container>
      </div>
    </HeroBand>
  )
}
