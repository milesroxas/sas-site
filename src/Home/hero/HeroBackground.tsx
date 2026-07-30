'use client'

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Media } from '@/components/Media'
import { RefractionMedia } from '@/features/immersive'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import type { Media as MediaType } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

/**
 * Dialed in on /demo/immersive. Two layers trail the cursor: the original
 * edgeless screen-space warp (`edge: 0` — refraction, chroma, noise and smear
 * with no visible rim, so `feather` and `highlight` are left off), plus a
 * flattened glass mesh refracting the warped image through six spectral
 * bands. Both ease out when the pointer leaves; set `lensVisibility: 0` to
 * run the warp alone.
 */
const LENS = {
  spread: 0.51,
  edge: 0,
  refraction: 0.14,
  chroma: 0.7,
  distortion: 0.008,
  noiseScale: 16.5,
  noiseSpeed: 0.5,
  smear: 0.1,
  lensVisibility: 1,
  lensSpread: 0.28,
  lensDepth: 0.55,
  lensRefraction: 0.12,
  lensChroma: 0.6,
  lensSaturation: 1.04,
  follow: 6.5,
  ease: 4.5,
} as const

const MEDIA_URL = (process.env.NEXT_PUBLIC_MEDIA_URL || '').replace(/\/$/, '')

const mediaSrc = (media: MediaType): string => {
  // Absolute fixture/CDN urls win — don't rewrite them through MEDIA_URL or a
  // missing object key (Storybook fixtures) 404s and the lens never becomes ready.
  if (media.url && /^https?:\/\//i.test(media.url)) {
    return getMediaUrl(media.url, media.updatedAt)
  }
  // Prefer the R2 custom domain (same as VideoMedia) when configured.
  if (MEDIA_URL && media.filename) {
    const path = media.filename
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')
    return getMediaUrl(`${MEDIA_URL}/${path}`, media.updatedAt)
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
            {...LENS}
          />
        </div>
      )}
    </div>
  )
}
