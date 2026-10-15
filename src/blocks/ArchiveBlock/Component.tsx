import type React from 'react'
import { ArchiveLayout } from '@/blocks/ArchiveBlock/ArchiveLayout'
import { findPostCards, findPostsInOrder, type PostCard } from '@/blocks/shared/find-posts'
import type { ArchiveBlock as ArchiveBlockProps } from '@/payload-types'
import { relationshipIds } from '@/utilities/relationshipId'

/**
 * The Archive block's posts, by collection filter or by the editor's picks.
 * Both go through `findPostCards` (blocks/shared/find-posts), so outside draft
 * mode an unpublished post never shows as a card: the picks are re-queried
 * rather than read off the parent document, the same rule the post closer and
 * the featured-work list follow.
 */
export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    cardVariant,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    theme,
  } = props

  const limit = limitFromProps || 3

  let posts: PostCard[] = []

  if (populateBy === 'collection') {
    const categoryIds = relationshipIds(categories ?? [])
    posts = await findPostCards({
      limit,
      where: categoryIds.length ? { categories: { in: categoryIds } } : undefined,
    })
  } else {
    posts = await findPostsInOrder(relationshipIds((selectedDocs ?? []).map((doc) => doc.value)))
  }

  return (
    <ArchiveLayout
      cardVariant={cardVariant}
      id={id}
      introContent={introContent}
      posts={posts}
      theme={theme}
    />
  )
}
