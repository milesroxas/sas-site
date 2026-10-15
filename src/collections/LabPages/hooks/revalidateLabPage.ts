import { slugPageRevalidation } from '@/hooks/revalidateSlugPage'
import type { LabPage } from '@/payload-types'

export const { afterChange: revalidateLabPage, afterDelete: revalidateLabPageDelete } =
  slugPageRevalidation<LabPage>({
    basePath: '/lab',
    // Where a lab page shows as a card: the related-lab closer on every other
    // lab page (its recent-pages fallback can change with any publish).
    consumerPaths: ['/lab/[slug]'],
    label: 'Lab Page',
    revalidateIndex: true,
    sitemapTag: 'lab-sitemap',
  })
