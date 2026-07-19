import type { StaticImageData } from 'next/image'
import type React from 'react'
// Payload website-template pattern: RichText renders embedded blocks, blocks render rich text
// fallow-ignore-next-line circular-dependency
import RichText from '@/components/RichText'
import type { MediaBlock as MediaBlockProps, Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'

import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

const sizeClasses: Record<NonNullable<MediaBlockProps['size']>, string> = {
  full: '',
  inset: 'mx-auto max-w-3xl',
  small: 'mx-auto max-w-md',
}

const hasRichTextContent = (state: MediaDoc['caption']): boolean =>
  Boolean(
    state?.root?.children?.some((node) => {
      if (node.type !== 'paragraph') return true
      const children = (node as { children?: unknown[] }).children
      return Boolean(children?.length)
    }),
  )

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    captionOverride,
    className,
    enableGutter = true,
    imgClassName,
    media,
    size,
    staticImage,
    disableInnerContainer,
  } = props

  let caption: MediaDoc['caption'] | undefined
  if (captionOverride && hasRichTextContent(captionOverride)) caption = captionOverride
  else if (media && typeof media === 'object') caption = media.caption

  return (
    <div
      className={cn(
        '',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      <div className={sizeClasses[size ?? 'full']}>
        {(staticImage || (media && typeof media === 'object' && media.url)) && (
          <Media
            imgClassName={cn('rounded-lg border border-border', imgClassName)}
            resource={media}
            src={staticImage}
          />
        )}
        {caption && (
          <div
            className={cn(
              'mt-6',
              {
                container: !disableInnerContainer,
              },
              captionClassName,
            )}
          >
            <RichText data={caption} enableGutter={false} />
          </div>
        )}
      </div>
    </div>
  )
}
