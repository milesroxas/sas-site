import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '../fixtures'
import { CarouselBlock } from './Component'

const slides = Array.from({ length: 5 }, (_, i) => ({
  id: `slide-${i + 1}`,
  media: mediaFixture,
  caption: `Slide ${i + 1} caption`,
}))

const meta = {
  title: 'Blocks/Carousel',
  component: CarouselBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'carousel',
    slides,
    slideSize: 'full',
    width: 'contained',
    showArrows: true,
  },
} satisfies Meta<typeof CarouselBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutArrows: Story = {
  args: {
    showArrows: false,
  },
}

export const FullWidth: Story = {
  args: {
    width: 'full-width',
    slideSize: 'half',
  },
}

/**
 * Full-width block with full-width slides: the only configuration where a
 * slide runs the whole window, so its corner radius comes off from `md`.
 * Resize below `md` and the slide insets to a peeking card, radius included.
 */
export const FullBleed: Story = {
  args: {
    width: 'full-width',
    slideSize: 'full',
  },
}

export const Half: Story = {
  args: {
    slideSize: 'half',
  },
}

export const Third: Story = {
  args: {
    slideSize: 'third',
  },
}

/**
 * Phone width: every size drops to a three-quarter slide so a sliver of each
 * neighbour stays in frame, and the arrows overlay the slides instead of
 * reserving an outer gutter.
 */
export const MobilePeek: Story = {
  args: {
    slideSize: 'third',
  },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  parameters: {
    // Chromatic snapshots this one at phone width so the peek is regression-covered.
    chromatic: { viewports: [390] },
  },
}

export const WithoutCaptions: Story = {
  args: {
    slides: slides.map((slide) => ({ ...slide, caption: null })),
  },
}

export const MixedAspectRatios: Story = {
  args: {
    slideSize: 'third',
    slides: [
      { id: 'wide', media: mediaFixture, caption: 'Wide (1200×630)' },
      { id: 'square', media: { ...mediaFixture, width: 630, height: 630 }, caption: 'Square' },
      { id: 'short', media: { ...mediaFixture, width: 1200, height: 300 }, caption: 'Short' },
      { id: 'wide-2', media: mediaFixture, caption: 'Wide (1200×630)' },
    ],
  },
}

/**
 * Portrait media: at four fifths of a desktop column a 4:5 slide would run
 * taller than the window, so the deck is capped at the width where its
 * tallest media reaches 70svh. Shrink the browser height and the deck follows.
 */
export const Portrait: Story = {
  args: {
    slideSize: 'half',
    slides: slides.map((slide) => ({
      ...slide,
      media: {
        ...mediaFixture,
        alt: 'Window onto a mountain landscape',
        url: 'https://media.suits-sandals.com/window-landscape-mountains-poster.jpg',
        filename: 'window-landscape-mountains-poster.jpg',
        width: 1920,
        height: 2400,
      },
    })),
  },
}

export const WithVideo: Story = {
  args: {
    slides: [slides[0], { id: 'slide-video', media: videoFixture, caption: null }, slides[2]],
  },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}

export const Brand: Story = {
  args: { theme: 'brand' },
}
