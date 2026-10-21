import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache.js'
import type { CollectionSlug } from 'payload'
import { getPayload } from 'payload'

/**
 * The set of published slugs per slug-addressed collection, held in the data
 * cache under the collection's sitemap tag. The route handlers look a slug up
 * here before they query Postgres, so a path that no document owns (crawlers
 * probing `/wp-login.php` and friends, most of the night) answers 404 without
 * waking the database. Every publish, unpublish, delete and slug change purges
 * the tag (`slugPageRevalidation`), so a page published over MCP is reachable
 * on its next request.
 */
export const SLUG_SET_TAGS = {
  pages: 'pages-sitemap',
  posts: 'posts-sitemap',
  'work-pages': 'works-sitemap',
  'lab-pages': 'lab-sitemap',
  'expertise-pages': 'expertise-sitemap',
  'audience-pages': 'who-we-help-sitemap',
  'contact-pages': 'pages-sitemap',
} as const satisfies Partial<Record<CollectionSlug, string>>

export type SlugCollection = keyof typeof SLUG_SET_TAGS

async function fetchPublishedSlugs(collection: SlugCollection): Promise<string[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return (result.docs as { slug?: string | null }[]).flatMap(({ slug }) => (slug ? [slug] : []))
}

const getCachedPublishedSlugs = (collection: SlugCollection) =>
  unstable_cache(() => fetchPublishedSlugs(collection), ['published-slugs', collection], {
    tags: [SLUG_SET_TAGS[collection]],
  })

/** Whether a published document in `collection` owns `slug`, from the cache. */
export async function isPublishedSlug(collection: SlugCollection, slug: string): Promise<boolean> {
  const slugs = await getCachedPublishedSlugs(collection)()
  return slugs.includes(slug)
}
