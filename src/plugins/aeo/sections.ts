import { CONTENT_SURFACES } from '@/shared/content/surfaces'
import type { AeoContentSection } from './types'

/** Absolute URL for a section document, honoring the home-slug → root mapping. */
export const sectionDocUrl = (section: AeoContentSection, slug: string, siteUrl: string): string =>
  section.homeSlug && slug === section.homeSlug
    ? `${siteUrl}/`
    : `${siteUrl}${section.urlPrefix}/${slug}`

/**
 * The public content surfaces exposed to AI engines, in llms.txt order —
 * derived from the shared content-surface registry so AEO, SEO, search, and
 * the Ask RAG corpus can never disagree about what is public.
 */
export const AEO_CONTENT_SECTIONS: AeoContentSection[] = CONTENT_SURFACES.map((surface) => ({
  collection: surface.collection,
  title: surface.title,
  urlPrefix: surface.urlPrefix,
  ...(surface.homeSlug ? { homeSlug: surface.homeSlug } : {}),
  ...(surface.sort ? { sort: surface.sort } : {}),
  ...(surface.body.kind === 'richText'
    ? { fullContent: { richTextField: surface.body.field } }
    : {}),
}))
