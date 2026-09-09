'use client'

import type React from 'react'
import { getCdnMediaUrl, getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'
import type { Props as MediaProps } from '../types'

/** Resolve a video media doc's poster image URL (populated relation only). */
export const getVideoPosterUrl = (resource: MediaProps['resource']): string | undefined => {
  if (!resource || typeof resource !== 'object') return undefined
  const posterDoc = resource.poster
  if (!posterDoc || typeof posterDoc !== 'object') return undefined
  const cdn = getCdnMediaUrl(posterDoc.filename, posterDoc.updatedAt)
  if (cdn) return cdn
  if (!posterDoc.url) return undefined
  return getMediaUrl(posterDoc.url, posterDoc.updatedAt)
}

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const {
    autoPlay = true,
    crossOrigin,
    fill,
    imgClassName,
    onClick,
    resource,
    videoClassName,
  } = props

  if (!resource || typeof resource !== 'object') {
    return null
  }

  const { filename, mimeType, updatedAt, url } = resource
  const src = getCdnMediaUrl(filename, updatedAt) || getMediaUrl(url, updatedAt)

  if (!src) {
    return null
  }

  // poster may be a populated media doc or an unresolved id — only usable when populated.
  const poster = getVideoPosterUrl(resource)

  return (
    <video
      autoPlay={autoPlay}
      className={cn(
        fill ? 'absolute inset-0 size-full object-cover' : 'h-auto w-full',
        imgClassName,
        videoClassName,
      )}
      controls={false}
      crossOrigin={crossOrigin}
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
