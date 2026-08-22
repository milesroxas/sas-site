import type React from 'react'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FeatureImageStatementBlock as FeatureImageStatementBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'

type FeatureImageStatementBlockProps = Pick<
  FeatureImageStatementBlockData,
  'blockType' | 'caption' | 'imageWidth' | 'media' | 'textPosition' | 'textSize'
>

export const FeatureImageStatementBlock: React.FC<FeatureImageStatementBlockProps> = ({
  media,
  caption,
  textPosition,
  textSize,
  imageWidth,
}) => {
  const fullBleed = imageWidth === 'full'
  return (
    <section className={cn('flex flex-col gap-6', !fullBleed && 'container')}>
      <div className="relative aspect-3/2 w-full bg-muted md:aspect-21/9" data-reveal="media">
        <Media fill htmlElement={null} imgClassName="object-cover" resource={media} size="100vw" />
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
    </section>
  )
}
