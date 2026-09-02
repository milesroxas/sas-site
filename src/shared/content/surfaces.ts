import type { CollectionSlug } from 'payload'
import { CONTACT_INDEX_SLUG } from '@/collections/ContactPages/constants'

/**
 * The single source of truth for the site's public content surfaces: which
 * collections publish to public URLs, under which prefix, and where each
 * document's reader-facing substance lives. Consumed by:
 *
 * - `plugins/index.ts` — plugin-seo `generateURL` and the search plugin's
 *   collection list
 * - `plugins/aeo/sections.ts` — llms.txt / llms-full.txt sections
 * - `features/ask` — retrieval corpus (search index + embeddings)
 *
 * Adding a new public collection here puts it on every surface at once.
 */

export type SurfaceBody =
  /** Substance is one richText field on the doc (e.g. Posts `content`). */
  | { kind: 'richText'; field: string }
  /**
   * Substance is spread across layout blocks / groups — extracted by the
   * generic walker in `extract.ts`. `canonicalField` names a relationship to
   * the Content Hub record that carries the narrative this page renders
   * (e.g. work-pages → case-studies); the walker hydrates and includes it.
   */
  | { kind: 'walk'; canonicalField?: { name: string; collection: CollectionSlug } }

export type ContentSurface = {
  collection: CollectionSlug
  /** Human section title (llms.txt H2, admin-facing labels). */
  title: string
  /** URL prefix the collection publishes under, e.g. '/expertise'. Empty string for root. */
  urlPrefix: string
  /** Slug that maps to the site root instead of `${urlPrefix}/${slug}`. */
  homeSlug?: string
  /**
   * Slug that maps to the prefix itself rather than a child of it, so the
   * primary contact page is `/contact` and not `/contact/contact`.
   */
  indexSlug?: string
  /** Payload sort order where listing order matters. Defaults to 'title'. */
  sort?: string
  body: SurfaceBody
}

export const CONTENT_SURFACES: ContentSurface[] = [
  { collection: 'pages', title: 'Pages', urlPrefix: '', body: { kind: 'walk' } },
  {
    collection: 'expertise-pages',
    title: 'Expertise',
    urlPrefix: '/expertise',
    body: { kind: 'walk' },
  },
  {
    collection: 'audience-pages',
    title: 'Who We Help',
    urlPrefix: '/who-we-help',
    body: { kind: 'walk' },
  },
  {
    collection: 'work-pages',
    title: 'Work',
    urlPrefix: '/works',
    body: { kind: 'walk', canonicalField: { name: 'caseStudy', collection: 'case-studies' } },
  },
  {
    collection: 'lab-pages',
    title: 'Lab',
    urlPrefix: '/lab',
    body: { kind: 'walk', canonicalField: { name: 'labProject', collection: 'lab-projects' } },
  },
  {
    collection: 'contact-pages',
    title: 'Contact',
    urlPrefix: '/contact',
    indexSlug: CONTACT_INDEX_SLUG,
    body: { kind: 'walk' },
  },
  {
    collection: 'posts',
    title: 'Insights',
    urlPrefix: '/posts',
    sort: '-publishedAt',
    body: { kind: 'richText', field: 'content' },
  },
]

export const surfaceByCollection: ReadonlyMap<string, ContentSurface> = new Map(
  CONTENT_SURFACES.map((surface) => [surface.collection as string, surface]),
)

/** Collections synced into the `search` index (and the RAG corpus). */
export const SEARCH_COLLECTIONS = CONTENT_SURFACES.map((surface) => surface.collection)

/** Site-relative path for a surface document, honoring the home-slug → root mapping. */
export const surfaceDocPath = (surface: ContentSurface, slug: string): string => {
  if (surface.homeSlug && slug === surface.homeSlug) return '/'
  if (surface.indexSlug && slug === surface.indexSlug) return surface.urlPrefix
  return `${surface.urlPrefix}/${slug}`
}
