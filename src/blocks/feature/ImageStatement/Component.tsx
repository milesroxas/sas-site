import type React from 'react'
import { ASPECT_RATIO_CLASS } from '@/blocks/shared/aspect-ratio'
import { Section } from '@/blocks/shared/section'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FeatureImageStatementBlock as FeatureImageStatementBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'

/**
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
  return (
    <Section bare={bare} spacing={fullBleed ? 'loose' : 'normal'} theme={theme}>
      <div className={cn('flex flex-col gap-6', !fullBleed && 'container')}>
        <div className={cn('relative w-full bg-muted', aspectClass)} data-reveal="media">
          <Media
            fill
            htmlElement={null}
            imgClassName="object-cover"
            resource={media}
            size="100vw"
          />
        </div>
        <div
          className={cn(
            'flex',
            fullBleed && 'container',
            textPosition === 'left' ? 'justify-start' : 'justify-end',
          )}
        >
          {caption ? (
            <div data-reveal>
              <RichText
                className={cn(
                  'max-w-2xl',
                  textSize === 'small' ? 'text-lead/relaxed' : 'text-heading-3/relaxed',
                )}
                data={caption}
                enableGutter={false}
                enableProse={false}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
