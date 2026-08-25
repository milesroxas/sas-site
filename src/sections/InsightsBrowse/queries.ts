import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Topics + posts backing the InsightsBrowse section — shared by /insights and
 * the deep-linked /insights/[topic] route so both render the same browse set.
 */
export const queryInsightsBrowseData = async () => {
  const payload = await getPayload({ config: configPromise })
  const [topics, posts] = await Promise.all([
    payload.find({
      collection: 'categories',
      overrideAccess: false,
      limit: 100,
      pagination: false,
      sort: 'title',
      select: { title: true, slug: true, description: true },
    }),
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      sort: '-publishedAt',
      select: { title: true, slug: true, categories: true, meta: true },
    }),
  ])
  return { topics: topics.docs, posts: posts.docs }
}
