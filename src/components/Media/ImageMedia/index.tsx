'use client'

import type { StaticImageData } from 'next/image'
import NextImage from 'next/image'
import type React from 'react'
import { getCdnMediaUrl, getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'
import type { Props as MediaProps } from '../types'

// Highest entry in `images.qualities` (next.config.ts). Photography and UI
// mockups stay visually lossless here at retina densities; q100 spent a large
// share of every candidate's bytes on detail no screen shows.
const IMAGE_QUALITY = 90

// A base64 encoded image to use as a placeholder while the image is loading
const placeholderBlur =
  'data:image/png;base64,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'

/**
 * ImageMedia
 *
 * Source resolution, in order:
 *   1. `src` prop (static import).
 *   2. The R2 CDN URL for the media doc (`getCdnMediaUrl`, absolute, allowed
 *      by `images.remotePatterns`). The optimizer fetches the object straight
 *      from the edge cache, and its own cache is keyed on that URL plus the
 *      `?updatedAt` tag, so a transform lives until the asset is replaced.
 *   3. Payload's `url` (`/api/media/file/...`, `images.localPatterns`) when no
 *      CDN host is configured. This route is a function in front of the same
 *      bytes and answers `max-age=0`, so it is the dev fallback only.
 */
export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    crossOrigin,
    fill,
    pictureClassName,
    imgClassName,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string | undefined = srcFromProps

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, filename, height: fullHeight, url, width: fullWidth } = resource

    if (fullWidth != null && fullHeight != null) {
      width = fullWidth
      height = fullHeight
    }
    alt = altFromResource || ''

    const cacheTag = resource.updatedAt

    src = getCdnMediaUrl(filename, cacheTag) || getMediaUrl(url, cacheTag) || undefined
  }

  // Avoid Next/img empty-string src (re-downloads the page). Unpopulated
  // relationships (id only) or media docs without a url hit this path.
  if (!src) {
    return null
  }

  const loading = loadingFromProps || (!priority ? 'lazy' : undefined)

  // Which srcset candidate the browser picks per viewport. Callers that know
  // their column pass a real `size`; the default is the full viewport, which is
  // what the previous (invalid, `Nw`-based) string fell back to anyway.
  const sizes = sizeFromProps || '100vw'

  // `fill` images position against their direct parent (next/image requires it be
  // positioned). The <picture> must therefore be the containing block, spanning the
  // caller's positioned wrapper.
  return (
    <picture className={cn(fill && 'absolute inset-0', pictureClassName)}>
      <NextImage
        alt={alt || ''}
        className={cn(imgClassName)}
        crossOrigin={crossOrigin}
        fill={fill}
        height={!fill ? height : undefined}
        placeholder="blur"
        blurDataURL={placeholderBlur}
        priority={priority}
        quality={IMAGE_QUALITY}
        loading={loading}
        sizes={sizes}
        src={src}
        width={!fill ? width : undefined}
      />
    </picture>
  )
}
