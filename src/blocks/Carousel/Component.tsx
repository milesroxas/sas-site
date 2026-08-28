'use client'

import type React from 'react'
import { useId, useRef, useState } from 'react'
import { Section } from '@/blocks/shared/section'
import { Media } from '@/components/Media'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { CarouselBlock as CarouselBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { CarouselFilters } from './filters'
import { useCarouselEffects } from './use-carousel-effects'
import { captionOpacity, restSignedDistance, slideVisualState } from './visual-state'

type Props = CarouselBlockProps & {
  className?: string
  enableGutter?: boolean
  disableInnerContainer?: boolean
}

type Slide = NonNullable<CarouselBlockProps['slides']>[number]
type PopulatedMedia = Exclude<Slide['media'], number | null | undefined>

/**
 * Every size shows one slide plus a sliver of each neighbour on a phone: the
 * sliver is the only affordance a touch carousel has — no arrow gutter, no
 * scrollbar, no hover — so the editor's size choice starts at `md` and a phone
 * is always 1-up. Five eighths is what the sliver costs: a neighbour is drawn
 * at 0.8 scale and pushed 90px back (see ./visual-state), together eating
 * ~26% of its width, so an 85%-style slide would leave nothing showing. Five
 * eighths lands a ~25px sliver on each edge at 390px.
 */
const MOBILE_PEEK_BASIS = 'basis-5/8'

/**
 * Slide width from `md` up. `third` steps 1 → 2 → 3 rather than jumping
 * straight to three columns at 768px, where a third of the column is narrower
 * than the phone slide it replaces.
 */
const slideSizeClasses: Record<NonNullable<CarouselBlockProps['slideSize']>, string> = {
  full: 'md:basis-full',
  half: 'md:basis-1/2',
  third: 'md:basis-1/2 lg:basis-1/3',
}

/**
 * Slide gutter, split evenly across both edges (8px + 8px = the same 16px
 * between slides as shadcn's default `-ml-4`/`pl-4`). The default puts the
 * whole gutter on one edge, which under `align: 'center'` pushes the active
 * slide 8px off centre and leaves the right-hand sliver 16px narrower than
 * the left. Halving it makes the peek symmetric; the negative track margin
 * still cancels the outer padding, so the first slide stays flush with the
 * page column.
 */
const TRACK_GUTTER = '-mx-2'
const SLIDE_GUTTER = 'px-2'

// Depth-starved queries leave uploads as ids; skip those slides up front so
// render indexes stay aligned with embla's snap indexes.
const renderableSlidesOf = (slides: CarouselBlockProps['slides']): Slide[] =>
  (slides ?? []).filter((slide) => slide.media && typeof slide.media === 'object')

const CarouselSlide: React.FC<{
  cornerClass: string
  restSigned: number
  sizeClass: string
  slide: Slide
}> = ({ cornerClass, restSigned, sizeClass, slide }) => {
  const media = slide.media as PopulatedMedia
  const posterDoc = media.poster && typeof media.poster === 'object' ? media.poster : null
  return (
    <CarouselItem className={cn(SLIDE_GUTTER, MOBILE_PEEK_BASIS, sizeClass)}>
      {/* First child is the tween target. Server-rendered rest-state styles
          match the tween's frame 0, so hydration never flickers. */}
      <div className="will-change-slide" style={slideVisualState(restSigned)}>
        <div className="relative">
          {/* Playback is gated by useCarouselEffects: only the active slide plays. */}
          <Media
            autoPlay={false}
            imgClassName={cornerClass}
            resource={slide.media}
            videoClassName={cornerClass}
          />
          {posterDoc && (
            // Poster sits over the paused video and melts away through the
            // dissolve filter when the slide activates.
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              data-carousel-poster
            >
              <Media fill imgClassName={cn(cornerClass, 'object-cover')} resource={posterDoc} />
            </div>
          )}
        </div>
        {slide.caption && (
          // Only the active slide carries ink; the fade is written by the same
          // per-frame writer as the pose (see ./use-carousel-effects), and this
          // rest-state opacity is that writer's frame 0.
          <p
            className="mt-4 text-sm text-muted-foreground"
            data-carousel-caption
            style={{ opacity: captionOpacity(restSigned) }}
          >
            {slide.caption}
          </p>
        )}
      </div>
    </CarouselItem>
  )
}

/**
 * Below `md` the arrows overlay the slides in both widths: reserving an outer
 * gutter for them there would spend a quarter of a phone's column on chrome.
 * From `md` the contained width moves them back outside the slides.
 *
 * `::after` pads the 24px control out to a 48px touch target on touch-sized
 * screens without changing how it looks. `md:after:hidden` drops the pad once
 * the pointer is fine, so it can't swallow hover on the slide behind it.
 */
const ARROW_TOUCH_TARGET = 'z-10 after:absolute after:-inset-3 md:after:hidden'

/**
 * An overlaid arrow sits on the media, where the outline variant's transparent
 * fill leaves the chevron unreadable over a dark frame. A translucent surface
 * of the current theme restores the contrast without hiding the slide.
 */
const ARROW_OVERLAY = 'bg-background/80 backdrop-blur-xs dark:bg-background/80'
/** Contained arrows clear the slides at `md`, so the surface comes back off. */
const ARROW_CONTAINED_MD = 'md:bg-transparent md:backdrop-blur-none dark:md:bg-transparent'

const CarouselArrows: React.FC<{ isFullWidth: boolean }> = ({ isFullWidth }) => (
  <>
    <CarouselPrevious
      className={cn(
        'left-4',
        ARROW_TOUCH_TARGET,
        ARROW_OVERLAY,
        !isFullWidth && `md:-left-12 ${ARROW_CONTAINED_MD}`,
      )}
    />
    <CarouselNext
      className={cn(
        'right-4',
        ARROW_TOUCH_TARGET,
        ARROW_OVERLAY,
        !isFullWidth && `md:-right-12 ${ARROW_CONTAINED_MD}`,
      )}
    />
  </>
)

export const CarouselBlock: React.FC<Props> = (props) => {
  const { className, enableGutter = true, showArrows, slides, slideSize, theme, width } = props

  const [api, setApi] = useState<CarouselApi>()
  const filterIdBase = useId()
  const caId = `${filterIdBase}-ca`
  const dissolveId = `${filterIdBase}-dissolve`
  const caOffsets = useRef<{ red: SVGFEOffsetElement | null; blue: SVGFEOffsetElement | null }>({
    red: null,
    blue: null,
  })
  const dissolveMap = useRef<SVGFEDisplacementMapElement | null>(null)
  useCarouselEffects({ api, caId, caOffsets, dissolveId, dissolveMap })

  const renderableSlides = renderableSlidesOf(slides)

  if (!renderableSlides.length) return null

  const isFullWidth = width === 'full-width'
  const size = slideSize ?? 'full'
  const sizeClass = slideSizeClasses[size]
  // A corner radius reads as a card edge, which needs room around it. A slide
  // that runs the whole window — full-width block, full-width slides — has
  // none, and the curve gets cut off against the browser edge, so it squares
  // off. That only happens from `md`: below it the slide is peeking, inset on
  // both sides, and reads as a card again.
  const cornerClass = cn('rounded-lg', isFullWidth && size === 'full' && 'md:rounded-none')

  return (
    <Section spacing="loose" theme={theme}>
      <div className={cn({ container: enableGutter && !isFullWidth }, className)}>
        <CarouselFilters
          caId={caId}
          caOffsets={caOffsets}
          dissolveId={dissolveId}
          dissolveMap={dissolveMap}
        />
        {/* Only the md+ contained layout reserves outer gutter room for the arrows. */}
        <Carousel
          className={cn(showArrows && !isFullWidth && 'md:mx-12')}
          opts={{
            loop: true,
            // The pose in ./visual-state is symmetric about the active slide,
            // so the track is centred at every size: the active slide sits in
            // the middle with an equal sliver of each neighbour. At
            // `basis-full` this is identical to `start` — the slide is the
            // column — so one rule covers every size.
            align: 'center',
          }}
          setApi={setApi}
        >
          {/* items-center: slides keep their media's natural aspect ratio, so shorter slides align to the vertical middle of the tallest. */}
          <CarouselContent className={cn(TRACK_GUTTER, 'items-center')}>
            {renderableSlides.map((slide, index) => (
              <CarouselSlide
                cornerClass={cornerClass}
                key={slide.id}
                restSigned={restSignedDistance(index, renderableSlides.length)}
                sizeClass={sizeClass}
                slide={slide}
              />
            ))}
          </CarouselContent>
          {showArrows && <CarouselArrows isFullWidth={isFullWidth} />}
        </Carousel>
      </div>
    </Section>
  )
}
