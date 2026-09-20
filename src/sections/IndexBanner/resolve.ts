import { resolveCmsLinkHref } from '@/components/Link/resolve-href'
import { resolveVisual, type Visual } from '@/features/immersive/visual'
import type { IndexBanner as StoredIndexBanner } from '@/payload-types'

/** The banner as the client renders it: copy, a resolved href, a resolved visual. */
export type IndexBannerData = {
  heading: string
  body: string | null
  link: { href: string; label: string; newTab: boolean }
  /** The slab's background; `null` is the plain dark slab. */
  visual: Visual | null
}

/**
 * Resolve the stored banner once, at the server boundary. The link is reduced
 * to its href here so a populated reference document never crosses to the
 * client. `null` whenever there is nothing complete to show: the switch is
 * off, or the heading or a working link is missing.
 */
export const resolveIndexBanner = (
  banner: StoredIndexBanner | null | undefined,
  /** Stable identity a missing seed derives from: the global's slug. */
  seedKey: string,
): IndexBannerData | null => {
  if (!banner?.show) return null
  const heading = banner.heading?.trim()
  const label = banner.link?.label?.trim()
  const href = banner.link ? resolveCmsLinkHref(banner.link) : null
  if (!heading || !label || !href) return null
  return {
    heading,
    body: banner.body?.trim() || null,
    link: { href, label, newTab: banner.link?.newTab === true },
    visual: resolveVisual(banner, { seedKey: `${seedKey}-banner` }),
  }
}
