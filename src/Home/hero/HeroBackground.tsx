'use client'

import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Media } from '@/components/Media'
import { RefractionMedia, type RefractionSource } from '@/features/immersive'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import type { Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/ui'

/**
 * Dialed in on /demo/immersive. `edge: 0` is an edgeless gaussian falloff —
 * the refraction, chroma, noise and smear all still apply, but the lens itself
 * has no visible rim or boundary, so `feather` and `highlight` are left off.
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
  follow: 6.5,
  ease: 4.5,
} as const

/**
 * Hero backdrop: the ordinary `Media` element paints first (keeping the
 * image's `priority` preload and LCP behaviour intact), then a WebGL canvas
 * samples that very element as its texture and fades in on top. Nothing is
 * downloaded twice, and the DOM layer stays mounted underneath as the fallback
 * for reduced motion, touch, absent GPUs and lost contexts.
 *
 * Videos are read from the R2 custom domain, so they need CORS to be
 * sampleable. If the host does not allow it the element fails to load — that
 * error is caught and the whole thing degrades to a plain, uncredentialed video.
 */
export const HeroBackground: React.FC<{ media: MediaType }> = ({ media }) => {
  const { hasGPU } = useDeviceDetection()
  const containerRef = useRef<HTMLDivElement>(null)
  const [source, setSource] = useState<RefractionSource | null>(null)
  const [ready, setReady] = useState(false)
  const [corsBlocked, setCorsBlocked] = useState(false)

  const isVideo = Boolean(media.mimeType?.includes('video'))
  const enabled = hasGPU && !corsBlocked

  // `crossOrigin` has to be on the element from its very first render: flipping
  // it after the fetch has begun would leave an already-tainted resource in
  // place. It is therefore set independently of GPU detection, which only
  // resolves after mount.
  const crossOrigin = isVideo && !corsBlocked ? 'anonymous' : undefined

  useEffect(() => {
    if (!enabled) {
      setSource(null)
      return
    }
    // Swapping one image for another reuses the same node, so only a change of
    // media type needs a fresh lookup.
    setSource(containerRef.current?.querySelector(isVideo ? 'video' : 'img') ?? null)
  }, [enabled, isVideo])

  useEffect(() => {
    const root = containerRef.current
    if (!root || !isVideo || corsBlocked) return
    const handleError = () => setCorsBlocked(true)

    // A rejected request often lands before this effect runs, leaving no event
    // to catch — only the settled state.
    const video = root.querySelector('video')
    if (video?.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      handleError()
      return
    }

    // Media `error` events do not bubble, but the capture phase still sees
    // them, on both the <video> and the <source> child that actually fails.
    root.addEventListener('error', handleError, true)
    return () => root.removeEventListener('error', handleError, true)
  }, [isVideo, corsBlocked])

  const handleReady = useCallback(() => setReady(true), [])

  return (
    <div
      aria-hidden
      // Opacity belongs to the group rather than the layers: at 85% each, the
      // undistorted DOM media would show through the canvas covering it.
      className="pointer-events-none absolute inset-0 -z-10 opacity-85"
      ref={containerRef}
    >
      <Media
        // Dropping CORS has to remount the element; changing the attribute
        // alone would not make the browser re-request the file.
        key={crossOrigin ?? 'plain'}
        crossOrigin={crossOrigin}
        fill
        htmlElement={null}
        imgClassName="object-cover select-none"
        priority
        resource={media}
        size="100vw"
      />

      {enabled && source && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            ready ? 'opacity-100' : 'opacity-0',
          )}
        >
          <RefractionMedia className="size-full" onReady={handleReady} source={source} {...LENS} />
        </div>
      )}
    </div>
  )
}
