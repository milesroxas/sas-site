import type React from 'react'
import { Section } from '@/blocks/shared/section'
import type { CardPostData } from '@/components/Card'
import { PostRail } from './PostRail.client'

/**
 * Standing copy above the rail. One line for every post, so it lives here
 * rather than in the CMS — an editor choosing what the rail *lists* is the
 * Related Posts tab's job; this sentence is site voice.
 */
export const RELATED_POSTS_HEADING = 'Insights from SAS thinking on brand, clarity, and craft.'

/**
 * The rail every post ends with: the Related Posts tab's picks, else the most
 * recent posts. Resolve the list with `resolveRelatedPosts`, which also honours
 * the tab's hide checkbox by returning nothing.
 */
export const RelatedPostsSection: React.FC<{
  heading?: string
  posts: CardPostData[]
}> = ({ heading = RELATED_POSTS_HEADING, posts }) => {
  if (posts.length === 0) return null

  return (
    <Section spacing="normal">
      <PostRail heading={heading} posts={posts} />
    </Section>
  )
}
