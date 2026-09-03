'use client'

import { IconArrowUpRight } from '@tabler/icons-react'
import Link from 'next/link'
import type React from 'react'
import { Card, type CardPostData } from '@/components/Card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'

/** Three or fewer cards fill a static grid; more than that needs the rail. */
const CAROUSEL_MIN_COUNT = 4

/**
 * Slide width as a fraction of the rail's track. Every step is a whole number
 * of cards plus a half, never a whole number: the rail carries no arrows,
 * dragging is the whole interaction, and the `drag` cursor variant attaches
 * itself to `[data-slot="carousel"]` (features/cursor/variants), so the cut
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
 * Slide gap, the primitive's own way: each slide carries the whole gap as
 * start padding and the track's negative margin swallows the first one, so
 * the first card sits flush on the track's content edge and the last card ends
 * on its own edge with nothing trailing it. Both ends therefore land exactly
 * where `RAIL_INSET` puts the track. The grid uses the same `gap-16`, so both
 * layouts sit on one rhythm from `md`.
 *
 * A phone halves the gap (`gap-8`). The slide basis is a fraction of a narrow
 * window and the gap comes out of that fraction, so the full-width pair cost
 * the card a fifth of its own width; the peeking neighbour already says the
 * row continues, the seam only has to separate.
 *
 * `-ml-*`, not the logical `-ms-*`, because the shadcn track hardcodes `-ml-4`
 * and `cn`'s tailwind-merge only drops a class it recognises as the same
 * property: `-ms-8` leaves `-ml-4` standing and the cascade keeps it, which
 * cancels half the gap and pushes the first card off the column. `-ml-8`
 * replaces it outright. The primitive is left-to-right only here either way.
 */
const SLIDE_GUTTER = 'pl-8 md:pl-16'
const TRACK_GUTTER = '-ml-8 md:-ml-16'
const GRID_GAP = 'gap-16'

/**
 * Content inset. The root bleeds (`container-bleed`, which publishes
 * `--container-inset`), and the viewport, the element that clips, spends the
 * inset as padding: full width, with the first card on the page column at
 * rest and the last card on the column's far edge at the end of the pan. In
 * between, cards clip at the screen's edge, the way a collection view's
 * content inset works: the device edge is the cut, and a card leaving the
 * screen needs no fade to say the row continues. The mask this replaces
 * dissolved photographs into the page, which read as haze, and on the start
 * edge it sat mid-page, on the column, right under a heading that cuts clean.
 *
 * Embla measures its snaps and its scroll limit from the track's box, which
 * starts and ends at the viewport's padding edges: every snap lands a card on
 * the column, and the end limit stops with the last card's edge on it, so the
 * inset needs no help from JS.
 *
 * The touch rail is a native scroller, and there the viewport's end padding
 * counts for nothing: a scroller's padding extends its scrollable overflow
 * only past its own in-flow content, and the track (its one child) never
 * overflows, the slides do. Nor does an end margin on the last slide. What
 * does extend it is a box, so the track ends in a `::after` spacer the width
 * of the inset. Embla measures slides from the track's element children and
 * never sees the pseudo-element, and its end limit leaves the spacer beyond
 * the edge, so the two inputs do not double up.
 *
 * On the embla viewport, which the primitive does not expose through a prop.
 */
const RAIL_BLEED = 'container-bleed'
const RAIL_INSET = '[&_[data-slot=carousel-content]]:px-(--container-inset)'
const TRACK_END = 'after:shrink-0 after:basis-(--container-inset)'

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

/** 20px line + 12px each side = 44px (HIG minimum). See the link below. */
const LINK_TOUCH_TARGET = 'relative after:absolute after:inset-x-0 after:-inset-y-3 md:after:hidden'

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

  return (
    // `underMedia`: the cards are copy paired with media, so each card's frame
    // wipes open when the rail enters and its copy drops in on the same beat.
    <ScrollReveal as="div" variant="underMedia">
      {/*
        One row at every width: `items-baseline` sits the link on the heading's
        first baseline, not its cap line, so the pair reads as one line of
        furniture even where the heading wraps and the two sizes differ. The
        gap closes on a phone, where the link and its gap are a real share of
        the column, so the heading keeps the width for a two-line sentence.
      */}
      <div className="container mb-16 flex items-baseline justify-between gap-4 md:gap-8">
        {/*
          A rail label, not a section heading: the lead size on a phone, with
          heading-3's leading rather than lead's body leading (`/snug`), and
          `text-balance` evens the break so it does not orphan a word.
        */}
        <h2
          className="max-w-lg text-balance text-lead/snug font-light md:text-heading-3"
          data-reveal
          data-reveal-group="rail-intro"
        >
          {heading}
        </h2>
        {/*
          A secondary action, so a phone sets it at `sm` (14px, above the 11pt
          floor iOS puts on legible text) with the arrow stepped down to match;
          `lg` beside the lead-size heading read as a second heading. The
          `::after` pads the 20px line out to a 44px press target without
          inflating how it looks — the same trick the audience tabs and the
          carousel arrows use — and `md:after:hidden` drops the pad once the
          pointer is fine.
        */}
        <Link
          className={`${LINK_TOUCH_TARGET} group pressable flex shrink-0 items-center gap-2 text-sm md:gap-3 md:text-lg`}
          data-reveal
          data-reveal-group="rail-intro"
          href="/posts"
          transitionTypes={[...forwardNavTransitionTypes]}
        >
          View All
          <IconArrowUpRight
            aria-hidden="true"
            className="size-5 shrink-0 stroke-1 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none md:size-6"
          />
        </Link>
      </div>

      {isCarousel ? (
        // The rail spans the screen and its content sits on the page column
        // (see `RAIL_INSET`): at rest the first card lines up with the heading
        // above it and the row runs off the right of the screen, the cut card
        // in the browser's edge rather than a hand's width inside it. Panned,
        // cards clip at both screen edges, so the row reads as running under
        // the device's bezel rather than stopping at an invisible boundary.
        // The root is full width by being a block in a full-width shell; no
        // size class is needed. Both ends sit on the column: see `RAIL_INSET`.
        <Carousel
          aria-label="More insights"
          className={`${RAIL_BLEED} ${TOUCH_RAIL} ${RAIL_INSET}`}
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
        >
          <CarouselContent className={`${TRACK_GUTTER} ${TRACK_END}`}>
            {posts.map((post) => (
              <CarouselItem className={`${SLIDE_GUTTER} ${SLIDE_BASIS}`} key={post.slug}>
                <RailCard post={post} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
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
