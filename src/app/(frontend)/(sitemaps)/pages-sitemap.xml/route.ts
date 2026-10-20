import config from '@payload-config'
import { unstable_cache } from 'next/cache.js'
import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import { surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'

/** The listing page of each section, at its canonical path. */
const SECTION_INDEX_PATHS = ['/expertise', '/who-we-help', '/works', '/insights', '/lab']

/**
 * The root-level pages, the home page, the section listings and the contact
 * pages: everything that publishes outside a sectioned prefix with its own
 * sitemap. Contact pages revalidate this tag (see their hooks), which is why
 * they ride here rather than in a seventh file. `/search` and the legacy
 * `/posts` listing stay out: one is noindex, the other canonicalizes to
 * `/insights`.
 */
const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const published = {
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
    } as const

    const [pages, contactPages] = await Promise.all([
      payload.find({ collection: 'pages', ...published }),
      payload.find({ collection: 'contact-pages', ...published }),
    ])

    const dateFallback = new Date().toISOString()

    const home = await payload.findGlobal({
      slug: 'home',
      depth: 0,
      draft: false,
      overrideAccess: false,
      select: {
        updatedAt: true,
        _status: true,
      },
    })

    const defaultSitemap = [
      ...(home?._status === 'published'
        ? [
            {
              loc: `${SITE_URL}/`,
              lastmod: home.updatedAt || dateFallback,
            },
          ]
        : []),
      // The section listings. Each section's own sitemap covers its detail
      // pages only, and these index routes have no document to date them.
      ...SECTION_INDEX_PATHS.map((path) => ({ loc: `${SITE_URL}${path}`, lastmod: dateFallback })),
    ]

    const contactSurface = surfaceByCollection.get('contact-pages')

    const sitemap = [
      ...pages.docs
        .filter((page) => Boolean(page?.slug))
        .map((page) => ({
          loc: `${SITE_URL}/${page.slug}`,
          lastmod: page.updatedAt || dateFallback,
        })),
      ...(contactSurface
        ? contactPages.docs
            .filter((page) => Boolean(page?.slug))
            .map((page) => ({
              loc: `${SITE_URL}${surfaceDocPath(contactSurface, page.slug as string)}`,
              lastmod: page.updatedAt || dateFallback,
            }))
        : []),
    ]

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
