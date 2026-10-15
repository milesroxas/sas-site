import { slugPageRevalidation } from '@/hooks/revalidateSlugPage'
import type { Post } from '@/payload-types'

export const { afterChange: revalidatePost, afterDelete: revalidateDelete } =
  slugPageRevalidation<Post>({
    basePath: '/posts',
    // Where a post shows as a card: the related-posts closer on every other
    // post (its recent-posts fallback can change with any publish), Archive
    // blocks on pages and the home page, and the insights index with its
    // topic routes.
    consumerPaths: ['/posts/[slug]', '/[slug]', '/', '/insights', '/insights/[topic]'],
    label: 'Post',
    revalidateIndex: true,
    sitemapTag: 'posts-sitemap',
  })
