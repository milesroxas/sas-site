import type { StaticImageData } from 'next/image'
import type React from 'react'
import { ThemeBand } from '@/blocks/shared/section'
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
    theme,
    disableInnerContainer,
  } = props

  // Lexical may leave `media` as an id when depth is too low; callers that
  // render rich text must query with enough depth to populate uploads.
  const mediaDoc = media && typeof media === 'object' ? media : null

  let caption: MediaDoc['caption'] | undefined
  if (captionOverride && hasRichTextContent(captionOverride)) caption = captionOverride
  else if (mediaDoc) caption = mediaDoc.caption

  // Videos may rely on filename + CDN rather than a populated `url`; don't
  // require `url` or image-only fields to mount the player.
  const hasRenderableMedia = Boolean(
    staticImage ||
      (mediaDoc && (mediaDoc.url || mediaDoc.filename || mediaDoc.mimeType?.startsWith('video'))),
  )

  return (
    <ThemeBand theme={theme}>
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
          {hasRenderableMedia && (
            <Media
              imgClassName={cn('rounded-lg border border-border', imgClassName)}
              resource={mediaDoc}
              src={staticImage}
              videoClassName={cn('rounded-lg border border-border', imgClassName)}
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
    </ThemeBand>
  )
}
