import { slugPageRevalidation } from '@/hooks/revalidateSlugPage'
import type { Page } from '@/payload-types'

export const { afterChange: revalidatePage, afterDelete: revalidateDelete } =
  slugPageRevalidation<Page>({
    // Pages live at the site root, so there is no index path to purge.
    basePath: '',
    label: 'Page',
    // The takeover menu previews nav pages by their hero visual or menu preview.
    revalidateMenu: true,
    sitemapTag: 'pages-sitemap',
  })
