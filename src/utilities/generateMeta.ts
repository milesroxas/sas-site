import type { Metadata } from 'next'

import type {
  AudiencePage,
  Config,
  ExpertisePage,
  Home,
  Media,
  Page,
  Post,
  WorkPage,
} from '../payload-types'
import { getServerSideURL } from './getURL'
import { mergeOpenGraph } from './mergeOpenGraph'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = `${serverUrl}/website-template-OG.webp`

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc:
    | Partial<Page>
    | Partial<Post>
    | Partial<WorkPage>
    | Partial<ExpertisePage>
    | Partial<AudiencePage>
    | Partial<Home>
    | null
  /** Site-relative path of the page, e.g. '/posts/my-post'. Drives the canonical URL. */
  pathname?: string
}): Promise<Metadata> => {
  const { doc, pathname } = args

  // OG fields override the base SEO fields when set; each falls back independently.
  const og = doc?.meta?.og
  const ogImage = getImageURL(og?.image || doc?.meta?.image)

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
