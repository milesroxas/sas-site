import { slugPageRevalidation } from '@/hooks/revalidateSlugPage'
import type { ContactPage } from '@/payload-types'

export const { afterChange: revalidateContactPage, afterDelete: revalidateContactPageDelete } =
  slugPageRevalidation<ContactPage>({
    basePath: '/contact',
    label: 'Contact Page',
    revalidateIndex: false,
    sitemapTag: 'pages-sitemap',
  })
