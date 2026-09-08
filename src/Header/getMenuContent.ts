import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache.js'
import { getPayload } from 'payload'
import { CONTACT_INDEX_SLUG } from '@/collections/ContactPages/constants'
import type { Media, WorkPage } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { MENU_CONTENT_TAG } from './menuCache'

/**
 * Media a menu link previews on hover (takeover-menu hover dissolve).
 * `hero` marks media the destination itself mounts as `[data-hero-media]`:
 * only then may a click hand the docked window off onto the new page
 * (./Menu/heroHandoff). A `menuPreview` pick or the Header's fallback is
 * hover-only; the handoff would otherwise poll for a hero that never mounts.
 */
export type MenuMedia = { url: string; mime: string; hero: boolean }
export type MenuLink = { title: string; href: string; media: MenuMedia | null }
export type MenuWorkItem = MenuLink & { eyebrow: string | null }

export type MenuContent = {
  expertise: MenuLink[]
  audiences: MenuLink[]
  works: MenuWorkItem[]
  /**
   * Preview media for primary-nav destinations (pages, home, the index
   * globals, contact pages), keyed by href. Also the docked window's resting
   * media when the current page mounts no hero of its own (the index pages,
   * contact pages): the menu opens onto this route's entry instead of a scaled
   * copy of the page.
   */
  pageMedia: Record<string, MenuMedia>
  /** Header `menuFallbackMedia`: hover media for any link that resolved none of its own. */
  fallbackMedia: MenuMedia | null
}

/** Industry eyebrow via work page → case study → project → first industry. */
function workEyebrow(doc: WorkPage): string | null {
  const caseStudy = doc.caseStudy
  if (!caseStudy || typeof caseStudy !== 'object') return null
  const project = caseStudy.project
  if (!project || typeof project !== 'object') return null
  const industry = project.industries?.[0]
  return industry && typeof industry === 'object' ? industry.name : null
}

type MediaRef = Media | number | null | undefined

/**
 * Populated media doc → hover-preview source. The menu's preview window is
 * ~450px wide, so the `medium` (900w) rendition covers it on retina; videos
 * have no image sizes and use the source file.
 */
function menuMedia(media: MediaRef, hero: boolean): MenuMedia | null {
  if (!media || typeof media !== 'object' || !media.mimeType || !media.url) return null
  const url = media.mimeType.startsWith('image/')
    ? (media.sizes?.medium?.url ?? media.url)
    : media.url
  return { url: getMediaUrl(url, media.updatedAt), mime: media.mimeType, hero }
}

/** Menu shows at most this many case studies (Header `featuredWork` maxRows). */
const MENU_WORKS_LIMIT = 4

/**
 * Editorial columns of the takeover menu, sourced live from the page
 * collections. Case studies honor the Header global's `featuredWork` picks
 * (in order) and fall back to the most recent published. Published docs
 * only — the Local API bypasses access control, so the filter is explicit.
 */
async function getMenuContent(): Promise<MenuContent> {
  const payload = await getPayload({ config: configPromise })
  const published = { _status: { equals: 'published' as const } }

  const header = await payload.findGlobal({
    slug: 'header',
    // Depth 1 populates the fallback media; featuredWork is read as ids.
    depth: 1,
    select: { featuredWork: true, menuFallbackMedia: true },
  })
  const featuredIds = (header.featuredWork ?? [])
    .map((work) => (typeof work === 'object' ? work.id : work))
    .slice(0, MENU_WORKS_LIMIT)

  const [expertise, audiences, works, pages, home, worksIndex, insightsIndex, contacts] =
    await Promise.all([
      payload.find({
        collection: 'expertise-pages',
        where: published,
        sort: '_order',
        limit: 5,
        // Depth 1 populates hero.media for the hover preview.
        depth: 1,
        select: { title: true, slug: true, hero: true },
      }),
      payload.find({
        collection: 'audience-pages',
        where: published,
        sort: '_order',
        limit: 4,
        depth: 1,
        select: { title: true, slug: true, hero: true },
      }),
      payload.find({
        collection: 'work-pages',
        where: featuredIds.length ? { and: [published, { id: { in: featuredIds } }] } : published,
        limit: MENU_WORKS_LIMIT,
        // Depth 3 reaches work → case study → project → industries for the eyebrow.
        depth: 3,
        select: {
          title: true,
          slug: true,
          caseStudy: true,
          hero: true,
          coverAsset: true,
          menuPreview: true,
        },
      }),
      // Primary-nav destinations: hero media for every published page, keyed by href.
      payload.find({
        collection: 'pages',
        where: published,
        limit: 50,
        depth: 1,
        select: { slug: true, hero: true },
      }),
      payload.findGlobal({ slug: 'home', depth: 1, select: { hero: true } }),
      // Index globals: their pages render the hero as copy only, so neither
      // source can be handed off onto a mounted hero (hover-only, see MenuMedia).
      payload.findGlobal({
        slug: 'works-index',
        depth: 1,
        select: { hero: true, menuPreview: true },
      }),
      payload.findGlobal({
        slug: 'insights-index',
        depth: 1,
        select: { hero: true, menuPreview: true },
      }),
      payload.find({
        collection: 'contact-pages',
        where: published,
        limit: 20,
        depth: 1,
        select: { slug: true, menuPreview: true },
      }),
    ])

  const pageMedia: Record<string, MenuMedia> = {}
  const setPageMedia = (href: string, media: MenuMedia | null) => {
    if (media) pageMedia[href] = media
  }
  for (const doc of pages.docs) {
    if (doc.slug) setPageMedia(`/${doc.slug}`, menuMedia(doc.hero?.media, true))
  }
  setPageMedia('/', menuMedia(home.hero?.media, true))
  setPageMedia('/works', menuMedia(worksIndex.menuPreview ?? worksIndex.hero?.media, false))
  setPageMedia(
    '/insights',
    menuMedia(insightsIndex.menuPreview ?? insightsIndex.hero?.media, false),
  )
  for (const doc of contacts.docs) {
    if (!doc.slug) continue
    const href = doc.slug === CONTACT_INDEX_SLUG ? '/contact' : `/contact/${doc.slug}`
    setPageMedia(href, menuMedia(doc.menuPreview, false))
  }

  // `in` queries return DB order — restore the editor's pick order.
  const workDocs = featuredIds.length
    ? [...works.docs].sort((a, b) => featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id))
    : works.docs

  return {
    expertise: expertise.docs.map((doc) => ({
      title: doc.title,
      href: `/expertise/${doc.slug}`,
      media: menuMedia(doc.hero?.media, true),
    })),
    audiences: audiences.docs.map((doc) => ({
      title: doc.title,
      href: `/who-we-help/${doc.slug}`,
      media: menuMedia(doc.hero?.media, true),
    })),
    works: workDocs.map((doc) => ({
      title: doc.title,
      href: `/works/${doc.slug}`,
      eyebrow: workEyebrow(doc as WorkPage),
      // The editor's preview pick is hover-only; behind it, the same fallback
      // the work hero renders (page override, else cover asset) can hand off.
      media:
        menuMedia(doc.menuPreview, false) ?? menuMedia(doc.hero?.media ?? doc.coverAsset, true),
    })),
    pageMedia,
    fallbackMedia: menuMedia(header.menuFallbackMedia, false),
  }
}

export const getCachedMenuContent = unstable_cache(getMenuContent, [MENU_CONTENT_TAG], {
  revalidate: 3600,
  tags: [MENU_CONTENT_TAG],
})
