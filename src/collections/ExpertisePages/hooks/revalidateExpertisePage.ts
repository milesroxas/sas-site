import { slugPageRevalidation } from '@/hooks/revalidateSlugPage'
import type { ExpertisePage } from '@/payload-types'

export const { afterChange: revalidateExpertisePage, afterDelete: revalidateExpertisePageDelete } =
  slugPageRevalidation<ExpertisePage>({
    basePath: '/expertise',
    label: 'Expertise Page',
    revalidateIndex: true,
    sitemapTag: 'expertise-sitemap',
  })
