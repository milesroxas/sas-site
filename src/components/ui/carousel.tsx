'use client'

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins,
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // A carousel switched off at this media query (`active: false`) is a
      // plain overflow container — the browser scrolls it with the same keys,
      // so swallowing them here would leave the arrows dead.
      if (api && !api.internalEngine().options.active) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollNext()
      }
    },
    [api, scrollPrev, scrollNext],
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on('reInit', onSelect)
    api.on('select', onSelect)

    return () => {
      api?.off('select', onSelect)
    }
  }, [api, onSelect])

  // Root Lenis runs `syncTouch`: it reads every touchmove itself and scrolls
  // the page by the finger's vertical delta, and it never checks whether embla
  // already claimed the move. So a sideways drag walked the page along with
  // the hand, by however much the finger drifted up or down. Embla decides
  // ownership per gesture (its axis lock on the first move), while Lenis's
  // static `data-lenis-prevent-horizontal` (the native rails' fix) decides per
  // event and would still let a wobbly frame through. Hand embla's verdict to
  // Lenis instead: while embla owns a pointer the viewport carries
  // `data-lenis-prevent`. A swipe embla releases as vertical emits `pointerUp`
  // from inside that first touchmove, before Lenis's window listener sees it,
  // so an up/down swipe started on a slide still smooth-scrolls the page.
  React.useEffect(() => {
    if (!api) return
    const viewport = api.rootNode()
    const claim = () => viewport.setAttribute('data-lenis-prevent', '')
    const release = () => viewport.removeAttribute('data-lenis-prevent')
    api.on('pointerDown', claim)
    api.on('pointerUp', release)

    return () => {
      api.off('pointerDown', claim)
      api.off('pointerUp', release)
      release()
    }
  }, [api])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: upstream shadcn uses a div with role="region" per the WAI-ARIA carousel pattern; <section> would diverge from the registry component */}
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation, opts } = useCarousel()
  // Embla only preventDefaults `dragstart` (the native link/image ghost) — it
  // leaves `mousedown` alone, so a mouse drag across a slide runs the browser's
  // text selection under the gesture and the rail ends up dragging a blue
  // highlight with it. Suppress selection on the drag surface itself, and only
  // where dragging is actually on: a carousel with `watchDrag: false` is a
  // static row whose copy should stay selectable.
  const isDraggable = opts?.watchDrag !== false

  return (
    <div
      ref={carouselRef}
      className={cn('overflow-hidden', isDraggable && 'select-none')}
      data-slot="carousel-content"
    >
      <div
        className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<'div'>) {
  const { orientation } = useCarousel()

  return (
    // biome-ignore lint/a11y/useSemanticElements: upstream shadcn uses a div with role="group"; <fieldset> carries different default rendering and would diverge from the registry component
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = 'outline',
  size = 'icon-sm',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        'absolute touch-manipulation rounded-full',
        orientation === 'horizontal'
          ? 'inset-y-0 -left-12 my-auto'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <IconChevronLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = 'outline',
  size = 'icon-sm',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        'absolute touch-manipulation rounded-full',
        orientation === 'horizontal'
          ? 'inset-y-0 -right-12 my-auto'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <IconChevronRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
}
