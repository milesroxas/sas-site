'use client'

import { IconArrowLeft, IconArrowUpRight, IconMaximize, IconMinimize } from '@tabler/icons-react'
import type React from 'react'
import { createContext, type RefObject, useContext, useEffect, ViewTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  DirectionalTransition,
  POST_IMAGE_FRAME,
  postImageShare,
  postImageVtName,
  sequenceWorkImageMorph,
  WORK_OPEN,
  WorkImageTransition,
  workImageShare,
  workImageVtName,
} from '@/shared/lib/view-transition'
import { DemoBrowserFrame, DemoScroller } from '@/shared/ui/demo-kit'
import { cn } from '@/utilities/ui'
import type { SimDirection, SimPhase } from './use-sim-navigation'
import './transition-demo.css'

/**
 * A miniature of the production site, small enough to fit a viewport frame
 * but wired identically, one surface per navigation type the site ships:
 *
 *   - insight cards (title *and* body, via the fixed `useClickableCard`) and
 *     work index rows tag `nav-forward`; back links tag `nav-back`;
 *     pagination tags by direction; the brand and CMS-style links tag
 *     `nav-lateral`;
 *   - a post card's image and its hero share a morph name inside the same
 *     `POST_IMAGE_FRAME`, so the pair never changes crop mid-flight;
 *   - the Industry work spotlight tags `work-open`: its media pairs with the
 *     case-study hero through `workImageVtName` / `workImageShare` and plays
 *     `sequenceWorkImageMorph` on share, exactly like `IndustryWork`;
 *   - untagged hard cuts remain reachable via the frame's browser-back button.
 *
 * Only the takeover menu's two navigations are absent: they are GSAP-owned
 * (curtain, hero handoff) and suppress the platform transition; their landing
 * and lift are tuned in the Hero landing section and the reveal variables.
 */

export type MockRoute =
  | 'home'
  | 'works'
  | `work/${string}`
  | 'posts/1'
  | 'posts/2'
  | `post/${string}`
  | 'about'

/** Which production case-study hero the mock destination renders. */
export type MockHeroLayout = 'landscape' | 'centered'

/** The hero landing's target on a case-study page: the named, paired media box. */
export const HERO_MEDIA_SELECTOR = '[data-hero-media]'

type MockPost = {
  slug: string
  title: string
  category: string
  body: string
  /** Gradient stand-in for the card/hero image: the morph reads on any element. */
  image: string
}

type MockWork = {
  slug: string
  title: string
  client: string
  industry: string
  capabilities: string[]
  year: string
  image: string
}

const PAGE_ONE: MockPost[] = [
  {
    slug: 'refraction-study',
    title: 'Refraction study',
    category: 'Lab',
    body: 'The image beside this arrived by shared-element morph: the card image and this hero carry the same view-transition-name, and both paint into POST_IMAGE_FRAME, so the browser interpolates one rect into the other without a crop change. Today it travels under the incoming page and surfaces here at the end; Post morph, above page in the GUI previews the proposed fix.',
    image: 'bg-linear-to-br from-chart-2 via-chart-3 to-chart-5',
  },
  {
    slug: 'dispersion-mesh',
    title: 'Dispersion mesh',
    category: 'Lab',
    body: 'Try the back link above against the browser back button in the frame chrome. The link tags nav-back and reveals from the left edge; the browser button is untagged and cuts. Both are production behavior.',
    image: 'bg-linear-to-tr from-chart-4 via-chart-2 to-chart-1',
  },
  {
    slug: 'floating-cards',
    title: 'Floating cards',
    category: 'Work',
    body: 'This window scrolls through its own Lenis instance, tuned like the site root scroll. Each navigation mounts a fresh scroller at the top, so a stale scroll target can never break a morph mid-flight.',
    image: 'bg-linear-to-b from-chart-3 via-chart-4 to-chart-2',
  },
]

const PAGE_TWO: MockPost[] = [
  {
    slug: 'text-load-in',
    title: 'Text load-in',
    category: 'Work',
    body: 'You reached page two through the pagination, which tags direction imperatively: higher pages reveal from the right, lower pages from the left, mirroring how Pagination calls addTransitionType by hand.',
    image: 'bg-linear-to-br from-chart-1 via-chart-2 to-chart-4',
  },
  {
    slug: 'raymarched-reveal',
    title: 'Raymarched reveal',
    category: 'Lab',
    body: 'Turn the network preset up to Slow 3G and tap around. The stillness before this page appeared is real: production ships no loading UI, so a slow fetch reads as a dead tap.',
    image: 'bg-linear-to-tl from-chart-5 via-chart-3 to-chart-1',
  },
  {
    slug: 'scramble-cipher',
    title: 'Scramble cipher',
    category: 'Notes',
    body: 'Stretch the mask reveal past a second in the GUI and the wipe turns theatrical; drop it under 250ms and it reads as a cut with intent. The shipped 480ms with the site ease is the confident middle.',
    image: 'bg-linear-to-r from-chart-2 via-chart-5 to-chart-3',
  },
]

const WORKS: MockWork[] = [
  {
    slug: 'ledger-clarity',
    title: 'Clarity for a payments platform',
    client: 'Ledger',
    industry: 'Fintech',
    capabilities: ['Brand', 'Product design'],
    year: '2026',
    image: 'bg-linear-to-br from-chart-3 via-chart-1 to-chart-5',
  },
  {
    slug: 'care-pathways',
    title: 'Care pathways, made legible',
    client: 'Northwell',
    industry: 'Health',
    capabilities: ['Service design', 'Content'],
    year: '2025',
    image: 'bg-linear-to-tr from-chart-2 via-chart-4 to-chart-3',
  },
  {
    slug: 'grid-signal',
    title: 'A grid operator finds its voice',
    client: 'Meridian',
    industry: 'Energy',
    capabilities: ['Brand', 'Web'],
    year: '2025',
    image: 'bg-linear-to-bl from-chart-5 via-chart-2 to-chart-1',
  },
]

const ALL_POSTS = [...PAGE_ONE, ...PAGE_TWO]
/** The home page features the first two posts, morph-named like everywhere else. */
const FEATURED = PAGE_ONE.slice(0, 2)
/** The work the home spotlight features: the `work-open` source. */
const SPOTLIGHT = WORKS[0]

const postBySlug = (slug: string) => ALL_POSTS.find((post) => post.slug === slug)
const workBySlug = (slug: string) => WORKS.find((work) => work.slug === slug)

const postSlugOf = (route: MockRoute) => (route.startsWith('post/') ? route.slice(5) : null)
const workSlugOf = (route: MockRoute) => (route.startsWith('work/') ? route.slice(5) : null)

/** Which list route renders a card for the given slug. */
const listRouteFor = (slug: string): MockRoute =>
  PAGE_ONE.some((post) => post.slug === slug) ? 'posts/1' : 'posts/2'

const routeShowsImage = (route: MockRoute, slug: string) => {
  if (route === 'home') return FEATURED.some((post) => post.slug === slug)
  if (route === 'posts/1') return PAGE_ONE.some((post) => post.slug === slug)
  if (route === 'posts/2') return PAGE_TWO.some((post) => post.slug === slug)
  return route === `post/${slug}`
}

/**
 * Which independently-animating groups a from -> to pair engages (for the
 * timeline). The post-image morph forms whenever both ends show the same
 * post's image; the work takeover is decided by the navigation's type, not
 * the pair, exactly as `workImageShare` gates it.
 */
export const runFlags = (from: MockRoute, to: MockRoute) => {
  const fromSlug = postSlugOf(from)
  const toSlug = postSlugOf(to)
  const morph = fromSlug
    ? routeShowsImage(to, fromSlug)
    : toSlug
      ? routeShowsImage(from, toSlug)
      : false
  return { morph }
}

const routePath = (route: MockRoute) => {
  if (route === 'home') return '/'
  if (route === 'works') return '/works'
  if (route === 'posts/1') return '/posts'
  if (route === 'posts/2') return '/posts/page/2'
  if (route === 'about') return '/about'
  const work = workSlugOf(route)
  if (work) return `/works/${work}`
  return `/posts/${postSlugOf(route)}`
}

type SimNav = {
  navigate: (to: MockRoute, direction: SimDirection | null) => void
  heroLayout: MockHeroLayout
}

const SimNavContext = createContext<SimNav | null>(null)

function useSimNav() {
  const nav = useContext(SimNavContext)
  if (!nav) throw new Error('useSimNav must be used inside MockViewport')
  return nav
}

const PHASE_LABEL: Record<SimPhase, string> = {
  idle: 'idle',
  network: 'fetching RSC…',
  server: 'server render…',
  animating: 'transitioning',
}

/** The site's small mono furniture voice (kickers, facts, meta rows). */
const FURNITURE = 'font-mono text-xs uppercase tracking-widest'

type MockViewportProps = {
  route: MockRoute
  phase: SimPhase
  navigate: (to: MockRoute, direction: SimDirection | null) => void
  canGoBack: boolean
  onBrowserBack: () => void
  heroLayout: MockHeroLayout
  /**
   * The window fills the real viewport. A takeover measures the real
   * viewport (it centers and expands against `window.inner*`), so it only
   * plays at production geometry when the window *is* the viewport.
   */
  maximized: boolean
  onMaximizedChange: (maximized: boolean) => void
  /** The frame's root, for measuring the destination hero after a takeover commits. */
  frameRef: RefObject<HTMLDivElement | null>
}

/**
 * The window's scroller. It mounts inside the keyed transition boundary, so
 * every navigation gets a fresh scroller at the top: the production
 * stale-`targetScroll` hazard (see SmoothScrollProvider) structurally cannot
 * happen here. It paints the page surface (`bg-background`) the way every
 * production page article does: the boundary's snapshots are only as opaque
 * as what is painted inside it, and a mask reveal needs the incoming page
 * opaque or the two pages overlap in the revealed region.
 */
function MockScroller({ children, maximized }: { children: React.ReactNode; maximized: boolean }) {
  return (
    <DemoScroller className={cn('bg-background', maximized ? 'h-full' : 'h-[80vh]')}>
      {children}
    </DemoScroller>
  )
}

/** Browser-frame chrome around the mock site: back button, address bar, phase readout, window toggle. */
export function MockViewport({
  route,
  phase,
  navigate,
  canGoBack,
  onBrowserBack,
  heroLayout,
  maximized,
  onMaximizedChange,
  frameRef,
}: MockViewportProps) {
  const loading = phase === 'network' || phase === 'server'

  // Snapshots ignore the frame's overflow (they render in the top layer);
  // the scoped rule in transition-demo.css clips them while this is mounted.
  useEffect(() => {
    document.documentElement.classList.add('vt-sim-clip')
    return () => document.documentElement.classList.remove('vt-sim-clip')
  }, [])

  // Escape restores the window, the way it leaves any full-screen surface.
  useEffect(() => {
    if (!maximized) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onMaximizedChange(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [maximized, onMaximizedChange])

  return (
    <SimNavContext.Provider value={{ navigate, heroLayout }}>
      <div className={cn(maximized && 'fixed inset-0 z-50')} ref={frameRef}>
        <DemoBrowserFrame
          // Full screen: the frame is a two-row grid so the page row has a
          // definite height for the scroller to fill; windowed, it sizes to
          // the scroller's own 80vh.
          className={cn(maximized && 'grid h-full grid-rows-[auto_1fr] rounded-none border-0')}
          // Named so the bar gets its own snapshot group, pinned above every
          // other group by transition-demo.css. Unnamed it would sit inside
          // the root snapshot, under the media takeover (z 50) and the page
          // groups, and the full-screen flight would paint over the window
          // controls, including the restore button.
          barClassName="vt-sim-chrome"
          path={routePath(route)}
          loading={loading}
          leading={
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!canGoBack}
              onClick={onBrowserBack}
              aria-label="Browser back: untagged, hard cut"
              title="Browser back: untagged, hard cut"
            >
              <IconArrowLeft aria-hidden />
            </Button>
          }
          trailing={
            <>
              <span
                className={cn(
                  'hidden shrink-0 font-mono text-xs sm:inline',
                  phase === 'idle' ? 'text-muted-foreground/60' : 'text-foreground',
                )}
                aria-live="polite"
              >
                {PHASE_LABEL[phase]}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onMaximizedChange(!maximized)}
                aria-label={maximized ? 'Restore the window (Esc)' : 'Fill the viewport'}
                title={maximized ? 'Restore the window (Esc)' : 'Fill the viewport'}
              >
                {maximized ? <IconMinimize aria-hidden /> : <IconMaximize aria-hidden />}
              </Button>
            </>
          }
        >
          {/* Like the production layout: the header lives outside the animated
              boundary (it persists through swaps), overlaying the scroller the
              way the fixed site header overlays the page frame. Full screen,
              this row is a grid too, so the boundary's own box (which the
              production wrapper sizes `min-h-0`, not `h-full`) stretches to it. */}
          <div className={cn('relative', maximized && 'grid min-h-0')}>
            <MockHeader />

            {/* The boundary is the window-sized box; the scroller lives inside
                it, so page snapshots are window-sized and the clip rule can pin
                them to the frame. */}
            <DirectionalTransition key={route}>
              <MockScroller maximized={maximized}>
                <div className="pt-12">
                  <MockPage route={route} />
                </div>
              </MockScroller>
            </DirectionalTransition>
          </div>
        </DemoBrowserFrame>
      </div>
    </SimNavContext.Provider>
  )
}

/**
 * The persistent bar. The brand tags `nav-lateral` like the site's header
 * logo; the links stand in for CMS links (`CMSLink` defaults to lateral).
 * The site's own header offers the takeover menu instead, whose navigations
 * are not view transitions (see the module note).
 *
 * Named `site-header` exactly like `HeaderBar`, so the production rule pins
 * it (`animation: none`, above every page group). Unnamed it would fall into
 * the root snapshot, under the page boundary's opaque snapshots, and vanish
 * for the length of every run.
 */
function MockHeader() {
  const { navigate } = useSimNav()
  const link =
    'pressable rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50'
  return (
    <div
      className="absolute inset-x-0 top-0 z-20 flex h-12 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-sm"
      style={{ viewTransitionName: 'site-header' }}
    >
      <button
        type="button"
        className="pressable rounded-sm text-sm font-medium tracking-[0.19em] outline-none hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring/50"
        onClick={() => navigate('home', 'lateral')}
      >
        SUITS &amp; SANDALS
      </button>
      <nav className="flex items-center gap-4 text-sm text-muted-foreground">
        <button type="button" className={link} onClick={() => navigate('works', 'lateral')}>
          Work
        </button>
        <button type="button" className={link} onClick={() => navigate('posts/1', 'lateral')}>
          Insights
        </button>
        <button type="button" className={link} onClick={() => navigate('about', 'lateral')}>
          About
        </button>
      </nav>
    </div>
  )
}

function MockPage({ route }: { route: MockRoute }) {
  const { heroLayout } = useSimNav()
  if (route === 'home') return <MockHome />
  if (route === 'works') return <MockWorks />
  if (route === 'posts/1') return <MockPosts page={1} />
  if (route === 'posts/2') return <MockPosts page={2} />
  if (route === 'about') return <MockAbout />
  const workSlug = workSlugOf(route)
  if (workSlug) {
    const work = workBySlug(workSlug)
    return work ? <MockCaseStudy work={work} layout={heroLayout} /> : <MockAbout />
  }
  const post = postBySlug(postSlugOf(route) ?? '')
  return post ? <MockPostDetail post={post} /> : <MockAbout />
}

/** A text-flow back link: `CMSLink` with `transitionDirection="back"`. */
function BackLink({ label, to }: { label: string; to: MockRoute }) {
  const { navigate } = useSimNav()
  return (
    <button
      type="button"
      className="pressable rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      onClick={() => navigate(to, 'back')}
    >
      ← {label}
    </button>
  )
}

function MockHome() {
  const { navigate } = useSimNav()
  return (
    <div>
      <section className="relative overflow-hidden bg-linear-to-br from-chart-5/80 via-chart-3/40 to-background px-5 py-14">
        <p className={cn(FURNITURE, 'text-muted-foreground')}>Suits &amp; Sandals</p>
        <h3 className="mt-2 text-balance text-heading-3">Make it make sense</h3>
        <p className="mt-3 max-w-sm text-pretty text-sm/relaxed text-muted-foreground">
          Leave this page and it holds perfectly still while the next one wipes open over it: the
          hero is part of the page, so the whole surface travels as one.
        </p>
        {/* A CMS button: `CMSLink` tags lateral unless told otherwise. */}
        <Button className="mt-5" onClick={() => navigate('works', 'lateral')}>
          View the work
        </Button>
      </section>

      <MockSpotlight work={SPOTLIGHT} />

      <section className="space-y-4 px-5 py-8">
        <h4 className="text-sm text-muted-foreground">Featured insights</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURED.map((post) => (
            <MockSplitCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}

/**
 * The `IndustryWork` spotlight in miniature: the title column's link and the
 * whole media panel tag `work-open`, and the media box is the shared element.
 * Mirrors the block's pairing exactly: `workImageVtName` for the name, the
 * type-gated `workImageShare`, and `sequenceWorkImageMorph` from `onShare`
 * (React fires it on this, the unmounting, side), gated to `work-open`.
 */
function MockSpotlight({ work }: { work: MockWork }) {
  const { navigate } = useSimNav()
  const open = () => navigate(`work/${work.slug}`, 'work-open')
  const name = workImageVtName(work.slug)

  return (
    <section className="space-y-6 border-t border-border px-5 py-8">
      <p className={cn(FURNITURE, 'text-muted-foreground')}>Industry work · {work.industry}</p>
      <div className="grid gap-5 sm:grid-cols-12 sm:gap-x-4">
        <div className="flex flex-col items-start gap-3 sm:col-span-4 sm:pt-6">
          <h4 className="text-balance text-lg/tight font-light">{work.title}</h4>
          <button
            type="button"
            className="pressable rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={open}
          >
            View case study
          </button>
        </div>
        <ViewTransition
          default="none"
          name={name}
          onShare={(_instance, types) =>
            types.includes(WORK_OPEN) ? sequenceWorkImageMorph(name) : undefined
          }
          share={workImageShare}
        >
          <div className="relative aspect-8/5 w-full sm:col-span-8">
            <button
              type="button"
              aria-label={`View case study: ${work.title}`}
              className="pointer-coarse:pressable pointer-coarse:pressable-subtle absolute inset-0 block cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={open}
            >
              <div className={cn('absolute inset-0 rounded-sm', work.image)} />
            </button>
          </div>
        </ViewTransition>
      </div>
      <p className="max-w-prose text-pretty text-xs text-muted-foreground">
        The takeover centers and expands against the real viewport, so the window fills it for the
        run (restore it from the chrome, or press Esc). Old page fades, media glides to center and
        expands, then the hero landing masks it onto the case-study hero.
      </p>
    </section>
  )
}

/**
 * Mirrors the production `Card` (`split` variant): the whole body is a
 * pressable click surface that, like the fixed `useClickableCard`, tags
 * `nav-forward` exactly as the title link does; the image paints into
 * `POST_IMAGE_FRAME` and shares a morph name with the detail hero. The hover
 * zoom rides the image inside the frame, never the frame.
 */
function MockSplitCard({ post }: { post: MockPost }) {
  const { navigate } = useSimNav()
  const detail: MockRoute = `post/${post.slug}`

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: mirrors production useClickableCard; the title button inside is the keyboard path.
    // biome-ignore lint/a11y/noStaticElementInteractions: mirrors the production card's body-click surface; keyboard users get the title button.
    <div
      className="group pressable pressable-subtle flex cursor-pointer gap-3"
      onClick={() => navigate(detail, 'forward')}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <button
          type="button"
          className="text-left text-sm/normal font-normal hover:underline"
          onClick={(event) => {
            event.stopPropagation()
            navigate(detail, 'forward')
          }}
        >
          {post.title}
        </button>
        <p className="line-clamp-3 text-xs/normal text-muted-foreground">{post.body}</p>
        <span className={cn(FURNITURE, 'text-muted-foreground')}>{post.category}</span>
      </div>
      <div className="min-w-0 max-w-64 shrink-0 basis-5/12">
        <div className={cn(POST_IMAGE_FRAME, 'relative overflow-hidden rounded-xs bg-muted')}>
          <ViewTransition default="none" name={postImageVtName(post.slug)} share={postImageShare}>
            <div
              className={cn(
                'absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-102 motion-reduce:transition-none',
                post.image,
              )}
            />
          </ViewTransition>
        </div>
      </div>
    </div>
  )
}

/**
 * Mirrors the production `Card` (`backdrop` variant) the insights index
 * renders: the image fills the `POST_IMAGE_FRAME` cell behind a scrim, the
 * copy sits on it, and the same body/title pair tags `nav-forward`.
 */
function MockBackdropCard({ post }: { post: MockPost }) {
  const { navigate } = useSimNav()
  const detail: MockRoute = `post/${post.slug}`

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: mirrors production useClickableCard; the title button inside is the keyboard path.
    // biome-ignore lint/a11y/noStaticElementInteractions: mirrors the production card's body-click surface; keyboard users get the title button.
    <div
      className={cn(
        POST_IMAGE_FRAME,
        'pressable pressable-subtle relative isolate flex cursor-pointer flex-col justify-end overflow-hidden rounded-lg bg-muted text-white',
      )}
      onClick={() => navigate(detail, 'forward')}
    >
      <ViewTransition default="none" name={postImageVtName(post.slug)} share={postImageShare}>
        <div className={cn('absolute inset-0', post.image)} />
      </ViewTransition>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-b from-transparent to-black/80"
      />
      <div className="relative flex flex-col gap-1 p-4">
        <span className={cn(FURNITURE, 'text-white/70')}>{post.category}</span>
        <button
          type="button"
          className="text-left text-sm font-medium hover:underline"
          onClick={(event) => {
            event.stopPropagation()
            navigate(detail, 'forward')
          }}
        >
          {post.title}
        </button>
      </div>
    </div>
  )
}

function MockPosts({ page }: { page: 1 | 2 }) {
  const { navigate } = useSimNav()
  const posts = page === 1 ? PAGE_ONE : PAGE_TWO
  const goToPage = (target: 1 | 2) => {
    if (target === page) return
    // Mirrors `Pagination`: an ordered sequence, tagged by direction.
    navigate(`posts/${target}`, target < page ? 'back' : 'forward')
  }

  return (
    <div className="space-y-4 px-5 py-6">
      <h3 className="text-xl tracking-tight">Insights</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {posts.map((post) => (
          <MockBackdropCard key={post.slug} post={post} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 pt-2">
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => goToPage(1)}>
          ‹ Prev
        </Button>
        {([1, 2] as const).map((n) => (
          <Button
            key={n}
            variant={n === page ? 'outline' : 'ghost'}
            size="icon-sm"
            onClick={() => goToPage(n)}
          >
            {n}
          </Button>
        ))}
        <Button variant="ghost" size="sm" disabled={page === 2} onClick={() => goToPage(2)}>
          Next ›
        </Button>
      </div>
      <p className="text-pretty text-xs text-muted-foreground">
        Title links and card bodies both tag nav-forward: useClickableCard tags its push, so a body
        click and a title click are indistinguishable, exactly as in production.
      </p>
    </div>
  )
}

/**
 * Mirrors `PostHero`: title and standfirst on the page column, the portrait
 * crop beside them in the same `POST_IMAGE_FRAME` the card used, the
 * article's facts pinned to the foot of the copy.
 */
function MockPostDetail({ post }: { post: MockPost }) {
  return (
    <article className="pb-6">
      <div className="px-5 pt-5">
        <BackLink label="All insights" to={listRouteFor(post.slug)} />
      </div>
      <header className="flex flex-col gap-6 px-5 pt-5 sm:flex-row sm:gap-8">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <p className={cn(FURNITURE, 'text-muted-foreground')}>{post.category}</p>
            <h3 className="text-heading-3">{post.title}</h3>
            <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
              {post.body}
            </p>
          </div>
          <dl className="flex flex-col">
            <div className="flex justify-between gap-4 border-t border-border py-2">
              <dt className={cn(FURNITURE, 'text-muted-foreground')}>Words</dt>
              <dd className={FURNITURE}>S&amp;S</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border py-2">
              <dt className={cn(FURNITURE, 'text-muted-foreground')}>Reading time</dt>
              <dd className={FURNITURE}>4 min</dd>
            </div>
          </dl>
        </div>
        <div
          className={cn(
            POST_IMAGE_FRAME,
            'relative w-full select-none overflow-hidden bg-muted sm:w-5/12 sm:shrink-0',
          )}
        >
          <ViewTransition default="none" name={postImageVtName(post.slug)} share={postImageShare}>
            <div className={cn('absolute inset-0', post.image)} />
          </ViewTransition>
        </div>
      </header>
      <p className="max-w-prose px-5 pt-6 text-pretty text-sm/relaxed text-muted-foreground">
        Everything in this frame runs through the production DirectionalTransition and the recipes
        in view-transition.css. The playground only overrides the :root timing variables while you
        are here.
      </p>
    </article>
  )
}

/**
 * Mirrors the `/works` index row (`WorkRow`): a pressable row tagged
 * `nav-forward`, its arrow nudging on hover. No shared element: the index
 * reaches a case study by the plain forward reveal; only the spotlight
 * takes it over.
 */
function MockWorks() {
  const { navigate } = useSimNav()
  return (
    <div className="space-y-2 px-5 py-6">
      <h3 className="text-xl tracking-tight">Work</h3>
      <div className="divide-y divide-border">
        {WORKS.map((work, index) => (
          <button
            key={work.slug}
            type="button"
            className="group pressable pressable-subtle flex w-full cursor-pointer flex-col gap-4 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:flex-row sm:items-center sm:gap-6"
            onClick={() => navigate(`work/${work.slug}`, 'forward')}
          >
            <span className={cn(FURNITURE, 'text-muted-foreground sm:w-8 sm:shrink-0')}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div
              className={cn(
                'aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-32',
                work.image,
              )}
            />
            <div className="flex min-w-0 grow flex-col gap-1.5">
              <p className={cn(FURNITURE, 'text-muted-foreground')}>
                {work.client} · {work.industry} · {work.year}
              </p>
              <h4 className="text-base font-medium group-hover:underline">{work.title}</h4>
              <ul className="flex flex-wrap gap-1.5">
                {work.capabilities.map((capability) => (
                  <li
                    key={capability}
                    className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.625rem] text-muted-foreground"
                  >
                    {capability}
                  </li>
                ))}
              </ul>
            </div>
            <IconArrowUpRight
              aria-hidden
              className="size-5 shrink-0 stroke-1 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </button>
        ))}
      </div>
      <p className="pt-2 text-pretty text-xs text-muted-foreground">
        Rows tag nav-forward and reveal from the right. The takeover belongs to the home spotlight
        alone: this index has no shared element to hand off.
      </p>
    </div>
  )
}

/**
 * The case-study opening, in either production hero layout. The media is the
 * takeover's destination: wrapped by the real `WorkImageTransition` so it
 * pairs with the spotlight under `work-open`, and marked `data-hero-media`
 * so the simulator can measure the landing's target.
 */
function MockCaseStudy({ work, layout }: { work: MockWork; layout: MockHeroLayout }) {
  const facts = (
    <dl className="flex flex-wrap gap-x-8 gap-y-3">
      <div className="flex flex-col gap-1">
        <dt className={cn(FURNITURE, 'font-medium text-foreground')}>Client</dt>
        <dd className="text-sm">{work.client}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className={cn(FURNITURE, 'font-medium text-foreground')}>Industry</dt>
        <dd className="text-sm">{work.industry}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className={cn(FURNITURE, 'font-medium text-foreground')}>Capabilities</dt>
        <dd className="text-sm">{work.capabilities.join(', ')}</dd>
      </div>
    </dl>
  )

  return (
    <article className="pb-6">
      {layout === 'landscape' ? (
        // `CaseStudyHeroLandscape`: title and facts in the gutter, then an
        // edge-to-edge media strip. The horizontal axis is already home, so
        // the landing closes vertically only.
        <header className="flex flex-col gap-8 pt-6">
          <div className="flex flex-col gap-6 px-5">
            <h3 className="max-w-md text-balance text-heading-3">{work.title}</h3>
            {facts}
          </div>
          <WorkImageTransition slug={work.slug}>
            <div className={cn('aspect-21/9 w-full', work.image)} data-hero-media />
          </WorkImageTransition>
        </header>
      ) : (
        // `CaseStudyHeroCenteredMedia`: media bands the center at half width
        // with the copy anchored around it; both axes have travel.
        <header className="flex flex-col gap-8 px-5 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3">
              <p className={cn(FURNITURE, 'text-foreground')}>{work.client}</p>
              <h3 className="max-w-md text-balance text-heading-3">{work.title}</h3>
            </div>
            <div className="flex flex-col gap-1 sm:items-end sm:text-right">
              <span className={cn(FURNITURE, 'font-medium text-foreground')}>Industry</span>
              <span className="text-sm">{work.industry}</span>
            </div>
          </div>
          <div className="sm:px-8">
            <WorkImageTransition slug={work.slug}>
              <div
                className={cn('mx-auto aspect-8/5 w-full sm:w-1/2', work.image)}
                data-hero-media
              />
            </WorkImageTransition>
          </div>
          <div className="flex flex-col gap-3">
            <p className={cn(FURNITURE, 'font-medium text-foreground')}>Capabilities</p>
            <ul className="flex flex-wrap items-center gap-2 text-sm">
              {work.capabilities.map((capability, index) => (
                <li key={capability} className="flex items-center gap-2">
                  {index > 0 && <span aria-hidden className="h-px w-6 bg-foreground" />}
                  {capability}
                </li>
              ))}
            </ul>
          </div>
        </header>
      )}
      <div className="space-y-4 px-5 pt-8">
        <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
          From the spotlight this hero arrived by takeover: the old page faded, the media glided to
          center and expanded to full screen, then the hero landing closed the mask one axis at a
          time onto this box and dissolved the case study&apos;s own copy in. From the index it
          arrived by the plain forward reveal.
        </p>
        <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
          Switch the case-study hero in the GUI: the edge-to-edge strip leaves the horizontal axis
          home, so its landing is a single vertical step; the centered media closes both.
        </p>
        <BackLink label="All work" to="works" />
      </div>
    </article>
  )
}

function MockAbout() {
  return (
    <div className="space-y-3 px-5 py-6">
      <h3 className="text-xl tracking-tight">About</h3>
      <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
        You arrived laterally: a top-down mask reveal with no spatial direction, the default for the
        header brand and every CMSLink that does not opt into a direction. The takeover menu&apos;s
        links land the same way, by a GSAP curtain that lifts on the same variables.
      </p>
      <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
        Nothing fades: the old page holds perfectly still while the new one wipes open over it, the
        same edge language as the scroll-reveal media wipe, at page scale.
      </p>
    </div>
  )
}
