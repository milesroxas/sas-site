import type {
  BlogPosting,
  BreadcrumbList,
  CreativeWork,
  Organization,
  Service,
  WebSite,
  WithContext,
} from 'schema-dts'
import type { ExpertisePage, LabPage, Media, Post, SiteInfo, WorkPage } from '@/payload-types'
import { getServerSideURL } from './getURL'

const ORG_ID = '#organization'
const WEBSITE_ID = '#website'

const mediaUrl = (media?: Media | number | null): string | undefined => {
  if (!media || typeof media !== 'object' || !media.url) return undefined
  return `${getServerSideURL()}${media.url}`
}

/**
 * Site-wide entity anchor. Rendered once in the root layout. The sameAs
 * profile links are what let AI engines reconcile the brand across the web —
 * keep them populated in the Site Info global.
 */
export const organizationSchema = (siteInfo: Partial<SiteInfo>): WithContext<Organization> => {
  const siteUrl = getServerSideURL()
  const { address } = siteInfo
  const hasAddress = Boolean(address?.streetAddress && address?.city)

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/${ORG_ID}`,
    name: siteInfo.name || 'Suits & Sandals',
    ...(siteInfo.legalName ? { legalName: siteInfo.legalName } : {}),
    url: siteUrl,
    ...(siteInfo.tagline || siteInfo.description
      ? { description: siteInfo.description || siteInfo.tagline || undefined }
      : {}),
    ...(siteInfo.foundingYear ? { foundingDate: String(siteInfo.foundingYear) } : {}),
    ...(siteInfo.contactEmail ? { email: siteInfo.contactEmail } : {}),
    ...(mediaUrl(siteInfo.logo) ? { logo: mediaUrl(siteInfo.logo) } : {}),
    ...(hasAddress
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: address?.streetAddress ?? undefined,
            addressLocality: address?.city ?? undefined,
            addressRegion: address?.state ?? undefined,
            postalCode: address?.postalCode ?? undefined,
            addressCountry: address?.country ?? undefined,
          },
        }
      : {}),
    ...(siteInfo.socialProfiles?.length
      ? { sameAs: siteInfo.socialProfiles.map((profile) => profile.url) }
      : {}),
  }
}

export const webSiteSchema = (siteInfo: Partial<SiteInfo>): WithContext<WebSite> => {
  const siteUrl = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/${WEBSITE_ID}`,
    url: siteUrl,
    name: siteInfo.name || 'Suits & Sandals',
    ...(siteInfo.tagline ? { description: siteInfo.tagline } : {}),
    publisher: { '@id': `${siteUrl}/${ORG_ID}` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      // Required by schema.org for SearchAction; not in schema-dts typings.
      'query-input': 'required name=search_term_string',
    } as WithContext<WebSite>['potentialAction'],
  }
}

export const blogPostingSchema = (post: Post): WithContext<BlogPosting> => {
  const siteUrl = getServerSideURL()
  const url = `${siteUrl}/posts/${post.slug}`
  const image = mediaUrl(post.meta?.image) ?? mediaUrl(post.heroImage)
  const authors = (post.populatedAuthors ?? []).filter((author) => Boolean(author.name))

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.meta?.description ? { description: post.meta.description } : {}),
    url,
    mainEntityOfPage: url,
    ...(image ? { image } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    ...(authors.length
      ? {
          author: authors.map((author) => ({
            '@type': 'Person' as const,
            name: author.name as string,
          })),
        }
      : {}),
    publisher: { '@id': `${siteUrl}/${ORG_ID}` },
  }
}

export const serviceSchema = (page: ExpertisePage): WithContext<Service> => {
  const siteUrl = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.title,
    serviceType: page.title,
    ...(page.meta?.description ? { description: page.meta.description } : {}),
    url: `${siteUrl}/expertise/${page.slug}`,
    provider: { '@id': `${siteUrl}/${ORG_ID}` },
  }
}

export const creativeWorkSchema = (
  page: WorkPage | LabPage,
  basePath: '/works' | '/lab',
): WithContext<CreativeWork> => {
  const siteUrl = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: page.title,
    ...(page.meta?.description ? { description: page.meta.description } : {}),
    url: `${siteUrl}${basePath}/${page.slug}`,
    creator: { '@id': `${siteUrl}/${ORG_ID}` },
    ...(page.publishedAt ? { datePublished: page.publishedAt } : {}),
    dateModified: page.updatedAt,
  }
}

export const breadcrumbSchema = (
  items: { name: string; path: string }[],
): WithContext<BreadcrumbList> => {
  const siteUrl = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  }
}
