import { findPostCards, findPostsInOrder, type PostCard } from '@/blocks/shared/find-posts'
import type { CardPostData } from '@/components/Card'
import type { Post } from '@/payload-types'
import { relationshipIds } from '@/utilities/relationshipId'

/**
 * Rail length when the editor picked nothing: one row of three square tiles,
 * the insights art direction's closing row. A longer hand-picked list still
 * gets the drag rail (`PostRail`).
 */
export const RELATED_POSTS_FALLBACK_LIMIT = 3

/** Drops the docs a depth-starved or unpublished query left without a slug. */
const railCard = (post: PostCard): CardPostData | null => (post.slug ? post : null)

/**
 * Post closer: the Related Posts tab's picks in the editor's order, with
 * unpublished ones skipped. If nothing is selected, or nothing selected is
 * public, the most recently published posts, excluding this one.
 *
 * Both lists come from `findPostCards` (blocks/shared/find-posts), which is
 * published-only outside draft mode; the parent-populated selection is never
 * used as a fallback, which is what keeps drafts off live pages.
 *
 * Mirrors `resolveRelatedWorkEntries` (blocks/featured-work/resolve-entries),
 * which is the same contract on the work side.
 */
export async function resolveRelatedPosts(post: Post): Promise<CardPostData[]> {
  if (post.hideRelatedPosts) return []

  const ids = relationshipIds(post.relatedPosts ?? [])
  if (ids.length) {
    const picks = (await findPostsInOrder(ids))
      .map(railCard)
      .filter((card): card is CardPostData => card !== null)
    if (picks.length) return picks
  }

  const recent = await findPostCards({
    limit: RELATED_POSTS_FALLBACK_LIMIT,
    where: { id: { not_equals: post.id } },
  })
  return recent.map(railCard).filter((card): card is CardPostData => card !== null)
}
