'use client'

import { IconArrowUpRight } from '@tabler/icons-react'
import Link from 'next/link'
import type React from 'react'
import { useState } from 'react'
import { Card, type CardPostData } from '@/components/Card'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { useCarouselEdgeFade } from '@/components/ui/use-carousel-edge-fade'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'

/** Three or fewer cards fill a static grid; more than that needs the rail. */
const CAROUSEL_MIN_COUNT = 4

/**
 * Slide width as a fraction of the rail's window. Every step is a whole number
 * of cards plus a half, never a whole number: the rail carries no arrows —
 * dragging is the whole interaction, and the `drag` cursor variant attaches
 * itself to `[data-slot="carousel"]` (features/cursor/variants) — so the cut
 * card is the only thing on screen that says the list continues. Half a card
 * reads as an interrupted card; a sliver reads as a rendering seam.
 *
 * Two and a half from `md` up: cards scale with the window so the row always
 * fills, instead of packing a third-and-a-half that left each card narrower
 * than its own title once the split card took its share.
 *
 * A phone gets one card with a peek of the next, the same affordance the
 * carousel block uses. Five sixths rather than that block's five eighths
 * because these slides carry no scale-back pose eating their own width.
 */
const SLIDE_BASIS = 'basis-5/6 md:basis-[calc(100%/2.5)]'

/**
 * Slide gutter, split evenly across both edges so the gap between two cards is
 * the sum of theirs (`px-8` + `px-8` = `gap-16`). The negative track margin
 * cancels the outer half at the **start** only, keeping the first card flush
 * with the page column — the rail reads as starting at the text above it, not
 * indented from it. The end half stays: the rail runs off the screen (see
 * `container-bleed-e` below), so cancelling it too would land the last card
 * dead against the browser edge at the final snap. The grid uses the same
 * `gap-16` so both layouts sit on one rhythm.
 *
 * `-ml-*`, not the logical `-ms-*`, because the shadcn track hardcodes `-ml-4`
 * and `cn`'s tailwind-merge only drops a class it recognises as the same
 * property: `-ms-8` leaves `-ml-4` standing and the cascade keeps it, which
 * cancels half the gutter and pushes the first card 16px off the column.
 * `-ml-8` replaces it outright. The primitive is left-to-right only here
 * either way.
 */
const SLIDE_GUTTER = 'px-8'
const TRACK_GUTTER = '-ml-8'
const GRID_GAP = 'gap-16'

/**
 * Touch rail. Embla drags its track from pointer events, and a finger keeps
 * feeding those even while root Lenis (`syncTouch`) drives the page from the
 * same touchmove — so a swipe that is mostly down and a little sideways pans
 * the rail and scrolls the page at once. Below a fine pointer the rail is a
 * plain scroll container instead (embla `active: false`, see `opts`) and the
 * browser's own axis lock decides which one the gesture belongs to. Same fix
 * as the testimonials rail (blocks/TestimonialsMarquee/Component).
 *
 * `data-lenis-prevent-horizontal` on the root is the other half: Lenis
 * preventDefaults every touchmove, so without it a sideways swipe never
 * reaches the browser and the rail cannot pan at all. It releases only the
 * gestures Lenis reads as horizontal — an up/down swipe started on a card
 * still smooth-scrolls the page.
 *
 * No snap classes: this is a rail, not a slideshow (see `dragFree` below), and
 * native momentum already comes to rest wherever the hand left it.
 *
 * The classes land on the embla viewport, which the primitive does not expose
 * through a prop.
 */
const TOUCH_RAIL =
  'pointer-coarse:[&_[data-slot=carousel-content]]:no-scrollbar pointer-coarse:[&_[data-slot=carousel-content]]:overflow-x-auto pointer-coarse:[&_[data-slot=carousel-content]]:overscroll-x-contain'

/**
 * Edge fade, one per input. `drag-fade-x` reads embla's translate through
 * `useCarouselEdgeFade` because a dragged viewport never scrolls; the touch
 * rail has a real scroll position, so it takes `scroll-fade-x` off its own
 * scroll timeline instead — the same signal every native rail on the site
 * gives. `scroll-fade-32` restates the wider cap `drag-fade-x` sets for a card
 * rail, so both inputs dissolve by the same amount.
 */
const EDGE_FADE =
  'pointer-fine:[&_[data-slot=carousel-content]]:drag-fade-x pointer-coarse:[&_[data-slot=carousel-content]]:scroll-fade-x pointer-coarse:[&_[data-slot=carousel-content]]:scroll-fade-32'

const RailCard: React.FC<{ post: CardPostData }> = ({ post }) => (
  // h-full: every card takes the tallest neighbour's height, so the category
  // chips sit on one line across the row instead of wherever each card's copy
  // happens to end.
  <Card className="h-full" doc={post} relationTo="posts" showCategories variant="split" />
)

export const PostRail: React.FC<{
  heading: string
  posts: CardPostData[]
}> = ({ heading, posts }) => {
  const isCarousel = posts.length >= CAROUSEL_MIN_COUNT
  const [api, setApi] = useState<CarouselApi>()
  useCarouselEdgeFade(api)

  return (
    // `underMedia`: the cards are copy paired with media, so each card's frame
    // wipes open when the rail enters and its copy drops in on the same beat.
    <ScrollReveal as="div" variant="underMedia">
      <div className="container mb-16 flex items-start justify-between gap-8">
        {/* Grouped with the link beside it: one line of furniture, one beat. */}
        <h2
          className="max-w-lg text-heading-3 font-light"
          data-reveal
          data-reveal-group="rail-intro"
        >
          {heading}
        </h2>
        <Link
          className="group pressable flex shrink-0 items-center gap-3 text-lg"
          data-reveal
          data-reveal-group="rail-intro"
          href="/posts"
          transitionTypes={[...forwardNavTransitionTypes]}
        >
          View All
          <IconArrowUpRight
            aria-hidden="true"
            className="size-6 shrink-0 stroke-1 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          />
        </Link>
      </div>

      {isCarousel ? (
        // The rail starts on the page column and runs off the end of the
        // screen — the clipped card sits in the browser's edge, not a hand's
        // width inside it, so the list reads as continuing off the page rather
        // than stopping at an invisible boundary. The edge fade dissolves
        // whichever side still has cards behind it (see `EDGE_FADE`), and the
        // viewport carries its own width — no size class needed.
        <div className="container-bleed-e">
          <Carousel
            aria-label="More insights"
            className={`${TOUCH_RAIL} ${EDGE_FADE}`}
            data-lenis-prevent-horizontal
            opts={{
              // Embla only where a mouse can drag it. `breakpoints` re-reads
              // this on the media query, so a tablet that gains a pointer
              // rebuilds the carousel rather than staying a scroll container.
              active: false,
              breakpoints: { '(pointer: fine)': { active: true } },
              // A finite archive, so no loop and no wrap-around: `start` keeps
              // the first card on the page column and `trimSnaps` stops the
              // last drag from parking on empty gutter.
              align: 'start',
              containScroll: 'trimSnaps',
              // A rail, not a slideshow. Embla's snapped default only commits a
              // drag that clears its go-to-next force threshold and otherwise
              // animates back to the snap it started on — with no arrows here,
              // a deliberate short drag reads as the rail refusing to move.
              // Free drag lets the track come to rest under its own momentum
              // wherever the hand left it, still clamped by `trimSnaps` at both
              // ends, which is how every other scrollable row on the site
              // behaves.
              dragFree: true,
            }}
            setApi={setApi}
          >
            <CarouselContent className={TRACK_GUTTER}>
              {posts.map((post) => (
                <CarouselItem className={`${SLIDE_GUTTER} ${SLIDE_BASIS}`} key={post.slug}>
                  <RailCard post={post} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      ) : (
        <div className={`container grid grid-cols-1 md:grid-cols-3 ${GRID_GAP}`}>
          {posts.map((post) => (
            <RailCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </ScrollReveal>
  )
}
