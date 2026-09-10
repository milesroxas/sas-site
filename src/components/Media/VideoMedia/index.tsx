'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { preload } from 'react-dom'
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

/**
 * How far ahead of the viewport a gated video attaches its source. Two
 * screens: reading pace on a case study means a ~1 MB loop always lands
 * before the eye does, and nothing eight screens down competes with the hero.
 */
const SOURCE_ROOT_MARGIN = '200% 0px'

/**
 * Viewport gate for self-playing videos (`autoPlay`, no `priority`).
 *
 * `near` is one-shot: once the source is attached it stays attached, so a
 * reader scrolling back never re-downloads. `visible` toggles with the
 * element's own box and drives play/pause, so a loop parked off screen does
 * not spend decode time behind the article. Without `IntersectionObserver`
 * (old engines, jsdom) both open at once and the element behaves as before.
 */
const useViewportGate = (ref: React.RefObject<HTMLVideoElement | null>, enabled: boolean) => {
  const [near, setNear] = useState(!enabled)
  const [visible, setVisible] = useState(!enabled)

  useEffect(() => {
    if (!enabled) return
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver !== 'function') {
      setNear(true)
      setVisible(true)
      return
    }
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setNear(true)
        nearObserver.disconnect()
      },
      { rootMargin: SOURCE_ROOT_MARGIN },
    )
    const visibleObserver = new IntersectionObserver(([entry]) => {
      setVisible(entry?.isIntersecting ?? false)
    })
    nearObserver.observe(node)
    visibleObserver.observe(node)
    return () => {
      nearObserver.disconnect()
      visibleObserver.disconnect()
    }
  }, [enabled, ref])

  return { near, visible }
}

/**
 * VideoMedia
 *
 * Three loading modes, chosen by the caller's props:
 *
 * - `priority` (hero): the source is in the server HTML with `preload="auto"`
 *   and the poster is preloaded at high priority, so the LCP frame paints as
 *   early as the browser allows. The takeover menu clones this element and
 *   reads its `currentTime` for the handoff, so it must be a complete, playing
 *   `<video>` from the first render.
 * - `autoPlay` (default, inline loops): viewport gated. The server HTML
 *   carries the poster only; the source attaches two screens ahead and
 *   playback follows the element in and out of view.
 * - `autoPlay={false}` (Carousel): an external controller owns `play()` and
 *   reads `readyState`, so the source is attached eagerly with metadata
 *   preload and nothing here touches playback.
 */
export const VideoMedia: React.FC<MediaProps> = (props) => {
  const {
    autoPlay = true,
    crossOrigin,
    fill,
    imgClassName,
    onClick,
    priority = false,
    resource,
    videoClassName,
  } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  const gated = autoPlay && !priority
  const { near, visible } = useViewportGate(videoRef, gated)

  const populated = resource && typeof resource === 'object' ? resource : null
  const src = populated
    ? getCdnMediaUrl(populated.filename, populated.updatedAt) ||
      getMediaUrl(populated.url, populated.updatedAt)
    : ''
  // poster may be a populated media doc or an unresolved id — only usable when populated.
  const poster = getVideoPosterUrl(populated)

  // Hero poster: the LCP candidate. Hoisted to <head> during SSR, deduped on
  // the client. Image heroes get the same from next/image's own `priority`.
  if (priority && poster) {
    preload(poster, { as: 'image', fetchPriority: 'high' })
  }

  // Gated playback. `autoPlay` stays on the element so the browser starts the
  // loop itself once the source lands in view; this effect only handles the
  // element leaving and re-entering after that.
  useEffect(() => {
    if (!gated || !near) return
    const video = videoRef.current
    if (!video) return
    if (visible) {
      if (video.paused) void video.play().catch(() => {})
    } else if (!video.paused) {
      video.pause()
    }
  }, [gated, near, visible])

  if (!src) {
    return null
  }

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
      preload={priority ? 'auto' : gated ? 'none' : 'metadata'}
      ref={videoRef}
    >
      {(!gated || near) && <source src={src} type={populated?.mimeType || undefined} />}
    </video>
  )
}
