import type React from 'react'
import { Media } from '@/components/Media'
import type { FeatureImageCaptionBlock as FeatureImageCaptionBlockProps } from '@/payload-types'

export const FeatureImageCaptionBlock: React.FC<FeatureImageCaptionBlockProps> = ({
  media,
  caption,
}) => {
  return (
    <section className="container">
      <div className="flex flex-col items-end gap-6">
        <div className="relative aspect-[3/2] w-full bg-muted md:aspect-[21/9]">
          <Media fill imgClassName="object-cover" resource={media} size="100vw" />
        </div>
        <p className="max-w-2xl text-xl/relaxed md:text-3xl/relaxed">{caption}</p>
      </div>
    </section>
  )
}
