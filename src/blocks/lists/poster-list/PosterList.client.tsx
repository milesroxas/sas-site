'use client'

import Link from 'next/link'
import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react'
import type { BandTheme } from '@/blocks/shared/band-theme'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Visual } from '@/components/Visual'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'
import { POSTER_ACTION, type PosterItem, type PosterListLayout } from './item'
import { PosterShelf } from './PosterShelf'
import './poster-list.css'

/**
 * The physical tuning, stated once. Decided in a prototype round
 * (Drift); see docs/blocks-reorg-roadmap.md.
 */
export const POSTER_DRIFT = {
  /** Picture travel inside its frame across the rail, % of the picture. */
  parallax: 7,
  /**
   * Picture overscale. Needs more than `1 + 2 × parallax%` so the picture's
   * edge never reaches the frame's rounded corners at either end of its travel.
   */
  scale: 1.18,
  /** Pointer tilt at the poster's edge, degrees. */
  tilt: 7,
  /** Lean per px/ms of rail velocity, degrees, and its cap. */
  lean: 5,
  leanMax: 9,
  /** Follow time constants, ms: how quickly tilt and lean catch their targets. */
  tiltTau: 110,
  leanTau: 140,
  perspective: 1000,
  /**
   * Passing under the shelf (or off the rail's start edge): a poster hinges
   * away on its trailing edge by up to this many degrees, shrinks to `1 -
   * recedeScale`, and darkens, in step with how much of it has gone under.
   */
  recedeAngle: 12,
  recedeScale: 0.03,
  /**
   * Weight on a throw. Embla's free drag sends the rail as far as the release
   * speed says and glides there quickly; these carry it a share of that
   * distance, over a longer glide, so the rail feels heavy rather than
   * slippery. `throwGlide` is Embla's scroll-body duration (it uses 43 on a
   * free-drag release; higher is slower).
   */
  throwCarry: 0.7,
  throwGlide: 55,
} as const

/**
 * Applies `throwCarry` and `throwGlide` the moment Embla releases a drag:
 * Embla emits `pointerUp` right after it sets the throw's target, so the
 * target is pulled back toward where the hand let go (still within the
 * rail's ends) and the glide slowed. Dragging under the hand stays 1:1.
 */
function useWeightedThrow(api: CarouselApi | undefined) {
  useEffect(() => {
    if (!api) return
    const weigh = () => {
      const engine = api.internalEngine()
      if (!engine.options.dragFree) return
      const from = engine.location.get()
      const to = engine.target.get()
      engine.target.set(engine.limit.constrain(from + (to - from) * POSTER_DRIFT.throwCarry))
      // biome-ignore lint/correctness/useHookAtTopLevel: Embla's scroll-body setter, not a React hook
      engine.scrollBody.useDuration(POSTER_DRIFT.throwGlide)
    }
    api.on('pointerUp', weigh)
    return () => {
      api.off('pointerUp', weigh)
    }
  }, [api])
}

/**
 * Progressive blur (Apple's material edge): stacked `backdrop-filter`
 * layers, each twice the blur of the last, each masked to an overlapping band
 * lower than the one before, so the frost deepens toward the bottom with no
 * visible step. A tilted poster cannot use it: Chromium drops the masks on
 * backdrop filters under a non-planar transform and the frost shows a hard
 * top edge. So the frost is built from the picture itself (`FROST`): blurred
 * copies inside the picture's own layer, masked in progressively, which also
 * moves with the parallax.
 */
const FROST = [
  { px: 6, from: 38, to: 62 },
  { px: 18, from: 58, to: 88 },
] as const

/**
 * The scrim under the description: black, eased rather than linear (a linear
 * ramp bands visibly over photographs). Stops follow an ease-in-out curve
 * (larsenwork.com/easing-gradients), alpha scaled to `SCRIM_ALPHA`.
 */
const SCRIM_ALPHA = 0.72
const SCRIM_STOPS: [number, number][] = [
  [0, 0],
  [0.013, 8.1],
  [0.049, 15.5],
  [0.104, 22.5],
  [0.175, 29],
  [0.259, 35.3],
  [0.352, 41.2],
  [0.45, 47.1],
  [0.55, 52.9],
  [0.648, 58.8],
  [0.741, 64.7],
  [0.825, 71],
  [0.896, 77.5],
  [0.951, 84.5],
  [0.987, 91.9],
  [1, 100],
]
const SCRIM = `linear-gradient(to bottom, ${SCRIM_STOPS.map(
  ([a, at]) => `rgb(0 0 0 / ${(a * SCRIM_ALPHA).toFixed(3)}) ${at}%`,
).join(', ')})`

/*
 * The rail is the site's PostRail pattern (sections/RelatedPosts): Embla
 * drags it where a mouse can (free momentum, clamped at both ends), a touch
 * screen gets a native scroller and the browser's own axis lock, and
 * `data-lenis-prevent-horizontal` hands sideways gestures to the rail while
 * up/down keeps Lenis's smooth page scroll. The drag cursor attaches itself
 * to `[data-slot="carousel"]` (features/cursor).
 */
const TOUCH_RAIL =
  'pointer-coarse:[&_[data-slot=carousel-content]]:no-scrollbar pointer-coarse:[&_[data-slot=carousel-content]]:overflow-x-auto pointer-coarse:[&_[data-slot=carousel-content]]:overscroll-x-contain'
const TRACK_END = 'after:shrink-0 after:basis-(--container-inset)'

/**
 * Room around the posters inside the clipping viewport: a tilted or leaning
 * poster grows past its own box, and its shadow falls below it. The viewport
 * pads by that much and the rail's negative margin gives it back, so the
 * posters still sit on the column and nothing they draw is cut.
 */
const RAIL_ROOM = '-my-12 [&_[data-slot=carousel-content]]:py-12'

/**
 * Poster width per layout, in posters per track: a whole number plus a half,
 * so the cut poster says the row scrolls. Two rows get the full column; one
 * row shares it with the copy.
 */
const SLIDE_BASIS: Record<PosterListLayout, string> = {
  stacked: 'basis-2/3 md:basis-[calc(100%/2.5)] lg:basis-[calc(100%/3.5)]',
  row: 'basis-2/3 md:basis-[calc(100%/1.5)] lg:basis-[calc(100%/2.5)]',
}

/**
 * Where the rail rests and bleeds. Two rows: it spans the screen and rests on
 * the page column (`container-bleed`'s inset). One row: it spans the screen
 * too, under the copy's shelf, and rests where the copy column ends.
 */
const RAIL_PLACEMENT: Record<PosterListLayout, string> = {
  stacked: 'container-bleed [&_[data-slot=carousel-content]]:px-(--container-inset)',
  // Full width under the copy's shelf from `md`: the first poster rests where
  // the copy column ends (`--poster-rail-start`, poster-list.css) and the row
  // slides beneath the shelf instead of being cut beside it.
  row: '[&_[data-slot=carousel-content]]:px-(--container-inset) md:[&_[data-slot=carousel-content]]:pl-(--poster-rail-start)',
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

/** Index of the first poster fully in view, for touch, where nothing hovers. */
function useTouchActive(rootRef: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState<number | null>(null)
  useEffect(() => {
    const viewport = rootRef.current?.querySelector<HTMLElement>('[data-slot=carousel-content]')
    if (!viewport || !window.matchMedia('(pointer: coarse)').matches) return
    const slides = Array.from(viewport.querySelectorAll<HTMLElement>('[data-slot=carousel-item]'))
    const ratios = new Map<Element, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio)
        const full = slides.findIndex((slide) => (ratios.get(slide) ?? 0) > 0.9)
        setActive(full >= 0 ? full : null)
      },
      { root: viewport, threshold: [0, 0.5, 0.9, 1] },
    )
    for (const slide of slides) observer.observe(slide)
    return () => observer.disconnect()
  }, [rootRef])
  return active
}

/**
 * The drift: each picture slides inside its frame as its poster crosses the
 * rail, the row leans into a throw and settles as it slows, the poster under
 * a mouse tilts toward it with a soft sheen, and grabbing presses the posters
 * back. One damped loop, running only while the rail is on screen; reduced
 * motion turns all of it off.
 */
function useDrift(railRef: RefObject<HTMLElement | null>, api: CarouselApi | undefined) {
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    const root = railRef.current
    const viewport = root?.querySelector<HTMLElement>('[data-slot=carousel-content]')
    if (!root || !viewport || reduced) return
    const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slot=carousel-item]'))
    const tilts = slides.map((s) => s.querySelector<HTMLElement>('[data-poster-tilt]'))
    const depths = slides.map((s) => s.querySelector<HTMLElement>('[data-poster-depth]'))
    const medias = slides.map((s) => s.querySelector<HTMLElement>('[data-poster-media]'))
    const fine = window.matchMedia('(pointer: fine)').matches
    const location = () =>
      fine && api ? api.internalEngine().location.get() : -viewport.scrollLeft

    let offsets: number[] = []
    let widths: number[] = []
    let viewportWidth = 0
    let railStart = 0
    let slideGap = 0
    // Read on layout changes only, never inside the loop.
    const measure = () => {
      const at = location()
      const box = viewport.getBoundingClientRect()
      viewportWidth = box.width
      offsets = slides.map((s) => s.getBoundingClientRect().left - box.left - at)
      widths = slides.map((s) => s.offsetWidth)
      // Where a resting poster starts: the edge it slips under when it leaves.
      railStart = Number.parseFloat(getComputedStyle(viewport).paddingLeft) || 0
      slideGap = slides[0] ? Number.parseFloat(getComputedStyle(slides[0]).paddingLeft) || 0 : 0
    }

    const tilt = slides.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }))
    let last = location()
    let lastTime = performance.now()
    let lean = 0
    let raf = 0

    const frame = (time: number) => {
      raf = requestAnimationFrame(frame)
      const dt = clamp(time - lastTime, 1, 64)
      const at = location()
      const velocity = (at - last) / dt
      last = at
      lastTime = time
      lean +=
        (clamp(velocity * POSTER_DRIFT.lean, -POSTER_DRIFT.leanMax, POSTER_DRIFT.leanMax) - lean) *
        (1 - Math.exp(-dt / POSTER_DRIFT.leanTau))
      const k = 1 - Math.exp(-dt / POSTER_DRIFT.tiltTau)
      slides.forEach((_, i) => {
        const center = (offsets[i] ?? 0) + (widths[i] ?? 0) / 2 + at
        const p = clamp((center - viewportWidth / 2) / viewportWidth, -1, 1)
        const media = medias[i]
        if (media)
          media.style.transform = `translate3d(${(-p * POSTER_DRIFT.parallax).toFixed(3)}%, 0, 0) scale(${POSTER_DRIFT.scale})`
        const t = tilt[i]
        const el = tilts[i]
        if (!t || !el) return
        t.x += (t.tx - t.x) * k
        t.y += (t.ty - t.y) * k
        el.style.transform = `perspective(${POSTER_DRIFT.perspective}px) rotateX(${t.x.toFixed(3)}deg) rotateY(${(t.y + lean).toFixed(3)}deg)`
        // How much of this poster has passed the rail's start edge, 0 to 1.
        const depth = depths[i]
        if (!depth) return
        const left = (offsets[i] ?? 0) + slideGap + at
        const width = Math.max((widths[i] ?? 0) - slideGap, 1)
        const q = clamp((railStart - left) / width, 0, 1)
        depth.style.setProperty('--poster-depth', q.toFixed(3))
        depth.style.transform =
          q > 0
            ? `perspective(${POSTER_DRIFT.perspective}px) rotateY(${(-q * POSTER_DRIFT.recedeAngle).toFixed(3)}deg) scale(${(1 - q * POSTER_DRIFT.recedeScale).toFixed(4)})`
            : ''
      })
    }
    const start = () => {
      if (raf) return
      last = location()
      lastTime = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const visibility = new IntersectionObserver(([entry]) =>
      entry?.isIntersecting ? start() : stop(),
    )
    visibility.observe(root)
    const resize = new ResizeObserver(measure)
    resize.observe(viewport)
    api?.on('reInit', measure)

    const cleanups = slides.map((slide, i) => {
      const el = tilts[i]
      if (!el || !fine) return () => {}
      const move = (event: PointerEvent) => {
        const box = el.getBoundingClientRect()
        const nx = (event.clientX - box.left) / box.width - 0.5
        const ny = (event.clientY - box.top) / box.height - 0.5
        const t = tilt[i]
        if (t) {
          t.ty = nx * POSTER_DRIFT.tilt * 2
          t.tx = -ny * POSTER_DRIFT.tilt * 2
        }
        el.style.setProperty('--poster-sheen-x', `${((nx + 0.5) * 100).toFixed(1)}%`)
        el.style.setProperty('--poster-sheen-y', `${((ny + 0.5) * 100).toFixed(1)}%`)
      }
      const leave = () => {
        const t = tilt[i]
        if (t) {
          t.tx = 0
          t.ty = 0
        }
      }
      slide.addEventListener('pointermove', move)
      slide.addEventListener('pointerleave', leave)
      return () => {
        slide.removeEventListener('pointermove', move)
        slide.removeEventListener('pointerleave', leave)
      }
    })

    const grab = () => root.setAttribute('data-grabbing', '')
    const release = () => root.removeAttribute('data-grabbing')
    api?.on('pointerDown', grab).on('pointerUp', release)

    measure()
    return () => {
      stop()
      visibility.disconnect()
      resize.disconnect()
      api?.off('reInit', measure).off('pointerDown', grab).off('pointerUp', release)
      for (const off of cleanups) off()
      for (const el of [...tilts, ...medias, ...depths]) el?.style.removeProperty('transform')
      for (const el of depths) el?.style.removeProperty('--poster-depth')
    }
  }, [api, railRef, reduced])
}

function PosterPicture({ item }: { item: PosterItem }) {
  if (!item.visual) {
    return (
      <div className="poster-fallback absolute inset-0 grid place-items-end justify-start bg-muted">
        <span className="text-subheading text-muted-foreground">{item.title}</span>
      </div>
    )
  }
  return (
    <Visual
      fill
      htmlElement={null}
      imgClassName="object-cover"
      placement="card"
      size="(min-width: 1024px) 28vw, (min-width: 768px) 40vw, 70vw"
      visual={item.visual}
    />
  )
}

function Poster({ item, active }: { item: PosterItem; active: boolean }) {
  const body = (
    <div className="poster-depth" data-poster-depth>
      <div className="poster-tilt" data-poster-tilt>
        <div className="poster-frame">
          <div className="poster-media" data-poster-media>
            <PosterPicture item={item} />
            {item.visual &&
              FROST.map((layer) => (
                <div
                  aria-hidden="true"
                  className="poster-frost"
                  key={layer.px}
                  style={{
                    filter: `blur(${layer.px}px)`,
                    maskImage: `linear-gradient(to bottom, transparent ${layer.from}%, black ${layer.to}%)`,
                  }}
                >
                  <PosterPicture item={item} />
                </div>
              ))}
          </div>
          <div className="poster-veil">
            <div aria-hidden="true" className="poster-scrim" style={{ backgroundImage: SCRIM }} />
            <div className="poster-veil-text">
              <p className="poster-desc">{item.description}</p>
              {item.href && (
                <span className="text-sm font-medium">
                  {POSTER_ACTION} <span aria-hidden="true">↗</span>
                </span>
              )}
            </div>
          </div>
          <span aria-hidden="true" className="poster-sheen" />
        </div>
      </div>
      <p className="poster-caption">
        <span className="poster-label">{item.title}</span>
        {item.facts.length > 0 && (
          <span className={cn(eyebrowClassName, 'poster-facts')}>
            {item.facts.map((fact, i) => (
              <span key={fact}>
                {i > 0 && (
                  <span aria-hidden="true" className="poster-facts-sep">
                    ·
                  </span>
                )}
                {fact}
              </span>
            ))}
          </span>
        )}
      </p>
    </div>
  )
  return (
    <article className="poster" data-active={active || undefined}>
      {item.href ? (
        <Link className="poster-hit" draggable={false} href={item.href}>
          {body}
        </Link>
      ) : (
        // biome-ignore lint/a11y/noNoninteractiveTabindex: unlinked posters still reveal their description on keyboard focus
        <div className="poster-hit" tabIndex={0}>
          {body}
        </div>
      )}
    </article>
  )
}

function PosterRail({
  items,
  label,
  layout,
}: {
  items: PosterItem[]
  label: string
  layout: PosterListLayout
}) {
  const railRef = useRef<HTMLDivElement>(null)
  const [api, setApi] = useState<CarouselApi>()
  const active = useTouchActive(railRef)
  useDrift(railRef, api)
  useWeightedThrow(api)
  return (
    // The rail's own wrapper is the media wipe target: it never carries a
    // transform, so the reveal's viewport gate reads it reliably.
    <div className="poster-rail" data-reveal="media" ref={railRef}>
      <Carousel
        aria-label={label}
        className={cn(RAIL_PLACEMENT[layout], RAIL_ROOM, TOUCH_RAIL)}
        data-lenis-prevent-horizontal
        opts={{
          active: false,
          breakpoints: { '(pointer: fine)': { active: true } },
          align: 'start',
          containScroll: 'trimSnaps',
          dragFree: true,
        }}
        setApi={setApi}
      >
        <CarouselContent className={cn('-ml-8', TRACK_END)}>
          {items.map((item, i) => (
            <CarouselItem className={cn('pl-8', SLIDE_BASIS[layout])} key={item.id}>
              <Poster active={active === i} item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

function Copy({
  eyebrow,
  heading,
  paragraphs,
  layout,
}: {
  eyebrow?: string | null
  heading: string
  paragraphs: string[]
  layout: PosterListLayout
}) {
  const stacked = layout === 'stacked'
  const head = (
    <div className="text-stack">
      {eyebrow && (
        <p className={eyebrowClassName} data-reveal data-reveal-group="poster-head">
          {eyebrow}
        </p>
      )}
      <h2 className="text-subheading text-balance" data-reveal data-reveal-group="poster-head">
        {heading}
      </h2>
    </div>
  )
  const summary = paragraphs.length > 0 && (
    <div className="space-y-3 text-body text-pretty text-muted-foreground" data-reveal>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
  if (stacked) {
    return (
      <BlockGrid className="items-end">
        <div className="md:col-span-4">{head}</div>
        {summary && <div className="md:col-span-4 lg:col-span-3 lg:col-start-6">{summary}</div>}
      </BlockGrid>
    )
  }
  return (
    <div className="flex flex-col gap-6">
      {head}
      {summary}
    </div>
  )
}

/**
 * The Poster list's client half: copy and rail in either layout. The
 * renderer wraps it in the shared under-media reveal (`reveal-variants.ts`):
 * the copy drops in and the rail wipes open.
 */
export function PosterListSection({
  bare,
  eyebrow,
  heading,
  paragraphs,
  layout,
  items,
  theme,
}: {
  bare?: boolean
  eyebrow?: string | null
  heading: string
  paragraphs: string[]
  layout: PosterListLayout
  items: PosterItem[]
  theme?: BandTheme | null
}): ReactNode {
  if (items.length === 0) return null
  const rail = <PosterRail items={items} label={heading} layout={layout} />
  return (
    <Section bare={bare} spacing="loose" theme={theme}>
      {layout === 'stacked' ? (
        <div className="flex flex-col gap-12 md:gap-16">
          <Container>
            <Copy eyebrow={eyebrow} heading={heading} layout={layout} paragraphs={paragraphs} />
          </Container>
          {rail}
        </div>
      ) : (
        // Layers, from `md`: the rail at the bottom across the full width, the
        // shelf over its start (the page colour under the copy, a progressive
        // blur clearing at the rail's edge), the copy on top. Below `md` they
        // simply stack.
        <div className="poster-row container-bleed">
          <div className="poster-row-copy">
            <Container>
              <BlockGrid className="items-start">
                <div className="poster-copy md:col-span-3 lg:col-span-2">
                  <Copy
                    eyebrow={eyebrow}
                    heading={heading}
                    layout={layout}
                    paragraphs={paragraphs}
                  />
                </div>
              </BlockGrid>
            </Container>
          </div>
          <PosterShelf />
          <div className="poster-row-rail min-w-0">{rail}</div>
        </div>
      )}
    </Section>
  )
}
