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
 * A reading column on the composition grid: the body starts two columns in and
 * spans four (columns 3-6), a wider measure than the Standard heading body
 * (columns 2-4) so long-form copy gets room to breathe.
 *
 * Prose mode so inline headings, lists, and links take the article treatment
 * `RichText` bridges to the type tokens. Copy sits at the base size on a
 * normal desktop and steps up to `text-lg` from `xl`, where the four-column
 * measure is wide enough to carry it (the Paper frame is set at 1440).
 *
 * The single `data-reveal` marker plays the shared intro reveal from the
 * renderer; the block itself never animates.
 */
export const RichTextBlock: React.FC<RichTextBlockProps> = ({ bare, body, theme }) => (
  <Section bare={bare} theme={theme}>
    <Container>
      <BlockGrid>
        <div className="md:col-span-4 md:col-start-3" data-reveal>
          {body ? (
            <RichText className="text-base xl:text-lg" data={body} enableGutter={false} />
          ) : null}
        </div>
      </BlockGrid>
    </Container>
  </Section>
)
