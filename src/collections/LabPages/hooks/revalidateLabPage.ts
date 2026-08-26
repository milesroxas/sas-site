import { slugPageRevalidation } from '@/hooks/revalidateSlugPage'
import type { LabPage } from '@/payload-types'

export const { afterChange: revalidateLabPage, afterDelete: revalidateLabPageDelete } =
  slugPageRevalidation<LabPage>({
    basePath: '/lab',
    label: 'Lab Page',
    revalidateIndex: true,
    sitemapTag: 'lab-sitemap',
  })
