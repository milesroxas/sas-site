import type { Metadata } from 'next'

import type {
  AudiencePage,
  Config,
  ExpertisePage,
  Home,
  InsightsIndex,
  LabPage,
  Media,
  Page,
  Post,
  WorkPage,
  WorksIndex,
} from '../payload-types'
import { getCachedGlobal } from './getGlobals'
import { getServerSideURL } from './getURL'
import { mergeOpenGraph } from './mergeOpenGraph'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  if (image && typeof image === 'object' && 'url' in image && image.url) {
    const ogUrl = image.sizes?.og?.url
    const serverUrl = getServerSideURL()
    return ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return undefined
}

/** Site Info › Default preview image. Used when a page has no SEO or OG image. */
export const getFallbackOgImageURL = async () => {
  const siteInfo = await getCachedGlobal('site-info', 1)()
  return getImageURL(siteInfo?.ogImage)
}

export const generateMeta = async (args: {
  doc:
    | Partial<Page>
    | Partial<Post>
    | Partial<WorkPage>
    | Partial<ExpertisePage>
    | Partial<AudiencePage>
    | Partial<LabPage>
    | Partial<Home>
    | Partial<InsightsIndex>
    | Partial<WorksIndex>
    | null
  /** Site-relative path of the page, e.g. '/posts/my-post'. Drives the canonical URL. */
  pathname?: string
}): Promise<Metadata> => {
  const { doc, pathname } = args

  // OG fields override the base SEO fields when set; each falls back independently.
  const og = doc?.meta?.og
  const ogImage =
    getImageURL(og?.image || doc?.meta?.image) ?? (await getFallbackOgImageURL())

  const title = doc?.meta?.title ? `${doc?.meta?.title} | Suits & Sandals` : 'Suits & Sandals'

  return {
    description: doc?.meta?.description,
    ...(pathname ? { alternates: { canonical: pathname } } : {}),
    openGraph: mergeOpenGraph({
      description: og?.description || doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title: og?.title || title,
      url: pathname ?? '/',
    }),
    title,
  }
}
