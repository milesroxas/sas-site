import type { Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

/**
 * URL for loading a Payload media doc as a WebGL texture (crossOrigin fetch),
 * shared by every consumer that paints DOM media first and layers a canvas
 * with the same pixels on top (home hero, IndustryWork media).
 */
export const webglMediaSrc = (media: Media): string => {
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
