import type React from 'react'
import { fullViewportSectionClassName, sectionThemeClass } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { CMSLink } from '@/components/Link'
// Payload website-template pattern: RichText renders embedded blocks, blocks render rich text
// fallow-ignore-next-line circular-dependency
import RichText from '@/components/RichText'
import type { FeatureStatementLinksBlock as FeatureStatementLinksBlockProps } from '@/payload-types'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

/**
 * Full-viewport statement beside a ruled link column.
 *
 * Entrance is the shared GSAP intro reveal (`variant="intro"` / `SCROLL_REVEAL_INTRO`)
 * — same template as work-page composition blocks. No CSS block-reveal wrap.
 */
export const FeatureStatementLinksBlock: React.FC<FeatureStatementLinksBlockProps> = ({
  links,
  statement,
  theme,
}) => {
  return (
    <ScrollReveal
      variant="intro"
      className={cn(fullViewportSectionClassName, sectionThemeClass(theme))}
    >
      <Container width="default">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {statement ? (
            <div className="min-w-0 max-w-3xl flex-1" data-reveal>
              <RichText
                className="text-heading-2 leading-snug"
                data={statement}
                enableGutter={false}
                enableProse={false}
                variant="emphasis"
              />
            </div>
          ) : null}
          {links?.length ? (
            <div className="flex w-44 shrink-0 flex-col gap-8 pt-3" data-reveal>
              {links.map(({ id, link }) => (
                <CMSLink {...link} appearance="ruled" key={id} size="clear" />
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </ScrollReveal>
  )
}
