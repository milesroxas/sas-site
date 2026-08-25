import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache.js'
import { getPayload } from 'payload'
import type { Media, WorkPage } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

/** Hero media a menu link previews on hover (takeover-menu hover dissolve). */
export type MenuMedia = { url: string; mime: string }
export type MenuLink = { title: string; href: string; media: MenuMedia | null }
export type MenuWorkItem = MenuLink & { eyebrow: string | null }

export type MenuContent = {
  expertise: MenuLink[]
  audiences: MenuLink[]
  works: MenuWorkItem[]
  /** Hero media for primary-nav destinations (pages + home), keyed by href. */
  pageMedia: Record<string, MenuMedia>
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

/**
 * Populated media doc → hover-preview source. The menu's preview window is
 * ~450px wide, so the `medium` (900w) rendition covers it on retina; videos
 * have no image sizes and use the source file.
 */
function menuMedia(media: Media | number | null | undefined): MenuMedia | null {
  if (!media || typeof media !== 'object' || !media.mimeType || !media.url) return null
  const url = media.mimeType.startsWith('image/')
    ? (media.sizes?.medium?.url ?? media.url)
    : media.url
  return { url: getMediaUrl(url, media.updatedAt), mime: media.mimeType }
}

/**
 * Editorial columns of the takeover menu, sourced live from the page
 * collections (no Header-global fields, so no schema change). Published docs
 * only — the Local API bypasses access control, so the filter is explicit.
 */
async function getMenuContent(): Promise<MenuContent> {
  const payload = await getPayload({ config: configPromise })
  const published = { _status: { equals: 'published' as const } }

  const [expertise, audiences, works, pages, home] = await Promise.all([
    payload.find({
      collection: 'expertise-pages',
      where: published,
      limit: 5,
      // Depth 1 populates hero.media for the hover preview.
      depth: 1,
      select: { title: true, slug: true, hero: true },
    }),
    payload.find({
      collection: 'audience-pages',
      where: published,
      limit: 4,
      depth: 1,
      select: { title: true, slug: true, hero: true },
    }),
    payload.find({
      collection: 'work-pages',
      where: published,
      limit: 4,
      // Depth 3 reaches work → case study → project → industries for the eyebrow.
      depth: 3,
      select: { title: true, slug: true, caseStudy: true, hero: true, coverAsset: true },
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
  ])

  const pageMedia: Record<string, MenuMedia> = {}
  for (const doc of pages.docs) {
    const media = menuMedia(doc.hero?.media)
    if (media && doc.slug) pageMedia[`/${doc.slug}`] = media
  }
  const homeMedia = menuMedia(home.hero?.media)
  if (homeMedia) pageMedia['/'] = homeMedia

  return {
    expertise: expertise.docs.map((doc) => ({
      title: doc.title,
      href: `/expertise/${doc.slug}`,
      media: menuMedia(doc.hero?.media),
    })),
    audiences: audiences.docs.map((doc) => ({
      title: doc.title,
      href: `/who-we-help/${doc.slug}`,
      media: menuMedia(doc.hero?.media),
    })),
    works: works.docs.map((doc) => ({
      title: doc.title,
      href: `/works/${doc.slug}`,
      eyebrow: workEyebrow(doc as WorkPage),
      // Same fallback the work hero renders: page override, else cover asset.
      media: menuMedia(doc.hero?.media ?? doc.coverAsset),
    })),
    pageMedia,
  }
}

export const getCachedMenuContent = unstable_cache(getMenuContent, ['takeover-menu-content'], {
  revalidate: 3600,
  tags: ['takeover-menu-content'],
})
