import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import type { Where } from 'payload'
import { getPayload } from 'payload'
import type { Post } from '@/payload-types'

/**
 * Exactly what a post card reads. `depth: 1` populates `meta.image` and the
 * category titles behind it and nothing else.
 */
export const POST_CARD_SELECT = {
  title: true,
  slug: true,
  categories: true,
  meta: true,
  standfirst: true,
} as const

/** A post as the card queries return it: `POST_CARD_SELECT`, plus the id it keys on. */
export type PostCard = Pick<Post, 'id' | 'title' | 'slug' | 'categories' | 'meta' | 'standfirst'>

/**
 * Posts for a card list. The one query every post card on the site goes
 * through: outside draft mode it is published-only and runs with access
 * control on, so a post an editor picked or that matched a category but has
 * not published (or was unpublished) never reaches a public render. A draft
 * preview can still show drafts.
 */
export async function findPostCards({
  limit,
  sort = '-publishedAt',
  where,
}: {
  limit: number
  sort?: string
  where?: Where
}): Promise<PostCard[]> {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const clauses: Where[] = [
    ...(where ? [where] : []),
    ...(draft ? [] : [{ _status: { equals: 'published' as const } }]),
  ]

  const { docs } = await payload.find({
    collection: 'posts',
    depth: 1,
    draft,
    limit,
    overrideAccess: draft,
    pagination: false,
    select: POST_CARD_SELECT,
    sort,
    where: clauses.length ? { and: clauses } : undefined,
  })

  return docs
}

/**
 * Batch-load the posts an editor selected, keyed by id. Same draft rules as
 * `findPostCards`: the parent-populated selection is deliberately not used as
 * a fallback by callers, which is what keeps drafts off live pages.
 */
export async function findPostsById(
  ids: (number | string)[],
): Promise<Map<number | string, PostCard>> {
  if (!ids.length) return new Map()
  const docs = await findPostCards({ limit: ids.length, where: { id: { in: ids } } })
  return new Map(docs.map((doc) => [doc.id, doc]))
}

/** The editor's picks in the order they were picked, with anything the query dropped skipped. */
export async function findPostsInOrder(ids: (number | string)[]): Promise<PostCard[]> {
  const byId = await findPostsById(ids)
  return ids.flatMap((id) => {
    const doc = byId.get(id)
    return doc ? [doc] : []
  })
}
