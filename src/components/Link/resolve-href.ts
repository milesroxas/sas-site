/**
 * Single source for the site's CMS-link URL scheme: reference links resolve to
 * `/{relationTo}/{slug}` (pages collection maps to the root), custom links pass
 * their URL through. Shared by CMSLink and any surface that reduces link
 * fields to plain data (demo shell sidebar).
 */
export function resolveCmsLinkHref(link: {
  type?: 'custom' | 'reference' | null
  reference?: {
    relationTo: string
    value: { slug?: string | null } | string | number
  } | null
  url?: string | null
}): string | null {
  const { type, reference, url } = link
  if (type === 'reference' && typeof reference?.value === 'object' && reference.value.slug) {
    return `${reference.relationTo !== 'pages' ? `/${reference.relationTo}` : ''}/${reference.value.slug}`
  }
  return url ?? null
}
