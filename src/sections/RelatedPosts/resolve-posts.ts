import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import type { CardPostData } from '@/components/Card'
import type { Post } from '@/payload-types'
import { relationshipIds } from '@/utilities/relationshipId'

/**
 * Exactly what the rail's card reads. `depth: 1` populates `meta.image` and
 * the category titles behind it and nothing else.
 */
const RAIL_SELECT = { title: true, slug: true, categories: true, meta: true } as const

/** A post as the rail query returns it — `RAIL_SELECT`, plus the id it keys on. */
type RailPost = Pick<Post, 'id' | 'title' | 'slug' | 'categories' | 'meta'>

/**
 * Rail length when the editor picked nothing. Wider than the work closer's
 * four because this rail shows two and a half at once — a list that ends at
 * the fold has nothing for the drag affordance to reveal.
 */
export const RELATED_POSTS_FALLBACK_LIMIT = 8

/** Drops the docs a depth-starved or unpublished query left without a slug. */
const railCard = (post: RailPost): CardPostData | null => (post.slug ? post : null)

/**
 * Batch-load the posts an editor selected, keyed by id.
 *
 * Outside draft mode the query is published-only and runs with access control
 * on, so a post the editor picked but has not published never reaches a public
 * render — the parent-populated selection is deliberately not used as a
 * fallback here, which is what keeps drafts off live pages.
 */
async function findPostsById(ids: (number | string)[]): Promise<Map<number | string, RailPost>> {
  if (!ids.length) return new Map()

  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'posts',
    depth: 1,
    draft,
    limit: ids.length,
    overrideAccess: draft,
    pagination: false,
    select: RAIL_SELECT,
    where: {
      id: { in: ids },
      ...(draft ? {} : { _status: { equals: 'published' } }),
    },
  })

  return new Map(docs.map((doc) => [doc.id, doc]))
}

/** Most recently published posts, excluding `excludeId`. Same draft rules. */
async function findRecentPosts(excludeId: number | string): Promise<RailPost[]> {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'posts',
    depth: 1,
    draft,
    limit: RELATED_POSTS_FALLBACK_LIMIT,
    overrideAccess: draft,
    select: RAIL_SELECT,
    sort: '-publishedAt',
    where: {
      and: [
        { id: { not_equals: excludeId } },
        ...(draft ? [] : [{ _status: { equals: 'published' as const } }]),
      ],
    },
  })

  return docs
}

/**
 * Post closer: the Related Posts tab's picks in the editor's order, with
 * unpublished ones skipped. If nothing is selected — or nothing selected is
 * public — the most recently published posts, excluding this one.
 *
 * Mirrors `resolveRelatedWorkEntries` (blocks/featured-work/resolve-entries),
 * which is the same contract on the work side.
 */
export async function resolveRelatedPosts(post: Post): Promise<CardPostData[]> {
  if (post.hideRelatedPosts) return []

  const ids = relationshipIds(post.relatedPosts ?? [])
  if (ids.length) {
    const byId = await findPostsById(ids)
    const picks = ids
      .map((id) => byId.get(id))
      .filter((doc): doc is RailPost => doc !== undefined)
      .map(railCard)
      .filter((card): card is CardPostData => card !== null)
    if (picks.length) return picks
  }

  const recent = await findRecentPosts(post.id)
  return recent.map(railCard).filter((card): card is CardPostData => card !== null)
}
