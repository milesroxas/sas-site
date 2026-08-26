import { slugPageRevalidation } from '@/hooks/revalidateSlugPage'
import type { Post } from '@/payload-types'

export const { afterChange: revalidatePost, afterDelete: revalidateDelete } =
  slugPageRevalidation<Post>({
    basePath: '/posts',
    label: 'Post',
    revalidateIndex: true,
    sitemapTag: 'posts-sitemap',
  })
