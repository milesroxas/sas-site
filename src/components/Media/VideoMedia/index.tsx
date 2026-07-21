'use client'

import type React from 'react'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'
import type { Props as MediaProps } from '../types'

// Videos are served straight from the R2 custom domain (edge-cached, zero
// egress) rather than proxied through the Next app. Images still route through
// Next optimization; only video bypasses it.
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || ''

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { onClick, resource, videoClassName } = props

  if (!resource || typeof resource !== 'object') {
    return null
  }

  const { filename, mimeType, updatedAt } = resource
  const src = filename ? getMediaUrl(`${MEDIA_URL}/${filename}`, updatedAt) : ''

  if (!src) {
    return null
  }

  // poster may be a populated media doc or an unresolved id — only usable when populated.
  const poster =
    resource.poster && typeof resource.poster === 'object' && resource.poster.filename
      ? getMediaUrl(`${MEDIA_URL}/${resource.poster.filename}`, resource.poster.updatedAt)
      : undefined

  return (
    <video
      autoPlay
      className={cn(videoClassName)}
      controls={false}
      loop
      muted
      onClick={onClick}
      playsInline
      poster={poster}
      preload="metadata"
    >
      <source src={src} type={mimeType || undefined} />
    </video>
  )
}
