import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type React from 'react'
import type { CSSProperties } from 'react'
import { ArchiveRail } from '@/blocks/ArchiveBlock/ArchiveRail.client'
import { Card } from '@/components/Card'
import RichText from '@/components/RichText'
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
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-8 md:mb-12 lg:mb-16">
          <RichText className="ms-0 max-w-3xl" data={introContent} enableGutter={false} />
        </div>
      )}
      {/* Vertical scroll scrubs this filmstrip horizontally (native x-scroll if reduced motion). */}
      <ArchiveRail>
        {/* Editorial offset — desktop cards start a quarter-card in from the heading. */}
        <div aria-hidden className="hidden w-24 shrink-0 lg:block" />
        {posts.map((post, index) => (
          <div
            className="reveal-stagger-item w-80 shrink-0 lg:w-100"
            key={post.id}
            style={{ '--stagger': index } as CSSProperties}
          >
            <Card
              className="h-full"
              doc={post}
              relationTo="posts"
              showCategories
              variant={cardVariant ?? undefined}
            />
          </div>
        ))}
      </ArchiveRail>
    </div>
  )
}
