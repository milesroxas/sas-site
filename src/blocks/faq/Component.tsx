import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import { CMSLink } from '@/components/Link'
import { resolveCmsLinkHref } from '@/components/Link/resolve-href'
import type { FaqBlock as FaqBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { FaqAccordion, type FaqItem } from './Component.client'

/**
 * `bare` skips the themed band for callers that supply their own shell (a
 * Section block's band, or a renderer's reveal band).
 */
type FaqBlockProps = Pick<
  FaqBlockData,
  'blockType' | 'enableLink' | 'eyebrow' | 'heading' | 'items' | 'link' | 'prompt' | 'theme'
> & { bare?: boolean }

/**
 * Up-right arrow beside the contact link (Paper: 24px, 1.5 stroke). Nudges
 * along its own diagonal on hover: the one hover the header row carries.
 */
const ArrowIcon = () => (
  <svg
    aria-hidden="true"
    className="size-6 shrink-0 transition-transform duration-200 ease-(--ease-out-quint) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
  >
    <path d="M6 18 18 6M9 6h9v9" />
  </svg>
)

/**
 * The header row on the composition grid: heading cluster in columns 1-4,
 * the contact prompt and link right-set in columns 5-8, bottoms aligned.
 * The question columns follow on a second grid (see `FaqAccordion`): they
 * stack into one continuous list below `md`, which the header's row gap must
 * not interrupt.
 *
 * Eyebrow and heading share a reveal beat, the contact link takes the next,
 * and the two columns land together on the third, so the block arrives as
 * three thoughts rather than a cascade of every row.
 */
export const FaqBlock: React.FC<FaqBlockProps> = ({
  bare,
  enableLink,
  eyebrow,
  heading,
  items,
  link,
  prompt,
  theme,
}) => {
  const questions: FaqItem[] = (items ?? []).map((item, index) => ({
    answer: item.answer,
    id: item.id ?? String(index),
    question: item.question,
  }))
  if (questions.length === 0) return null

  const contactHref = enableLink && link ? resolveCmsLinkHref(link) : null

  return (
    <Section bare={bare} theme={theme}>
      <Container className="space-y-12">
        <BlockGrid className="md:items-end">
          <div className="text-stack md:col-span-4">
            {eyebrow ? (
              <p
                className={cn(eyebrowClassName, 'flex items-center gap-2')}
                data-reveal
                data-reveal-group="heading"
              >
                <span aria-hidden="true" className="h-px w-4 bg-border" />
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-heading-3" data-reveal data-reveal-group="heading">
              {heading}
            </h2>
          </div>
          {contactHref && link ? (
            <div
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 md:col-span-4 md:col-start-5 md:justify-self-end"
              data-reveal
            >
              {prompt ? <p className="text-base/relaxed text-muted-foreground">{prompt}</p> : null}
              <CMSLink {...link} className="group inline-flex items-center gap-3 text-lg/normal">
                <ArrowIcon />
              </CMSLink>
            </div>
          ) : null}
        </BlockGrid>
        <FaqAccordion items={questions} />
      </Container>
    </Section>
  )
}
