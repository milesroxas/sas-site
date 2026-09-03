import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mediaFixture, videoFixture } from '../fixtures'
import { CarouselBlock } from './Component'

// The effects hook needs a live embla engine + GSAP; its geometry and playback
// pieces have their own unit tests (geometry.test.ts).
vi.mock('./use-carousel-effects', () => ({ useCarouselEffects: vi.fn() }))

vi.mock('@/components/Media', () => ({
  Media: ({
    imgClassName,
    resource,
  }: {
    imgClassName?: string
    resource: { id?: number | string } | number | null
  }) => (
    <div
      data-img-class={imgClassName}
      data-testid="media"
      data-resource-id={typeof resource === 'object' ? resource?.id : resource}
    />
  ),
}))

const slides = [
  { id: 'slide-1', media: mediaFixture, caption: 'First caption' },
  { id: 'slide-2', media: videoFixture, caption: null },
]

const baseProps = {
  blockType: 'carousel' as const,
  slides,
  slideSize: 'full' as const,
  width: 'contained' as const,
  showArrows: false,
}

describe('CarouselBlock', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a slide per populated media doc, with captions', () => {
    render(<CarouselBlock {...baseProps} />)
    expect(screen.getAllByTestId('media')).toHaveLength(2)
    expect(screen.getByText('First caption')).toBeDefined()
  })

  it('skips slides whose media is an unpopulated id', () => {
    render(
      <CarouselBlock
        {...baseProps}
        slides={[...slides, { id: 'slide-3', media: 99, caption: 'Orphan' }]}
      />,
    )
    expect(screen.getAllByTestId('media')).toHaveLength(2)
    expect(screen.queryByText('Orphan')).toBeNull()
  })

  it('renders nothing when no slide is populated', () => {
    const { container } = render(<CarouselBlock {...baseProps} slides={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('overlays a poster on slides whose media has a populated poster', () => {
    const withPoster = {
      ...videoFixture,
      poster: mediaFixture,
    }
    const { container } = render(
      <CarouselBlock {...baseProps} slides={[{ id: 'slide-1', media: withPoster }]} />,
    )
    expect(container.querySelectorAll('[data-carousel-poster]')).toHaveLength(1)
  })

  it('inks only the active slide caption at rest', () => {
    const { container } = render(<CarouselBlock {...baseProps} slideSize="third" />)
    const captions = [...container.querySelectorAll<HTMLElement>('[data-carousel-caption]')]
    expect(captions.map((caption) => caption.style.opacity)).toEqual(['1'])
  })

  it('hides a non-active slide caption at rest', () => {
    const { container } = render(
      <CarouselBlock
        {...baseProps}
        slides={[
          { id: 'slide-1', media: mediaFixture, caption: 'First caption' },
          { id: 'slide-2', media: mediaFixture, caption: 'Second caption' },
        ]}
      />,
    )
    const captions = [...container.querySelectorAll<HTMLElement>('[data-carousel-caption]')]
    expect(captions.map((caption) => caption.style.opacity)).toEqual(['1', '0'])
  })

  it('gives the half size a four-fifths slide on a tighter gutter', () => {
    const { container } = render(<CarouselBlock {...baseProps} slideSize="half" />)
    const item = container.querySelector('[data-slot="carousel-item"]')
    expect(item?.className).toContain('md:basis-4/5')
    expect(item?.className).toContain('px-1.5')
    expect(container.querySelector('[data-slot="carousel-content"] > div')?.className).toContain(
      '-mx-1.5',
    )
  })

  it('shows more of the neighbours when a half carousel runs full-bleed', () => {
    const { container } = render(
      <CarouselBlock {...baseProps} slideSize="half" width="full-width" />,
    )
    const item = container.querySelector('[data-slot="carousel-item"]')
    expect(item?.className).toContain('md:basis-5/8')
    expect(item?.className).not.toContain('md:basis-4/5')
  })

  it('steps a third-size carousel up through the breakpoints', () => {
    const { container } = render(<CarouselBlock {...baseProps} slideSize="third" />)
    const item = container.querySelector('[data-slot="carousel-item"]')
    expect(item?.className).toContain('basis-3/4')
    expect(item?.className).toContain('md:basis-5/8')
    expect(item?.className).toContain('lg:basis-5/12')
  })

  it('peeks on mobile for the full slide size too, and fills the column from md', () => {
    const { container } = render(<CarouselBlock {...baseProps} />)
    const item = container.querySelector('[data-slot="carousel-item"]')
    expect(item?.className).toContain('basis-3/4')
    expect(item?.className).toContain('md:basis-full')
  })

  it('squares the corners of a slide that runs the whole window from md', () => {
    const { container } = render(
      <CarouselBlock {...baseProps} width="full-width" slideSize="full" />,
    )
    expect(container.querySelector('[data-testid="media"]')?.getAttribute('data-img-class')).toBe(
      'rounded-lg md:rounded-none',
    )
  })

  it('keeps rounded corners wherever a slide is inset from the window edge', () => {
    const contained = render(<CarouselBlock {...baseProps} />)
    expect(
      contained.container.querySelector('[data-testid="media"]')?.getAttribute('data-img-class'),
    ).toBe('rounded-lg')
    cleanup()
    const bleedHalf = render(<CarouselBlock {...baseProps} width="full-width" slideSize="half" />)
    expect(
      bleedHalf.container.querySelector('[data-testid="media"]')?.getAttribute('data-img-class'),
    ).toBe('rounded-lg')
  })

  it('overlays the arrows on mobile and only reserves gutter room from md', () => {
    const { container } = render(<CarouselBlock {...baseProps} showArrows />)
    expect(container.querySelector('[data-slot="carousel"]')?.className).toContain('md:mx-12')
    const prev = container.querySelector('[data-slot="carousel-previous"]')
    expect(prev?.className).toContain('left-4')
    expect(prev?.className).toContain('md:-left-12')
  })

  it('toggles the prev/next arrows', () => {
    const { container, rerender } = render(<CarouselBlock {...baseProps} />)
    expect(container.querySelectorAll('button')).toHaveLength(0)
    rerender(<CarouselBlock {...baseProps} showArrows />)
    expect(container.querySelectorAll('button')).toHaveLength(2)
  })
})
