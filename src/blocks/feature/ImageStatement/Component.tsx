import type React from 'react'
import { ASPECT_RATIO_CLASS } from '@/blocks/shared/aspect-ratio'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FeatureImageStatementBlock as FeatureImageStatementBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'

/**
 * Large media over a statement caption on the composition grid: the caption
 * sits in columns 1-4 (`textPosition: left`) or 5-8 (right). Contained media
 * shares the grid and spans all eight columns; full-bleed media runs edge to
 * edge with the caption re-entering the page column.
 *
 * `bare` skips the themed band for callers that supply their own themed shell
 * (the work-page renderer wraps blocks in a full-viewport reveal section).
 */
type FeatureImageStatementBlockProps = Pick<
  FeatureImageStatementBlockData,
  | 'aspectRatio'
  | 'blockType'
  | 'caption'
  | 'imageWidth'
  | 'media'
  | 'textPosition'
  | 'textSize'
  | 'theme'
> & { bare?: boolean }

export const FeatureImageStatementBlock: React.FC<FeatureImageStatementBlockProps> = ({
  media,
  caption,
  textPosition,
  textSize,
  imageWidth,
  aspectRatio,
  bare,
  theme,
}) => {
  const fullBleed = imageWidth === 'full'
  const aspectClass = ASPECT_RATIO_CLASS[aspectRatio ?? 'responsive']
  const mediaFigure = (
    <div
      className={cn('relative w-full bg-muted', aspectClass, !fullBleed && 'md:col-span-8')}
      data-reveal="media"
    >
      <Media fill htmlElement={null} imgClassName="object-cover" resource={media} size="100vw" />
    </div>
  )
  const captionCell = caption ? (
    <div
      className={cn('md:col-span-4', textPosition === 'left' ? undefined : 'md:col-start-5')}
      data-reveal
    >
      <RichText
        className={textSize === 'small' ? 'text-lead/relaxed' : 'text-heading-3/relaxed'}
        data={caption}
        enableGutter={false}
        enableProse={false}
      />
    </div>
  ) : null
  return (
    <Section bare={bare} spacing={fullBleed ? 'loose' : 'normal'} theme={theme}>
      {fullBleed ? (
        <div className="flex flex-col gap-grid">
          {mediaFigure}
          {captionCell && (
            <Container>
              <BlockGrid>{captionCell}</BlockGrid>
            </Container>
          )}
        </div>
      ) : (
        <Container>
          <BlockGrid>
            {mediaFigure}
            {captionCell}
          </BlockGrid>
        </Container>
      )}
    </Section>
  )
}
