import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { proseHeadingClassNames } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { LabStoryBeatsBlock, WorkStoryBeatsBlock } from '@/payload-types'
import { hasRichTextContent } from '@/utilities/hasRichTextContent'
import { cn } from '@/utilities/ui'

/**
 * Only the story surfaces offer this block, so the two generated interfaces
 * are the whole of its type: both are the same block config seen through
 * `withStoryBeatSource`, and there is no third, collection-agnostic one.
 *
 * `bare` skips the themed band for callers that supply their own shell (a
 * Section block's band, or a renderer's reveal band).
 */
type StoryBeatsBlockProps = Pick<
  LabStoryBeatsBlock | WorkStoryBeatsBlock,
  'blockType' | 'body' | 'heading' | 'headingLevel' | 'theme' | 'variant'
> & {
  bare?: boolean
}

/**
 * Type size only. Prose sizes its children in `em`, so setting the size on the
 * wrapper scales the whole passage and keeps the flow rhythm proportional.
 *
 * - `default`: the prose base, the size a post renders its main text at. It
 *   deliberately does not step up at `xl` the way the Rich text block does:
 *   this block is the story in the same voice as an article body.
 * - `small`: one step down. The leading is restated because `text-sm` carries
 *   a 1.25rem line, tighter than prose's flow at any size.
 * - `lead`: the standfirst token from the type scale (globals.css), for a beat
 *   that opens a section.
 */
const variantClasses = {
  default: '',
  small: 'text-sm/relaxed',
  lead: 'text-lead',
} as const

/**
 * One reading column on the composition grid, starting two columns in and
 * spanning four (columns 3-6) — the same measure and placement as the Rich
 * text block, so a story beat and an authored passage sit on the same line.
 *
 * The copy arrives already resolved against the page's story record
 * (`shared/story-copy.ts`), so this component only ever renders a body: one
 * Story Beat, a section overview, or a whole section composed in order, all
 * the same shape.
 *
 * An optional heading sits on the same column, sized from the prose scale a
 * Prose Standard heading uses (`proseHeadingClassNames`), so a beat heading
 * reads as the next step down the same outline. The column becomes a
 * `text-stack` only when there is one, which owns the heading-to-body gap in
 * the heading's em; without one the passage stays untrimmed.
 *
 * The column is a `data-reveal` marker for the shared intro reveal the
 * renderer plays; the block itself never animates.
 */
export const StoryBeatsBlock: React.FC<StoryBeatsBlockProps> = ({
  bare,
  body,
  heading,
  headingLevel,
  theme,
  variant,
}) => {
  if (!body || !hasRichTextContent(body)) return null
  const Heading = headingLevel || 'h3'
  return (
    <Section bare={bare} theme={theme}>
      <Container>
        <BlockGrid>
          <div className={cn('md:col-span-4 md:col-start-3', heading && 'text-stack')} data-reveal>
            {heading ? (
              <Heading className={proseHeadingClassNames[Heading]}>{heading}</Heading>
            ) : null}
            <RichText
              className={variantClasses[variant || 'default']}
              data={body}
              enableGutter={false}
            />
          </div>
        </BlockGrid>
      </Container>
    </Section>
  )
}
