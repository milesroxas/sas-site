'use client'

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Media } from '@/components/Media'
import { HERO_LENS, RefractionMedia } from '@/features/immersive'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import type { Media as MediaType } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

const mediaSrc = (media: MediaType): string => {
  // Absolute fixture/CDN urls win — don't rewrite them or a missing object
  // key (Storybook fixtures) 404s and the lens never becomes ready. The DOM
  // layer fetches the same URL without CORS, browsers key their HTTP cache by
  // URL alone, and R2 sends no `Vary: Origin` — so that no-CORS response
  // would be replayed for this crossOrigin texture fetch and fail it. The
  // marker param gives the WebGL copy its own cache entry.
  if (media.url && /^https?:\/\//i.test(media.url)) {
    const url = getMediaUrl(media.url, media.updatedAt)
    return `${url}${url.includes('?') ? '&' : '?'}webgl=1`
  }
  // Same-origin Payload proxy, never the R2 custom domain: the CDN sends no
  // CORS headers, so the crossOrigin texture fetch fails and the canvas never
  // becomes ready.
  if (media.filename) {
    const path = media.filename
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')
    return getMediaUrl(`/api/media/file/${path}`, media.updatedAt)
  }
  return getMediaUrl(media.url, media.updatedAt)
}

/**
 * Hero backdrop: the ordinary `Media` element paints first (keeping the
 * image's `priority` preload and LCP behaviour intact), then a WebGL canvas
 * loads the same URL as its texture and fades in on top. The DOM layer stays
 * mounted underneath as the fallback for reduced motion, touch, absent GPUs
 * and lost contexts.
 *
 * The WebGL path uses `src` (TextureLoader / owned video) rather than sampling
 * the live DOM node. Sampling the Next/Image element under React Strict Mode
 * + demand frameloop was leaving a black canvas faded over the real media in
 * Storybook/dev; URL-based loading keeps the lens effect without that race.
 */
export const HeroBackground: React.FC<{ media: MediaType }> = ({ media }) => {
  const { hasGPU } = useDeviceDetection()
  const [ready, setReady] = useState(false)

  const isVideo = Boolean(media.mimeType?.includes('video'))
  const src = mediaSrc(media) || undefined
  const enabled = hasGPU && Boolean(src)

  useEffect(() => {
    if (!enabled) setReady(false)
  }, [enabled])

  const handleReady = useCallback(() => setReady(true), [])

  return (
    <div
      aria-hidden
      // Opacity belongs to the group rather than the layers: at 85% each, the
      // undistorted DOM media would show through the canvas covering it.
      // data-hero-media: takeover-menu dissolve source (src/Header/Menu) —
      // the DOM media element gets cloned, never the WebGL canvas.
      data-hero-media
      className="pointer-events-none absolute inset-0 -z-10 opacity-85"
    >
      <Media
        fill
        htmlElement={null}
        imgClassName="object-cover select-none"
        priority
        resource={media}
        size="100vw"
      />

      {enabled && src && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            ready ? 'opacity-100' : 'opacity-0',
          )}
        >
          <RefractionMedia
            className="size-full"
            onReady={handleReady}
            src={src}
            video={isVideo}
            {...HERO_LENS}
          />
        </div>
      )}
    </div>
  )
}
