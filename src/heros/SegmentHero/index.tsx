import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Container } from '@/components/Container'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { HeroBand } from '@/heros/HeroBand'
import type { SegmentHero as SegmentHeroData } from '@/payload-types'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'

/** First link is the frosted primary chip; a second link is the plain text action. */
const actionAppearances = ['glass', 'underline'] as const

/**
 * The row enters on the reveal's `panel` track: opacity + drop only, no blur.
 * The glass chip's `backdrop-filter` would be killed by a `filter` on the same
 * node, and the shell's blur settle is a `filter`.
 */
const HeroActions: React.FC<{ className?: string; links: SegmentHeroData['links'] }> = ({
  className,
  links,
}) => {
  if (!Array.isArray(links) || links.length === 0) return null
  return (
    <ul className={className} data-reveal="panel">
      {links.slice(0, actionAppearances.length).map(({ link }, i) => (
        <li key={link.label}>
          <CMSLink {...link} appearance={actionAppearances[i]} size="action" />
        </li>
      ))}
    </ul>
  )
}

/**
 * Segment-page hero: the page's opening screen. A dark band (`HeroBand`
 * pins the palette and carries the fixed chrome with it) with the media as
 * its backdrop, pulled under the header and running under the footer, so the
 * first screen is the band alone with both bars floating over it.
 *
 * Laid out on the composition grid (docs/block-grid-roadmap.md):
 * - Eyebrow and title: columns 1-4, top.
 * - Actions: under the title on the same 4 columns.
 * - Lead and paragraph: columns 6-8, narrowing to 6-7 from `lg` so the
 *   closing copy keeps a reading measure and never fills the last column.
 * Below `md` everything stacks left-aligned in reading order, with the
 * actions last.
 *
 * The copy plays the site's intro reveal on load: eyebrow and title land on
 * one beat, the actions follow, the closing copy settles last. The media
 * stays static, as on the home hero: it is the surface the menu handoff and
 * the work-open landing dissolve onto, so an entrance mask of its own would
 * fight that settle.
 */
export const SegmentHero: React.FC<SegmentHeroData> = ({
  description,
  eyebrow,
  lead,
  links,
  media,
  title,
}) => {
  const hasClosing = Boolean(lead || description)
  return (
    <HeroBand
      as="header"
      // Pull under the fixed header and run under the fixed footer: the band
      // is one full viewport, and both bars float over its edges.
      className="relative isolate -mt-(--header-height) flex min-h-svh flex-col overflow-clip bg-background pt-(--header-height) pb-(--footer-height) text-foreground"
    >
      <ScrollReveal as="div" className="relative z-10 flex flex-1 flex-col" variant="intro">
        <Container className="flex w-full flex-1 flex-col py-24">
          <BlockGrid className="flex-1 gap-y-12 md:grid-rows-[auto_minmax(0,1fr)]">
            <div className="flex flex-col items-start gap-4 md:col-span-4">
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
                className="text-heading-2 text-foreground"
                data-reveal
                data-reveal-group="hero-title"
              >
                {title}
              </h1>
            </div>
            <HeroActions
              className="flex items-start gap-3 max-md:order-last md:col-span-4 md:col-start-1 md:row-start-2 md:self-start"
              links={links}
            />
            {hasClosing && (
              <div className="flex flex-col items-start gap-6 md:col-span-3 md:col-start-6 md:row-start-2 md:self-end lg:col-span-2">
                {lead && (
                  <p className="text-lead text-foreground" data-reveal>
                    {lead}
                  </p>
                )}
                {description && (
                  <p className="text-base/normal text-muted-foreground" data-reveal>
                    {description}
                  </p>
                )}
              </div>
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
    </HeroBand>
  )
}
