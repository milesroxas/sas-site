import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Container } from '@/components/Container'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { HeroDarkTheme } from '@/heros/shared'
import type { SegmentHero as SegmentHeroData } from '@/payload-types'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'

/** First link is the frosted primary chip; a second link is the plain text action. */
const actionAppearances = ['glass', 'underline'] as const

/**
 * The row enters on the reveal's `panel` track: opacity + drop only, no blur.
 * The glass chip's `backdrop-filter` would be killed by a `filter` on the same
 * node, and the shell's blur settle is a `filter`.
 */
const HeroActions: React.FC<{ links: SegmentHeroData['links'] }> = ({ links }) => {
  if (!Array.isArray(links) || links.length === 0) return null
  return (
    <ul className="flex items-start gap-3" data-reveal="panel">
      {links.slice(0, actionAppearances.length).map(({ link }, i) => (
        <li key={link.label}>
          <CMSLink {...link} appearance={actionAppearances[i]} size="action" />
        </li>
      ))}
    </ul>
  )
}

/**
 * Segment-page hero: a dark band (forced `data-theme="dark"`, like the other
 * heroes) with the media as backdrop. Eyebrow, title and actions stack on the
 * left; the supporting paragraph sits bottom-right on the composition grid
 * (columns 5 to 7), below the stack on one column.
 *
 * The copy plays the site's intro reveal on load: eyebrow and title land on
 * one beat, the actions follow, the paragraph settles last. The media stays
 * static, as on the home hero: it is the surface the menu handoff and the
 * work-open landing dissolve onto, so an entrance mask of its own would fight
 * that settle.
 */
export const SegmentHero: React.FC<SegmentHeroData> = ({
  description,
  eyebrow,
  links,
  media,
  title,
}) => {
  return (
    <header
      className="relative isolate flex min-h-150 flex-col overflow-clip bg-background py-12 text-foreground"
      data-theme="dark"
    >
      <HeroDarkTheme />
      <ScrollReveal as="div" className="relative z-10 flex flex-1 flex-col" variant="intro">
        <Container className="flex w-full flex-1 flex-col">
          <BlockGrid className="flex-1 content-between md:content-stretch">
            <div className="flex flex-col items-start gap-6 md:col-span-4">
              {eyebrow && (
                <p
                  className="font-heading text-sm/none tracking-tight text-accent-foreground"
                  data-reveal
                  data-reveal-group="hero-title"
                >
                  {eyebrow}
                </p>
              )}
              <h1
                className="max-w-xl text-heading-2 text-foreground"
                data-reveal
                data-reveal-group="hero-title"
              >
                {title}
              </h1>
              <HeroActions links={links} />
            </div>
            {description && (
              <p
                className="text-lead text-foreground md:col-span-3 md:col-start-5 md:self-end"
                data-reveal
              >
                {description}
              </p>
            )}
          </BlockGrid>
        </Container>
      </ScrollReveal>

      {media && typeof media === 'object' && (
        // data-hero-media: takeover-menu dissolve source (src/Header/Menu).
        <div data-hero-media className="contents">
          <Media
            fill
            imgClassName="-z-10 object-cover select-none"
            priority
            resource={media}
            size="100vw"
          />
        </div>
      )}
    </header>
  )
}
