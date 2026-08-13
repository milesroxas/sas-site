import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type React from 'react'
import type { CSSProperties } from 'react'
import { ArchiveRail } from '@/blocks/ArchiveBlock/ArchiveRail.client'
import { Card } from '@/components/Card'
import type { CardVariant } from '@/components/Card/variants'
import RichText from '@/components/RichText'
import type { Post } from '@/payload-types'

/**
 * Presentational layout for the Archive block: intro rich text above the
 * scroll-scrubbed `ArchiveRail` filmstrip of post cards. Split from the server
 * component (which fetches via the Payload Local API) so Storybook can render
 * the real markup with fixture posts.
 */
export const ArchiveLayout: React.FC<{
  cardVariant?: CardVariant | null
  id?: string
  introContent?: DefaultTypedEditorState | null
  posts: Post[]
}> = ({ cardVariant, id, introContent, posts }) => (
  <div className="my-16" id={id ? `block-${id}` : undefined}>
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
