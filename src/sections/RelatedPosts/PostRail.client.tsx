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
 * Slide width as a fraction of the rail's window. Every step is a whole number
 * of cards plus a half, never a whole number: the rail carries no arrows —
 * dragging is the whole interaction, and the `drag` cursor variant attaches
 * itself to `[data-slot="carousel"]` (features/cursor/variants) — so the cut
 * card is the only thing on screen that says the list continues. Half a card
 * reads as an interrupted card; a sliver reads as a rendering seam.
 *
 * Three and a half is the desktop figure (`lg+`): cards scale with the window
 * so the row always fills, instead of packing a fourth-and-a-half at `xl` that
 * left each card narrower than its own title. `md` holds at two and a half —
 * a third-and-a-half of that column is still too tight for the split card.
 *
 * A phone gets one card with a peek of the next, the same affordance the
 * carousel block uses. Five sixths rather than that block's five eighths
 * because these slides carry no scale-back pose eating their own width.
 */
const SLIDE_BASIS = 'basis-5/6 md:basis-[calc(100%/2.5)] lg:basis-[calc(100%/3.5)]'

/**
 * Slide gutter, split evenly across both edges so the gap between two cards is
 * the sum of theirs (`px-8` + `px-8` = `gap-16`). The negative track margin
 * cancels the outer half, keeping the first card flush with the page column —
 * the rail reads as starting at the text above it, not indented from it. The
 * grid uses the same `gap-16` so both layouts sit on one rhythm.
 */
const SLIDE_GUTTER = 'px-8'
const TRACK_GUTTER = '-mx-8'
const GRID_GAP = 'gap-16'

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
    <ScrollReveal as="div" className="container" variant="underMedia">
      <div className="mb-16 flex items-start justify-between gap-8 border-t border-border pt-8">
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
        // The rail runs past the page column's right edge: the cut card sits in
        // the gutter rather than a hand's width inside it, so the list reads as
        // continuing off the page. The left edge stays on the column.
        <div className="-mr-(--spacing-gutter)">
          <Carousel
            aria-label="More insights"
            opts={{
              // A finite archive, so no loop and no wrap-around: `start` keeps
              // the first card on the page column and `trimSnaps` stops the
              // last drag from parking on empty gutter.
              align: 'start',
              containScroll: 'trimSnaps',
            }}
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
        <div className={`grid grid-cols-1 md:grid-cols-3 ${GRID_GAP}`}>
          {posts.map((post) => (
            <RailCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </ScrollReveal>
  )
}
