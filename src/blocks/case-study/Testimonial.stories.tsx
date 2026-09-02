import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, testimonialFixtures } from '../fixtures'
import { TestimonialBlock } from './Testimonial'

const testimonial = {
  ...testimonialFixtures[0],
  speakerRole: 'VP Marketing',
}

const meta = {
  title: 'Blocks/CaseStudy/Testimonial',
  component: TestimonialBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    block: {
      blockType: 'caseStudyTestimonial',
      layout: 'editorial',
      showPortrait: false,
      testimonial: testimonial.id,
      theme: 'light',
    },
    testimonial,
  },
} satisfies Meta<typeof TestimonialBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Quote: Story = {}

export const WithPortrait: Story = {
  args: {
    block: {
      blockType: 'caseStudyTestimonial',
      layout: 'editorial',
      showPortrait: true,
      testimonial: testimonial.id,
      theme: 'light',
    },
    testimonial: { ...testimonial, portrait: mediaFixture },
  },
}

export const Dark: Story = {
  args: {
    block: {
      blockType: 'caseStudyTestimonial',
      layout: 'editorial',
      showPortrait: false,
      testimonial: testimonial.id,
      theme: 'dark',
    },
  },
}

/** A quote the speaker has not cleared for public use never renders. */
export const NotApprovedForPublic: Story = {
  args: {
    testimonial: { ...testimonial, approvalStatus: 'internal-only' },
  },
}

/** Neither does one that is still a draft. */
export const Draft: Story = {
  args: {
    testimonial: { ...testimonial, _status: 'draft' },
  },
}
