import type { Footer, Header } from '@/payload-types'
import type { DemoSiteLink } from './demo-site'

/** Header navItems / footer getInTouch link group, as stored by Payload. */
export type CmsLinkField = NonNullable<Header['navItems']>[number]['link'] | Footer['getInTouch']

/**
 * CMSLink's href resolution (components/Link), reduced to plain data so the
 * demo layout can hand site links to the client-side shell sidebar.
 */
export function toSiteLink(link: CmsLinkField | null | undefined): DemoSiteLink | null {
  if (!link) return null
  const href =
    link.type === 'reference' &&
    typeof link.reference?.value === 'object' &&
    link.reference.value.slug
      ? `${link.reference.relationTo !== 'pages' ? `/${link.reference.relationTo}` : ''}/${link.reference.value.slug}`
      : (link.url ?? null)
  return href ? { label: link.label, href, newTab: Boolean(link.newTab) } : null
}
