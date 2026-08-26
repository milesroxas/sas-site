import { slugPageRevalidation } from '@/hooks/revalidateSlugPage'
import type { AudiencePage } from '@/payload-types'

export const { afterChange: revalidateAudiencePage, afterDelete: revalidateAudiencePageDelete } =
  slugPageRevalidation<AudiencePage>({
    basePath: '/who-we-help',
    label: 'Audience Page',
    revalidateIndex: true,
    sitemapTag: 'who-we-help-sitemap',
  })
