import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import type { CollectionSlug, DataFromCollectionSlug, Payload } from 'payload'
import { getPayload } from 'payload'
import { cache } from 'react'
import { generateMeta } from './generateMeta'

/**
 * Shared plumbing for the `[slug]` routes over slug-addressed collections
 * (work, lab, expertise, audience pages). They differ in which collection they
 * read, how deep, and what they render — never in how a slug becomes a
 * document, so that part lives here.
 */

/** Props Next passes to a `[slug]` route segment. */
export type SlugRouteArgs = { params: Promise<{ slug: string }> }

type FindOptions = Parameters<Payload['find']>[0]

/**
 * `generateStaticParams` over every published slug in a collection. Drafts are
 * excluded and access is enforced, so unpublished pages are not prerendered.
 */
export function slugStaticParams(collection: CollectionSlug) {
  return async () => {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection,
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: { slug: true },
    })
    // Not every collection in the union declares `slug`; the caller always
    // passes one that does, and a doc without one has no route to prerender.
    return (result.docs as { slug?: string | null }[]).flatMap(({ slug }) =>
      slug ? [{ slug }] : [],
    )
  }
}

/**
 * A draft-aware, request-cached lookup of one document by slug. Call it once
 * per route at module scope: the page body and `generateMetadata` then share a
 * single query per request instead of hitting the database twice.
 */
export function createSlugQuery<C extends CollectionSlug>(
  collection: C,
  { depth, populate }: { depth: number; populate?: FindOptions['populate'] },
) {
  return cache(async (slug: string): Promise<DataFromCollectionSlug<C> | null> => {
    const { isEnabled: draft } = await draftMode()
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection,
      draft,
      depth,
      limit: 1,
      pagination: false,
      ...(populate ? { populate } : {}),
      overrideAccess: draft,
      where: { slug: { equals: slug } },
    })
    return (result.docs[0] as DataFromCollectionSlug<C> | undefined) || null
  })
}

/**
 * `generateMetadata` for a `[slug]` route, resolving the document through the
 * route's own cached query so the page render reuses it.
 */
export function slugMetadata(
  basePath: string,
  query: (slug: string) => Promise<Parameters<typeof generateMeta>[0]['doc']>,
) {
  return async ({ params }: SlugRouteArgs): Promise<Metadata> => {
    const { slug } = await params
    const decodedSlug = decodeURIComponent(slug)
    return generateMeta({ doc: await query(decodedSlug), pathname: `${basePath}/${decodedSlug}` })
  }
}
