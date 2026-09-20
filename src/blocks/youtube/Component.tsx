import type React from 'react'
import { Section } from '@/blocks/shared/section'
import type { YouTubeBlock as YouTubeBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { LiteYouTube } from './LiteYouTube'
import { parseYouTube } from './video'

type Props = YouTubeBlockProps & {
  /** Skip the band when the caller's shell owns it (the Section block). */
  bare?: boolean
  className?: string
  enableGutter?: boolean
  disableInnerContainer?: boolean
}

const sizeClasses: Record<NonNullable<YouTubeBlockProps['size']>, string> = {
  full: '',
  inset: 'mx-auto max-w-3xl',
  small: 'mx-auto max-w-md',
}

/**
 * The YouTube block on a composition band, sized the way the Caption block
 * sizes an image so the two read as one family. An unreadable link renders
 * nothing: draft saves skip field validation, so a half-typed URL reaches
 * this component on every preview.
 */
export const YouTubeBlock: React.FC<Props> = ({
  bare,
  className,
  enableGutter = true,
  size,
  theme,
  title,
  url,
}) => {
  const video = parseYouTube(url)
  if (!video) return null

  return (
    <Section bare={bare} spacing="loose" theme={theme}>
      <div className={cn({ container: enableGutter }, className)}>
        <div className={sizeClasses[size ?? 'full']}>
          <LiteYouTube title={title} video={video} />
        </div>
      </div>
    </Section>
  )
}
