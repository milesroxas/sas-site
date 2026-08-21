import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mediaFixture, videoFixture } from '../fixtures'
import { CarouselBlock } from './Component'

// The effects hook needs a live embla engine + GSAP; its geometry and playback
// pieces have their own unit tests (geometry.test.ts).
vi.mock('./use-carousel-effects', () => ({ useCarouselEffects: vi.fn() }))

vi.mock('@/components/Media', () => ({
  Media: ({ resource }: { resource: { id?: number | string } | number | null }) => (
    <div
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

  it('toggles the prev/next arrows', () => {
    const { container, rerender } = render(<CarouselBlock {...baseProps} />)
    expect(container.querySelectorAll('button')).toHaveLength(0)
    rerender(<CarouselBlock {...baseProps} showArrows />)
    expect(container.querySelectorAll('button')).toHaveLength(2)
  })
})
