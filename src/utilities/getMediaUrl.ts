/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 *
 * Local paths (e.g. `/api/media/file/image.webp`) are kept relative so
 * Next.js image optimization treats them as local rather than fetching
 * through `remotePatterns`, which blocks private IPs since Next.js 16.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  return cacheTag ? `${url}?${cacheTag}` : url
}

/**
 * R2 custom domain (edge-cached, one-year Cache-Control, zero egress). Empty
 * when unset so callers fall back to Payload's `/api/media/file/...` route.
 * Exported for the root layout's `preconnect`; media components should go
 * through `getCdnMediaUrl`.
 */
export const MEDIA_URL = (process.env.NEXT_PUBLIC_MEDIA_URL || '').replace(/\/$/, '')

/**
 * Public CDN URL for a media object key, or `''` when no CDN host is configured.
 *
 * Every media consumer should prefer this over `resource.url`: the Payload
 * file route is a Vercel function (cold start, `max-age=0`) in front of the
 * same bytes, and the Next image optimizer keys its cache on the source URL,
 * so a CDN source is cached for the object's lifetime instead of per minute.
 */
export const getCdnMediaUrl = (
  filename: string | null | undefined,
  cacheTag?: string | null,
): string => {
  if (!MEDIA_URL || !filename) return ''
  // Object keys may contain spaces; encode each path segment.
  const path = filename
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return getMediaUrl(`${MEDIA_URL}/${path}`, cacheTag)
}
