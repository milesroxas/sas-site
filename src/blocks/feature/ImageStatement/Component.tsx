import type React from 'react'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FeatureImageStatementBlock as FeatureImageStatementBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'

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
      <div className="relative aspect-3/2 w-full bg-muted md:aspect-21/9">
        <Media fill imgClassName="object-cover" resource={media} size="100vw" />
      </div>
      <div
        className={cn(
          'flex',
          fullBleed && 'container',
          textPosition === 'left' ? 'justify-start' : 'justify-end',
        )}
      >
        {caption ? (
          <RichText
            className={cn(
              'max-w-2xl',
              textSize === 'small'
                ? 'text-lg/relaxed md:text-2xl/relaxed'
                : 'text-xl/relaxed md:text-3xl/relaxed',
            )}
            data={caption}
            enableGutter={false}
            enableProse={false}
          />
        ) : null}
      </div>
    </section>
  )
}
