import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { RichTextBlock as RichTextBlockData } from '@/payload-types'

/**
 * `bare` skips the themed band for callers that supply their own shell (a
 * Section block's band, or a renderer's reveal band).
 */
type RichTextBlockProps = Pick<RichTextBlockData, 'blockType' | 'body' | 'theme'> & {
  bare?: boolean
}

/**
 * A reading column on the composition grid: the body starts one column in and
 * spans three (columns 2-4), the same measure the Standard heading gives its
 * body, so a rich-text run under a heading block reads as one column.
 *
 * Prose mode so inline headings, lists, and links take the article treatment
 * `RichText` bridges to the type tokens. Copy sits at the base size on a
 * normal desktop and steps up to `text-lg` from `xl`, where the three-column
 * measure is wide enough to carry it (the Paper frame is set at 1440).
 *
 * The single `data-reveal` marker plays the shared intro reveal from the
 * renderer; the block itself never animates.
 */
export const RichTextBlock: React.FC<RichTextBlockProps> = ({ bare, body, theme }) => (
  <Section bare={bare} theme={theme}>
    <Container>
      <BlockGrid>
        <div className="md:col-span-3 md:col-start-2" data-reveal>
          {body ? (
            <RichText className="text-base xl:text-lg" data={body} enableGutter={false} />
          ) : null}
        </div>
      </BlockGrid>
    </Container>
  </Section>
)
