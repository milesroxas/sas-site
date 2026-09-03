'use client'

import type React from 'react'
import { type CSSProperties, useId, useRef, useState } from 'react'
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
 * sliver is the only affordance a touch carousel has (no arrow gutter, no
 * scrollbar, no hover), so the editor's size choice starts at `md` and a phone
 * is always 1-up. The deck is packed (see ./visual-state), so everything
 * either side of the active slide is neighbour, less the gutter: three
 * quarters lands a ~25px sliver on each edge at 390px.
 */
const MOBILE_PEEK_BASIS = 'basis-3/4'

/**
 * Slide width from `md` up.
 *
 * The pose recesses and blurs the neighbours and the packed deck (see
 * ./visual-state) pulls them in against the active slide, so every pixel
 * outside the active slide is peek, and nobody is reading a peek. The sizes
 * therefore run well above their names. `half` at four fifths leaves a tenth
 * of the column per side to the neighbours. `third` at five twelfths is what
 * three packed slides need to fill the column: the neighbours' outer edges
 * just clip the column edge, so no fourth slide (or its blur halo) leaks in
 * behind them.
 *
 * `third` steps up through the breakpoints rather than jumping straight to
 * three across at 768px, where five twelfths of the column is narrower than
 * the phone slide it replaces.
 */
const slideSizeClasses: Record<NonNullable<CarouselBlockProps['slideSize']>, string> = {
  full: 'md:basis-full',
  half: 'md:basis-4/5',
  third: 'md:basis-5/8 lg:basis-5/12',
}

/**
 * Full-bleed overrides. The window is the column here, so a `half` carousel
 * can spend a quarter of it on the neighbours and still leave a large active
 * slide: five eighths of 1440px is 900px of media, a match for the contained
 * slide at that viewport with twice its peek.
 */
const fullWidthSizeClasses: Partial<Record<NonNullable<CarouselBlockProps['slideSize']>, string>> =
  {
    half: 'md:basis-5/8',
  }

/**
 * Slide gutter, split evenly across both edges (8px + 8px = the same 16px
 * between slides as shadcn's default `-ml-4`/`pl-4`). The default puts the
 * whole gutter on one edge, which under `align: 'center'` pushes the active
 * slide 8px off centre and leaves the right-hand sliver 16px narrower than
 * the left. Halving it makes the peek symmetric; the negative track margin
 * still cancels the outer padding, so the first slide stays flush with the
 * page column.
 *
 * `half` runs 12px instead of 16px: with one big slide carrying the frame,
 * every pixel of gutter comes straight off the media, and the recessed
 * neighbours already read as separate without the extra air.
 */
const slideGutterClasses: Record<
  NonNullable<CarouselBlockProps['slideSize']>,
  { slide: string; track: string }
> = {
  full: { slide: 'px-2', track: '-mx-2' },
  half: { slide: 'px-1.5', track: '-mx-1.5' },
  third: { slide: 'px-2', track: '-mx-2' },
}

// Depth-starved queries leave uploads as ids; skip those slides up front so
// render indexes stay aligned with embla's snap indexes.
const renderableSlidesOf = (slides: CarouselBlockProps['slides']): Slide[] =>
  (slides ?? []).filter((slide) => slide.media && typeof slide.media === 'object')

/**
 * Viewport-height cap on the slide width.
 *
 * Every size above is a fraction of the column, so the slide's height is
 * whatever its media's aspect ratio makes of that width: a portrait deck at
 * four fifths of a desktop column runs taller than the window. The cap is the
 * width at which the deck's tallest media reaches 70svh, published per deck
 * as `--carousel-slide-aspect` (see `tallestAspectRatio`), so no slide is ever
 * taller than that. The other 30svh holds the header, the caption and a
 * margin of page around the slide.
 *
 * It caps every slide by the same width, not each by its own media: the deck
 * stays uniform, which the packed pose (see ./visual-state) and the tween's
 * snap spacing (see ./geometry) both assume. Landscape media in a portrait
 * deck simply run shorter, centred by `items-center` on the track. Below the
 * cap the width fraction still wins, so a landscape deck is untouched until
 * the window is short enough to need it.
 */
const SLIDE_HEIGHT_CAP = 'max-w-[calc(70svh*var(--carousel-slide-aspect))]'

/**
 * Width over height of the deck's tallest media, or undefined when no slide
 * carries dimensions (an upload processed without them), in which case the
 * deck runs uncapped rather than against a guessed ratio.
 */
const tallestAspectRatio = (slides: Slide[]): number | undefined => {
  let tallest: number | undefined
  for (const slide of slides) {
    const { height, width } = slide.media as PopulatedMedia
    if (!width || !height) continue
    const aspect = width / height
    if (tallest === undefined || aspect < tallest) tallest = aspect
  }
  return tallest
}

const CarouselSlide: React.FC<{
  cornerClass: string
  gutterClass: string
  restSigned: number
  sizeClass: string
  slide: Slide
}> = ({ cornerClass, gutterClass, restSigned, sizeClass, slide }) => {
  const media = slide.media as PopulatedMedia
  const posterDoc = media.poster && typeof media.poster === 'object' ? media.poster : null
  return (
    <CarouselItem className={cn('@container', gutterClass, MOBILE_PEEK_BASIS, sizeClass)}>
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
  const slideAspect = tallestAspectRatio(renderableSlides)
  const sizeClass = cn(
    (isFullWidth && fullWidthSizeClasses[size]) || slideSizeClasses[size],
    slideAspect !== undefined && SLIDE_HEIGHT_CAP,
  )
  const gutter = slideGutterClasses[size]
  // A corner radius reads as a card edge, which needs room around it. A slide
  // that runs the whole window has none, and the curve gets cut off against
  // the browser edge, so it squares off. Only a full-width block with
  // full-width slides can span the window, and even then only when the
  // height cap isn't holding it in from the edges, so the slide asks its own
  // width (the item is a size container): a slide within a scrollbar's width
  // of the window squares off, one inset any further keeps its corners. Below
  // `md` the slide is always peeking, inset on both sides, and the query never
  // matches.
  const cornerClass = cn(
    'rounded-lg',
    isFullWidth && size === 'full' && '@min-[calc(100vw-1.5rem)]:rounded-none',
  )

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
          <CarouselContent
            className={cn(gutter.track, 'items-center')}
            style={
              slideAspect !== undefined
                ? ({ '--carousel-slide-aspect': slideAspect.toFixed(4) } as CSSProperties)
                : undefined
            }
          >
            {renderableSlides.map((slide, index) => (
              <CarouselSlide
                cornerClass={cornerClass}
                gutterClass={gutter.slide}
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
