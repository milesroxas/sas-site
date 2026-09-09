import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { IndexFilterOption } from '@/sections/Browse'
import type { InsightsBrowsePost } from './index'

export type InsightsBrowseData = {
  posts: InsightsBrowsePost[]
  topics: IndexFilterOption[]
}

/**
 * Topics + posts backing the InsightsBrowse section, shared by /insights,
 * /posts, and the deep-linked /insights/[topic] route so all render the same
 * browse set. Topics arrive as filter options; one with no slug has no route
 * and is dropped.
 */
export const queryInsightsBrowseData = async (): Promise<InsightsBrowseData> => {
  const payload = await getPayload({ config: configPromise })
  const [topics, posts] = await Promise.all([
    payload.find({
      collection: 'categories',
      overrideAccess: false,
      limit: 100,
      pagination: false,
      sort: 'title',
      select: { title: true, slug: true },
    }),
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      sort: '-publishedAt',
      select: { title: true, slug: true, categories: true, meta: true, publishedAt: true },
    }),
  ])
  return {
    topics: topics.docs.flatMap(({ slug, title }) => (slug ? [{ slug, label: title }] : [])),
    posts: posts.docs,
  }
}
