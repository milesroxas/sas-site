'use client'

import { IconArrowLeft, IconWorld } from '@tabler/icons-react'
import Lenis from 'lenis'
import type React from 'react'
import { createContext, useContext, useEffect, useRef, ViewTransition } from 'react'
import { useTempus } from 'tempus/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { DirectionalTransition, postImageVtName } from '@/shared/lib/view-transition'
import { cn } from '@/utilities/ui'
import type { SimDirection, SimPhase } from './use-sim-navigation'
import './transition-demo.css'

/**
 * A miniature of the production site, small enough to fit a viewport frame but
 * wired identically: card title links tag `nav-forward`, menu links tag
 * `nav-lateral`, pagination tags by direction, post images share a morph name
 * with their detail hero, the home hero recedes on its own group — and card
 * *bodies* navigate untagged, reproducing the `useClickableCard` gap.
 */

export type MockRoute = 'home' | 'posts/1' | 'posts/2' | `post/${string}` | 'about'

type MockPost = {
  slug: string
  title: string
  category: string
  body: string
  /** Gradient stand-in for the card/hero image — the morph reads on any element. */
  image: string
}

const PAGE_ONE: MockPost[] = [
  {
    slug: 'refraction-study',
    title: 'Refraction study',
    category: 'Lab',
    body: 'The image above arrived by shared-element morph: the card image and this hero carry the same view-transition-name, so the browser interpolates one rect into the other while the rest of the page slides.',
    image: 'bg-linear-to-br from-chart-2 via-chart-3 to-chart-5',
  },
  {
    slug: 'dispersion-mesh',
    title: 'Dispersion mesh',
    category: 'Lab',
    body: 'Try the back link above against the browser back button in the frame chrome. The link tags nav-back and slides; the browser button is untagged and cuts — both are production behavior.',
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
    body: 'You reached page two through the pagination, which tags direction imperatively: higher pages slide forward, lower pages slide back — the one place the site calls addTransitionType by hand.',
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
    body: 'Drop the slide distance to zero in the GUI and forward navigation collapses into the lateral fade. Push it to 240 and the spatial metaphor shouts. The shipped 60px is the quiet middle.',
    image: 'bg-linear-to-r from-chart-2 via-chart-5 to-chart-3',
  },
]

const ALL_POSTS = [...PAGE_ONE, ...PAGE_TWO]
/** The home page features the first two posts, morph-named like everywhere else. */
const FEATURED = PAGE_ONE.slice(0, 2)

const postBySlug = (slug: string) => ALL_POSTS.find((post) => post.slug === slug)

const slugOf = (route: MockRoute) => (route.startsWith('post/') ? route.slice(5) : null)

/** Which list route renders a card for the given slug. */
const listRouteFor = (slug: string): MockRoute =>
  PAGE_ONE.some((post) => post.slug === slug) ? 'posts/1' : 'posts/2'

const routeShowsImage = (route: MockRoute, slug: string) => {
  if (route === 'home') return FEATURED.some((post) => post.slug === slug)
  if (route === 'posts/1') return PAGE_ONE.some((post) => post.slug === slug)
  if (route === 'posts/2') return PAGE_TWO.some((post) => post.slug === slug)
  return route === `post/${slug}`
}

/** Which independently-animating groups a from→to pair engages (for the timeline). */
export const runFlags = (from: MockRoute, to: MockRoute) => {
  const fromSlug = slugOf(from)
  const toSlug = slugOf(to)
  const morph = fromSlug
    ? routeShowsImage(to, fromSlug)
    : toSlug
      ? routeShowsImage(from, toSlug)
      : false
  return { morph, hero: from === 'home' || to === 'home' }
}

const routePath = (route: MockRoute) => {
  if (route === 'home') return '/'
  if (route === 'posts/1') return '/posts'
  if (route === 'posts/2') return '/posts/page/2'
  if (route === 'about') return '/about'
  return `/posts/${slugOf(route)}`
}

type SimNav = {
  navigate: (to: MockRoute, direction: SimDirection | null) => void
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

type MockViewportProps = {
  route: MockRoute
  phase: SimPhase
  navigate: (to: MockRoute, direction: SimDirection | null) => void
  canGoBack: boolean
  onBrowserBack: () => void
}

/**
 * The window's scroller: a shadcn ScrollArea whose viewport is driven by its
 * own Lenis instance, tuned like the site's root scroll. It mounts inside the
 * keyed transition boundary, so every navigation gets a fresh scroller at the
 * top — the production stale-`targetScroll` hazard (see SmoothScrollProvider)
 * structurally cannot happen here.
 */
function MockScroller({ children }: { children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    // Mirror SmoothScrollProvider: reduced motion gets native scrolling.
    if (reducedMotion) return
    const wrapper = viewportRef.current
    if (!wrapper) return
    const lenis = new Lenis({
      wrapper,
      // Radix wraps children in a single content div — Lenis measures it.
      content: (wrapper.firstElementChild as HTMLElement | null) ?? wrapper,
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.15,
      syncTouch: true,
      smoothWheel: true,
      autoRaf: false,
    })
    lenisRef.current = lenis
    return () => {
      lenisRef.current = null
      lenis.destroy()
    }
  }, [reducedMotion])

  // Same clock as the site's root Lenis (see lib/interactions/smooth-scroll).
  useTempus(({ time }: { time: number }) => {
    lenisRef.current?.raf(time)
  })

  return (
    <ScrollArea
      className="h-[80vh]"
      viewportRef={viewportRef}
      viewportClassName="overscroll-contain"
    >
      {children}
    </ScrollArea>
  )
}

/** Browser-frame chrome around the mock site: back button, address bar, phase readout. */
export function MockViewport({
  route,
  phase,
  navigate,
  canGoBack,
  onBrowserBack,
}: MockViewportProps) {
  const loading = phase === 'network' || phase === 'server'

  // Snapshots ignore the frame's overflow (they render in the top layer);
  // the scoped rule in transition-demo.css clips them while this is mounted.
  useEffect(() => {
    document.documentElement.classList.add('vt-sim-clip')
    return () => document.documentElement.classList.remove('vt-sim-clip')
  }, [])

  return (
    <SimNavContext.Provider value={{ navigate }}>
      <div
        data-lenis-prevent
        className="overflow-hidden rounded-lg border border-border bg-background"
      >
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!canGoBack}
            onClick={onBrowserBack}
            aria-label="Browser back — untagged, hard cut"
            title="Browser back — untagged, hard cut"
          >
            <IconArrowLeft aria-hidden />
          </Button>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
            {loading ? (
              <Spinner className="size-3.5 shrink-0" />
            ) : (
              <IconWorld className="size-3.5 shrink-0" aria-hidden />
            )}
            <span className="truncate">suits-sandals.com{routePath(route)}</span>
          </div>
          <span
            className={cn(
              'hidden shrink-0 font-mono text-xs sm:inline',
              phase === 'idle' ? 'text-muted-foreground/60' : 'text-foreground',
            )}
            aria-live="polite"
          >
            {PHASE_LABEL[phase]}
          </span>
        </div>

        {/* Like the production layout: the header lives outside the animated
            boundary (it persists through swaps), overlaying the scroller the
            way the fixed site header overlays the page frame. */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 z-20 flex h-12 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-sm">
            <button
              type="button"
              className="font-semibold tracking-tight hover:text-muted-foreground"
              onClick={() => navigate('home', 'lateral')}
            >
              S&amp;S
            </button>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <button
                type="button"
                className="hover:text-foreground"
                onClick={() => navigate('posts/1', 'lateral')}
              >
                Work
              </button>
              <button
                type="button"
                className="hover:text-foreground"
                onClick={() => navigate('about', 'lateral')}
              >
                About
              </button>
            </nav>
          </div>

          {/* The boundary is the window-sized box — the scroller lives inside
              it, so page snapshots are window-sized and the clip rule can pin
              them to the frame. */}
          <DirectionalTransition key={route}>
            <MockScroller>
              <div className="pt-12">
                <MockPage route={route} />
              </div>
            </MockScroller>
          </DirectionalTransition>
        </div>
      </div>
    </SimNavContext.Provider>
  )
}

function MockPage({ route }: { route: MockRoute }) {
  if (route === 'home') return <MockHome />
  if (route === 'posts/1') return <MockPosts page={1} />
  if (route === 'posts/2') return <MockPosts page={2} />
  if (route === 'about') return <MockAbout />
  const post = postBySlug(slugOf(route) ?? '')
  return post ? <MockPostDetail post={post} /> : <MockAbout />
}

function MockHome() {
  const { navigate } = useSimNav()
  return (
    <div>
      {/* Real class: this hero recedes on the production home-hero group. */}
      <section className="vt-home-hero relative overflow-hidden bg-linear-to-br from-chart-5/80 via-chart-3/40 to-background px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Suits &amp; Sandals
        </p>
        <h3 className="mt-2 text-balance text-heading-3">Make it make sense</h3>
        <p className="mt-3 max-w-sm text-pretty text-sm/relaxed text-muted-foreground">
          Leave this page and the hero recedes on its own 560ms track, dollying back over the
          incoming page while the rest of the route swaps underneath.
        </p>
        <Button className="mt-5" onClick={() => navigate('posts/1', 'lateral')}>
          View the work
        </Button>
      </section>
      <section className="space-y-4 px-5 py-6">
        <h4 className="text-sm text-muted-foreground">Featured work</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURED.map((post) => (
            <MockCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}

/**
 * Mirrors the production `Card`: the whole body is clickable but untagged (the
 * `useClickableCard` gap — hard cut), while the title link tags `nav-forward`
 * and the image shares a morph name with the detail hero.
 */
function MockCard({ post }: { post: MockPost }) {
  const { navigate } = useSimNav()
  const detail: MockRoute = `post/${post.slug}`

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: mirrors production useClickableCard; the title button inside is the keyboard path.
    // biome-ignore lint/a11y/noStaticElementInteractions: deliberately reproduces the production card's untagged body-click (the gap this demo surfaces); keyboard users get the tagged title button.
    <div
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card"
      onClick={() => navigate(detail, null)}
    >
      <ViewTransition default="none" name={postImageVtName(post.slug)} share="morph">
        <div className={cn('h-24 w-full', post.image)} />
      </ViewTransition>
      <div className="space-y-1 p-4">
        <p className="font-mono text-xs uppercase text-muted-foreground">{post.category}</p>
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
      <h3 className="text-xl tracking-tight">Journal</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {posts.map((post) => (
          <MockCard key={post.slug} post={post} />
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
        Title links tag nav-forward; the card body navigates untagged — the production
        useClickableCard gap, kept here so you can feel the difference.
      </p>
    </div>
  )
}

function MockPostDetail({ post }: { post: MockPost }) {
  const { navigate } = useSimNav()
  return (
    <article className="pb-6">
      <div className="px-5 pt-5">
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => navigate(listRouteFor(post.slug), 'back')}
        >
          ← All posts
        </button>
      </div>
      <ViewTransition default="none" name={postImageVtName(post.slug)} share="morph">
        <div className={cn('mx-5 mt-4 h-40 rounded-lg', post.image)} />
      </ViewTransition>
      <div className="space-y-3 px-5 pt-5">
        <p className="font-mono text-xs uppercase text-muted-foreground">{post.category}</p>
        <h3 className="text-heading-3">{post.title}</h3>
        <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">{post.body}</p>
        <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
          Everything in this frame runs through the production DirectionalTransition and the recipes
          in view-transition.css — the playground only overrides the :root timing variables while
          you are here.
        </p>
      </div>
    </article>
  )
}

function MockAbout() {
  return (
    <div className="space-y-3 px-5 py-6">
      <h3 className="text-xl tracking-tight">About</h3>
      <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
        You arrived laterally — a pure fade with no spatial direction, the default for menu links,
        the logo, and every CMSLink that does not opt into a direction.
      </p>
      <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
        Lateral is the site&apos;s quietest move: the old page blurs out over 150ms, the new one
        resolves in over 210ms, and nothing slides.
      </p>
    </div>
  )
}
