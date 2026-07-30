'use client'

import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Media } from '@/components/Media'
import { RefractionMedia, type RefractionSource } from '@/features/immersive'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import type { Media as MediaType } from '@/payload-types'
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

/**
 * Hero backdrop: the ordinary `Media` element paints first (keeping the
 * image's `priority` preload and LCP behaviour intact), then a WebGL canvas
 * samples that very element as its texture and fades in on top. Nothing is
 * downloaded twice, and the DOM layer stays mounted underneath as the fallback
 * for reduced motion, touch, absent GPUs and lost contexts.
 *
 * Cross-origin media must be fetched with CORS to be sampleable. That is set
 * from the first render (flipping it later leaves a tainted resource). If the
 * host does not allow CORS the element fails to load — that error is caught
 * and the whole thing degrades to a plain, uncredentialed media element with
 * no WebGL overlay (otherwise the canvas would fade in black over the image).
 */
export const HeroBackground: React.FC<{ media: MediaType }> = ({ media }) => {
  const { hasGPU } = useDeviceDetection()
  const containerRef = useRef<HTMLDivElement>(null)
  const [source, setSource] = useState<RefractionSource | null>(null)
  const [ready, setReady] = useState(false)
  const [corsBlocked, setCorsBlocked] = useState(false)

  const isVideo = Boolean(media.mimeType?.includes('video'))
  const enabled = hasGPU && !corsBlocked

  // Must be present on the element's first fetch — independent of GPU
  // detection, which only resolves after mount.
  const crossOrigin = !corsBlocked ? 'anonymous' : undefined

  useEffect(() => {
    if (!enabled) {
      setSource(null)
      setReady(false)
      return
    }
    const root = containerRef.current
    if (!root) return

    const pick = () => root.querySelector(isVideo ? 'video' : 'img')

    const found = pick()
    if (found) {
      setSource(found)
      return
    }

    // Media remounts when CORS mode changes; wait for the new element.
    const observer = new MutationObserver(() => {
      const next = pick()
      if (next) {
        setSource(next)
        observer.disconnect()
      }
    })
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [enabled, isVideo, crossOrigin])

  useEffect(() => {
    const root = containerRef.current
    if (!root || corsBlocked) return
    const handleError = () => setCorsBlocked(true)

    // A rejected request often lands before this effect runs, leaving no event
    // to catch — only the settled state.
    if (isVideo) {
      const video = root.querySelector('video')
      if (video?.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        handleError()
        return
      }
    } else {
      const image = root.querySelector('img')
      if (image?.complete && image.naturalWidth === 0) {
        handleError()
        return
      }
    }

    // Media `error` events do not bubble, but the capture phase still sees
    // them (video/source or img).
    root.addEventListener('error', handleError, true)
    return () => root.removeEventListener('error', handleError, true)
  }, [isVideo, corsBlocked, crossOrigin])

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
