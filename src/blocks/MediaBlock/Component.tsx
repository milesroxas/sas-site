import configPromise from '@payload-config'
import type { StaticImageData } from 'next/image'
import { getPayload } from 'payload'
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

async function resolveMedia(media: Props['media']): Promise<MediaDoc | null> {
  if (!media) return null
  if (typeof media === 'object') return media

  const payload = await getPayload({ config: configPromise })
  try {
    return await payload.findByID({
      collection: 'media',
      depth: 1,
      id: media,
      overrideAccess: false,
    })
  } catch {
    return null
  }
}

export const MediaBlock: React.FC<Props> = async (props) => {
  const {
    captionClassName,
    captionOverride,
    className,
    enableGutter = true,
    imgClassName,
    size,
    staticImage,
    disableInnerContainer,
  } = props

  const media = await resolveMedia(props.media)

  let caption: MediaDoc['caption'] | undefined
  if (captionOverride && hasRichTextContent(captionOverride)) caption = captionOverride
  else if (media) caption = media.caption

  // Videos may rely on filename + CDN rather than a populated `url`; don't
  // require `url` or image-only fields to mount the player.
  const hasRenderableMedia = Boolean(
    staticImage || (media && (media.url || media.filename || media.mimeType?.startsWith('video'))),
  )

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
        {hasRenderableMedia && (
          <Media
            imgClassName={cn('rounded-lg border border-border', imgClassName)}
            resource={media}
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
  )
}
