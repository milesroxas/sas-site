import { slugPageRevalidation } from '@/hooks/revalidateSlugPage'
import type { WorkPage } from '@/payload-types'

export const { afterChange: revalidateWorkPage, afterDelete: revalidateWorkPageDelete } =
  slugPageRevalidation<WorkPage>({
    basePath: '/works',
    // Where a work page shows as a card: the related-work closer on every
    // other work page (its recent-work fallback can change with any publish),
    // Featured Work and Industry Work blocks on pages and the home page, and
    // the related-work section on the segment pages.
    consumerPaths: ['/works/[slug]', '/[slug]', '/', '/expertise/[slug]', '/who-we-help/[slug]'],
    label: 'Work Page',
    revalidateMenu: true,
    revalidateIndex: true,
    sitemapTag: 'works-sitemap',
  })
