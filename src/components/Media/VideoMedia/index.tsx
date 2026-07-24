'use client'

import type React from 'react'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'
import type { Props as MediaProps } from '../types'

// Prefer the R2 custom domain (edge-cached, zero egress) when configured.
// Fall back to Payload's `url` (usually `/api/media/file/...`) so local/dev
// still plays when the CDN host is unset.
const MEDIA_URL = (process.env.NEXT_PUBLIC_MEDIA_URL || '').replace(/\/$/, '')

const cdnSrc = (filename: string | null | undefined, cacheTag?: string | null): string => {
  if (!MEDIA_URL || !filename) return ''
  // Object keys may contain spaces; encode each path segment.
  const path = filename
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return getMediaUrl(`${MEDIA_URL}/${path}`, cacheTag)
}

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { imgClassName, onClick, resource, videoClassName } = props

  if (!resource || typeof resource !== 'object') {
    return null
  }

  const { filename, mimeType, updatedAt, url } = resource
  const src = cdnSrc(filename, updatedAt) || getMediaUrl(url, updatedAt)

  if (!src) {
    return null
  }

  // poster may be a populated media doc or an unresolved id — only usable when populated.
  const posterDoc = resource.poster && typeof resource.poster === 'object' ? resource.poster : null
  const poster =
    cdnSrc(posterDoc?.filename, posterDoc?.updatedAt) ||
    (posterDoc?.url ? getMediaUrl(posterDoc.url, posterDoc.updatedAt) : undefined) ||
    undefined

  return (
    <video
      autoPlay
      className={cn('h-auto w-full', imgClassName, videoClassName)}
      controls={false}
      loop
      muted
      onClick={onClick}
      playsInline
      poster={poster || undefined}
      preload="metadata"
    >
      <source src={src} type={mimeType || undefined} />
    </video>
  )
}
