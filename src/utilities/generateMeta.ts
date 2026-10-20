import type { Metadata } from 'next'

import type {
  AudiencePage,
  Config,
  ExpertisePage,
  Home,
  InsightsIndex,
  LabIndex,
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

const TITLE_SUFFIX = 'Suits & Sandals'

/**
 * One site suffix, whatever the editor typed: the SEO tab's Auto-generate
 * button writes the suffix into `meta.title` itself, which used to render as
 * "X | Suits & Sandals | Suits & Sandals".
 */
export const titleWithSuffix = (metaTitle?: string | null): string => {
  const base = (metaTitle ?? '')
    .trim()
    .replace(/\s*\|\s*Suits\s*&\s*Sandals\s*$/i, '')
    .trim()
  return base ? `${base} | ${TITLE_SUFFIX}` : TITLE_SUFFIX
}

export const generateMeta = async (args: {
  doc:
    | Partial<Page>
    | Partial<Post>
    | Partial<WorkPage>
    | Partial<ExpertisePage>
    | Partial<AudiencePage>
    | Partial<LabPage>
    | Partial<LabIndex>
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
  const ogImage = getImageURL(og?.image || doc?.meta?.image) ?? (await getFallbackOgImageURL())

  const title = titleWithSuffix(doc?.meta?.title)

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
