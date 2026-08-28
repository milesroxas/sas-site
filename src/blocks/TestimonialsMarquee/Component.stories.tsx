import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import { paragraph, richText, TEXT_FORMAT_BOLD, testimonialFixtures, text } from '../fixtures'
import { TestimonialsMarqueeBlock } from './Component'

const meta = {
  title: 'Blocks/TestimonialsMarquee',
  component: TestimonialsMarqueeBlock,
  parameters: {
    layout: 'padded',
  },
  args: {
    blockType: 'testimonialsMarquee',
    richText: richText(
      paragraph(
        text('The result is a '),
        text('clearer story', TEXT_FORMAT_BOLD),
        text(', a stronger system, and something people can '),
        text('understand and use', TEXT_FORMAT_BOLD),
        text('.'),
      ),
    ),
    links: [
      {
        id: 'primary',
        link: {
          type: 'custom',
          url: '#',
          label: 'Schedule a call',
          appearance: 'default',
        },
      },
    ],
    testimonials: testimonialFixtures,
  },
} satisfies Meta<typeof TestimonialsMarqueeBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * Below `lg` the marquee is replaced by a swipeable snap rail — quotes hold
 * still to be read, with the next card peeking as the scroll affordance.
 */
export const MobileRail: Story = {
  globals: { viewport: { value: 'iphone12', isRotated: false } },
  parameters: { viewport: { options: INITIAL_VIEWPORTS } },
}

export const SingleLane: Story = {
  args: {
    testimonials: testimonialFixtures.slice(0, 1),
  },
}

export const NoCallToAction: Story = {
  args: {
    links: [],
  },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}

export const Brand: Story = {
  args: { theme: 'brand' },
}
