'use client'

import type React from 'react'
import { useId, useRef, useState } from 'react'
import { ThemeBand } from '@/blocks/shared/section'
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
import { restSignedDistance, slideVisualState } from './visual-state'

type Props = CarouselBlockProps & {
  className?: string
  enableGutter?: boolean
  disableInnerContainer?: boolean
}

type Slide = NonNullable<CarouselBlockProps['slides']>[number]
type PopulatedMedia = Exclude<Slide['media'], number | null | undefined>

const slideSizeClasses: Record<NonNullable<CarouselBlockProps['slideSize']>, string> = {
  full: 'basis-full',
  half: 'md:basis-1/2',
  third: 'md:basis-1/3',
}

// Depth-starved queries leave uploads as ids; skip those slides up front so
// render indexes stay aligned with embla's snap indexes.
const renderableSlidesOf = (slides: CarouselBlockProps['slides']): Slide[] =>
  (slides ?? []).filter((slide) => slide.media && typeof slide.media === 'object')

const CarouselSlide: React.FC<{ restSigned: number; sizeClass: string; slide: Slide }> = ({
  restSigned,
  sizeClass,
  slide,
}) => {
  const media = slide.media as PopulatedMedia
  const posterDoc = media.poster && typeof media.poster === 'object' ? media.poster : null
  return (
    <CarouselItem className={sizeClass}>
      {/* First child is the tween target. Server-rendered rest-state styles
          match the tween's frame 0, so hydration never flickers. */}
      <div className="will-change-slide" style={slideVisualState(restSigned)}>
        <div className="relative">
          {/* Playback is gated by useCarouselEffects: only the active slide plays. */}
          <Media
            autoPlay={false}
            imgClassName="rounded-lg"
            resource={slide.media}
            videoClassName="rounded-lg"
          />
          {posterDoc && (
            // Poster sits over the paused video and melts away through the
            // dissolve filter when the slide activates.
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              data-carousel-poster
            >
              <Media fill imgClassName="rounded-lg object-cover" resource={posterDoc} />
            </div>
          )}
        </div>
        {slide.caption && <p className="mt-4 text-sm text-muted-foreground">{slide.caption}</p>}
      </div>
    </CarouselItem>
  )
}

const CarouselArrows: React.FC<{ isFullWidth: boolean }> = ({ isFullWidth }) => (
  <>
    {/* Full width has no outer gutter, so arrows overlay the slides instead. */}
    <CarouselPrevious className={cn(isFullWidth && 'left-4 z-10')} />
    <CarouselNext className={cn(isFullWidth && 'right-4 z-10')} />
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
  const sizeClass = slideSizeClasses[slideSize ?? 'full']

  return (
    <ThemeBand theme={theme}>
      <div className={cn({ container: enableGutter && !isFullWidth }, className)}>
        <CarouselFilters
          caId={caId}
          caOffsets={caOffsets}
          dissolveId={dissolveId}
          dissolveMap={dissolveMap}
        />
        {/* Contained arrows sit beside the slides, so reserve gutter room for them. */}
        <Carousel
          className={cn(showArrows && !isFullWidth && 'mx-12')}
          opts={{
            loop: true,
            // Half-size slides center the active one, so the loop keeps a
            // partial neighbor visible on both edges.
            align: slideSize === 'half' ? 'center' : 'start',
          }}
          setApi={setApi}
        >
          {/* items-center: slides keep their media's natural aspect ratio, so shorter slides align to the vertical middle of the tallest. */}
          <CarouselContent className="items-center">
            {renderableSlides.map((slide, index) => (
              <CarouselSlide
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
    </ThemeBand>
  )
}
