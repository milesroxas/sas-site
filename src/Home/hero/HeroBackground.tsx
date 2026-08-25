'use client'

import type React from 'react'
import { Media } from '@/components/Media'
import { HERO_LENS, RefractionMedia, useWebglMediaLayer } from '@/features/immersive'
import type { Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { webglMediaSrc } from '@/utilities/webglMediaSrc'

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
  const isVideo = Boolean(media.mimeType?.includes('video'))
  const src = webglMediaSrc(media) || undefined
  const { enabled, ready, handleReady } = useWebglMediaLayer(src)

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
