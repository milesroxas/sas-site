import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache.js'
import { getPayload } from 'payload'
import { CONTACT_INDEX_SLUG } from '@/collections/ContactPages/constants'
import {
  openingHandoffVisual,
  resolveMenuPreviewVisual,
  resolveVisual,
  type StoredMenuPreviewSlot,
  type Visual,
  visualPosters,
  visualSurface,
} from '@/features/immersive/visual'
import { HERO_BAND_THEME } from '@/heros/band-theme'
import type { Media, WorkPage } from '@/payload-types'
import type { Theme } from '@/providers/Theme/types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { MENU_CONTENT_TAG } from './menuCache'

/**
 * Media a menu link previews on hover (takeover-menu hover dissolve).
 * `hero` marks media the destination itself mounts as `[data-hero-media]`:
 * only then may a click hand the docked window off onto the new page
 * (./Menu/heroHandoff). A `menuPreview` pick or the Header's fallback is
 * hover-only; the handoff would otherwise poll for a hero that never mounts.
 */
export type MenuMedia = {
  url: string
  mime: string
  hero: boolean
  /**
   * A Streak Field poster's light-ground twin. `url` is the dark-ground
   * still; the menu picks by the site theme at paint time (`menuMediaUrl`).
   * Only ever a still: a shader descriptor never reaches the menu.
   */
  lightUrl?: string
  /**
   * The still carries alpha (a Streak Field poster: on the page the CSS
   * ground beneath owns its color), and this is the ground it is shown on.
   * A hero's own visual takes its band's polarity, so the preview reads as
   * the destination does; `site` follows the visitor's theme at paint time
   * (an independent preview, a hero with no band). The menu paints that
   * ground under the still (`data-menu-media-ground`, globals.css) and picks
   * the twin drawn for it, so a poster never composites over the page crop
   * or the media it replaces.
   */
  ground?: MenuGround
}
export type MenuGround = Theme | 'site'
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

/**
 * Whether an index page paints this visual itself. `IndexBackground` draws the
 * effect and never the media, so only an effect can be handed off onto.
 */
const mountsIndexGround = (visual: Visual | null): boolean =>
  visual !== null && visual.kind !== 'media'

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

/**
 * Resolved visual → hover-preview source. A media visual goes through
 * `menuMedia`; an effect previews its poster (the approved upload, else the
 * look's stills for both grounds) on `ground`. `hero` follows the same
 * rule as for media: only the destination's own visual, which mounts a
 * poster inside `[data-hero-media]`, can be handed off onto.
 */
function menuVisual(
  visual: Visual | null,
  hero: boolean,
  ground: MenuGround = 'site',
): MenuMedia | null {
  if (!visual) return null
  if (visual.kind === 'media') return menuMedia(visual.media, hero)
  // A leak shown over the slot's media previews as that media: the still of a
  // leak alone is a wash of light with nothing under it.
  if (visual.kind === 'lightLeak' && visual.descriptor.media)
    return menuMedia(visual.descriptor.media, hero)
  const { dark, light, single } = visualPosters(visual)
  return {
    url: dark.src,
    ...(single ? {} : { lightUrl: light.src }),
    mime: dark.mime,
    hero,
    // A face the editor pinned is the ground the page paints under it too.
    ground: visualSurface(visual) ?? ground,
  }
}

/**
 * What a destination previews: the editor's independent menu preview when
 * one is chosen (hover-only, it never mounts on the page, shown on the site
 * theme), else the destination's own visual, which can hand off when the
 * page mounts it as `[data-hero-media]` (`ownMountsHero`) and is shown on
 * the ground the page paints it on (`ownGround`: a hero band's palette, or
 * the site theme where the hero has no band).
 */
function previewOrOwn(
  doc: StoredMenuPreviewSlot,
  own: Visual | null,
  seedKey: string | number,
  { ownMountsHero = true, ownGround = HERO_BAND_THEME as MenuGround } = {},
): MenuMedia | null {
  return (
    menuVisual(resolveMenuPreviewVisual(doc, { seedKey }), false) ??
    menuVisual(own, ownMountsHero && own !== null, ownGround)
  )
}

/** The menu-preview and hero fields every previewable page selects. */
const PREVIEW_SELECT = {
  hero: true,
  menuPreview: true,
  menuPreviewType: true,
  menuPreviewShader: true,
} as const

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

  const [expertise, audiences, works, pages, home, worksIndex, insightsIndex, labIndex, contacts] =
    await Promise.all([
      payload.find({
        collection: 'expertise-pages',
        where: published,
        sort: '_order',
        limit: 5,
        // Depth 1 populates hero.media and the preview pick for the hover preview.
        depth: 1,
        select: { title: true, slug: true, ...PREVIEW_SELECT },
      }),
      payload.find({
        collection: 'audience-pages',
        where: published,
        sort: '_order',
        limit: 4,
        depth: 1,
        select: { title: true, slug: true, ...PREVIEW_SELECT },
      }),
      payload.find({
        collection: 'work-pages',
        where: featuredIds.length ? { and: [published, { id: { in: featuredIds } }] } : published,
        limit: MENU_WORKS_LIMIT,
        // Depth 3 reaches work → case study → project → industries for the eyebrow.
        depth: 3,
        select: { title: true, slug: true, caseStudy: true, coverAsset: true, ...PREVIEW_SELECT },
      }),
      // Primary-nav destinations: the visual every published page previews, keyed by href.
      payload.find({
        collection: 'pages',
        where: published,
        limit: 50,
        depth: 1,
        select: { slug: true, ...PREVIEW_SELECT },
      }),
      payload.findGlobal({ slug: 'home', depth: 1, select: { hero: true } }),
      // Index globals: their pages render the hero copy only, but a Streak
      // Field chosen there runs behind the whole page (`IndexBackground`),
      // so that one can be handed off onto; an upload cannot (see MenuMedia).
      payload.findGlobal({ slug: 'works-index', depth: 1, select: PREVIEW_SELECT }),
      payload.findGlobal({ slug: 'insights-index', depth: 1, select: PREVIEW_SELECT }),
      payload.findGlobal({ slug: 'lab-index', depth: 1, select: PREVIEW_SELECT }),
      payload.find({
        collection: 'contact-pages',
        where: published,
        limit: 20,
        depth: 1,
        select: { slug: true, menuPreview: true, menuPreviewType: true, menuPreviewShader: true },
      }),
    ])

  const pageMedia: Record<string, MenuMedia> = {}
  const setPageMedia = (href: string, media: MenuMedia | null) => {
    if (media) pageMedia[href] = media
  }
  for (const doc of pages.docs) {
    if (doc.slug) {
      setPageMedia(
        `/${doc.slug}`,
        previewOrOwn(doc, openingHandoffVisual(doc.hero, { seedKey: doc.id }), doc.id),
      )
    }
  }
  setPageMedia(
    '/',
    menuVisual(resolveVisual(home.hero, { seedKey: 'home' }), true, HERO_BAND_THEME),
  )
  // Index globals: an explicit preview (hover-only), else the hero's visual,
  // which the page mounts only when it is an effect (`IndexBackground`), behind
  // the whole listing on the site theme (no band).
  const worksVisual = resolveVisual(worksIndex.hero, { seedKey: 'works-index' })
  setPageMedia(
    '/works',
    previewOrOwn(worksIndex, worksVisual, 'works-index', {
      ownMountsHero: mountsIndexGround(worksVisual),
      ownGround: 'site',
    }),
  )
  const insightsVisual = resolveVisual(insightsIndex.hero, { seedKey: 'insights-index' })
  const insightsMedia = previewOrOwn(insightsIndex, insightsVisual, 'insights-index', {
    ownMountsHero: mountsIndexGround(insightsVisual),
    ownGround: 'site',
  })
  // `/posts` renders the same index view, so the docked window rests on the same media there.
  setPageMedia('/insights', insightsMedia)
  setPageMedia('/posts', insightsMedia)
  const labVisual = resolveVisual(labIndex.hero, { seedKey: 'lab-index' })
  setPageMedia(
    '/lab',
    previewOrOwn(labIndex, labVisual, 'lab-index', {
      ownMountsHero: mountsIndexGround(labVisual),
      ownGround: 'site',
    }),
  )
  for (const doc of contacts.docs) {
    if (!doc.slug) continue
    const href = doc.slug === CONTACT_INDEX_SLUG ? '/contact' : `/contact/${doc.slug}`
    setPageMedia(href, menuVisual(resolveMenuPreviewVisual(doc, { seedKey: doc.id }), false))
  }

  // `in` queries return DB order — restore the editor's pick order.
  const workDocs = featuredIds.length
    ? [...works.docs].sort((a, b) => featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id))
    : works.docs

  return {
    expertise: expertise.docs.map((doc) => ({
      title: doc.title,
      href: `/expertise/${doc.slug}`,
      media: previewOrOwn(doc, openingHandoffVisual(doc.hero, { seedKey: doc.id }), doc.id),
    })),
    audiences: audiences.docs.map((doc) => ({
      title: doc.title,
      href: `/who-we-help/${doc.slug}`,
      media: previewOrOwn(doc, openingHandoffVisual(doc.hero, { seedKey: doc.id }), doc.id),
    })),
    works: workDocs.map((doc) => ({
      title: doc.title,
      href: `/works/${doc.slug}`,
      eyebrow: workEyebrow(doc as WorkPage),
      // The editor's preview pick is hover-only; behind it, the same visual
      // the work hero renders (page override, else cover asset) can hand off.
      // Work heroes paint no band of their own: the site theme is the ground.
      media: previewOrOwn(
        doc,
        openingHandoffVisual(doc.hero, { fallbackMedia: doc.coverAsset, seedKey: doc.id }),
        doc.id,
        { ownGround: 'site' },
      ),
    })),
    pageMedia,
    fallbackMedia: menuMedia(header.menuFallbackMedia, false),
  }
}

export const getCachedMenuContent = unstable_cache(getMenuContent, [MENU_CONTENT_TAG], {
  revalidate: 3600,
  tags: [MENU_CONTENT_TAG],
})
