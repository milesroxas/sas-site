import { slugPageRevalidation } from '@/hooks/revalidateSlugPage'
import type { WorkPage } from '@/payload-types'

export const { afterChange: revalidateWorkPage, afterDelete: revalidateWorkPageDelete } =
  slugPageRevalidation<WorkPage>({
    basePath: '/works',
    label: 'Work Page',
    revalidateIndex: true,
    sitemapTag: 'works-sitemap',
  })
