import type { AeoContentSection } from './types'

/** Absolute URL for a section document, honoring the home-slug → root mapping. */
export const sectionDocUrl = (section: AeoContentSection, slug: string, siteUrl: string): string =>
  section.homeSlug && slug === section.homeSlug
    ? `${siteUrl}/`
    : `${siteUrl}${section.urlPrefix}/${slug}`

/**
 * The public content surfaces exposed to AI engines, in llms.txt order.
 * Mirrors the URL prefixes in src/plugins/index.ts (plugin-seo generateURL).
 */
export const AEO_CONTENT_SECTIONS: AeoContentSection[] = [
  { collection: 'pages', title: 'Pages', urlPrefix: '', homeSlug: 'home' },
  { collection: 'expertise-pages', title: 'Expertise', urlPrefix: '/expertise' },
  { collection: 'audience-pages', title: 'Who We Help', urlPrefix: '/who-we-help' },
  { collection: 'work-pages', title: 'Work', urlPrefix: '/works' },
  { collection: 'lab-pages', title: 'Lab', urlPrefix: '/lab' },
  {
    collection: 'posts',
    title: 'Insights',
    urlPrefix: '/posts',
    sort: '-publishedAt',
    fullContent: { richTextField: 'content' },
  },
]
