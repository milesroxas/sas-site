/**
 * Single source for the site's CMS-link URL scheme: reference links resolve
 * through the content-surfaces registry (pages at the root, posts under
 * `/posts`, contact pages under `/contact` with the index slug at `/contact`
 * itself), site pages map to their singleton global's public path, custom
 * links pass their URL through. Shared by CMSLink and any surface that
 * reduces link fields to plain data (demo shell sidebar).
 */
import { SITE_PAGE_HREFS, type SitePage } from '@/fields/sitePages'
import { surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'

const isSitePage = (value: string | null | undefined): value is SitePage =>
  value != null && value in SITE_PAGE_HREFS

export function resolveCmsLinkHref(link: {
  type?: 'custom' | 'reference' | 'site' | null
  reference?: {
    relationTo: string
    value: { slug?: string | null } | string | number
  } | null
  sitePage?: SitePage | null
  url?: string | null
}): string | null {
  const { type, reference, sitePage, url } = link
  if (type === 'site' && isSitePage(sitePage)) {
    return SITE_PAGE_HREFS[sitePage]
  }
  if (type === 'reference' && typeof reference?.value === 'object' && reference.value.slug) {
    const surface = surfaceByCollection.get(reference.relationTo)
    if (surface) return surfaceDocPath(surface, reference.value.slug)
    return `${reference.relationTo !== 'pages' ? `/${reference.relationTo}` : ''}/${reference.value.slug}`
  }
  return url ?? null
}
