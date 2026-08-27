import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import { ArchiveLayout } from '@/blocks/ArchiveBlock/ArchiveLayout'
import type { ArchiveBlock as ArchiveBlockProps, Post } from '@/payload-types'

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

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      posts = selectedDocs
        .map((post) => (typeof post.value === 'object' ? post.value : undefined))
        .filter((p): p is Post => p !== undefined)
    }
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
