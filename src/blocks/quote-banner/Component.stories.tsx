import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import type { Testimonial } from '@/payload-types'
import { paragraph, richText, testimonialFixtures, text } from '../fixtures'
import { QuoteBannerBlock } from './Component'

/**
 * Worst content first: the longest quote, the longest role, a speaker with no
 * organization (the tab falls back to the name), and a run of six so the
 * client row overflows a phone.
 */
const voice = (
  base: Testimonial,
  quote: string,
  speakerName: string,
  speakerRole: string | null,
  speakerOrganization: string | null,
): Testimonial => ({
  ...base,
  quote: richText(paragraph(text(quote))),
  speakerName,
  speakerRole,
  speakerOrganization,
})

const [a, b, c, d] = testimonialFixtures

const testimonials: Testimonial[] = [
  voice(
    a,
    'They really are willing to push the relationship forward. They not only rebranded our company but also helped educate us on the best way to build a consistent brand strategy.',
    'Bassam Tarazi',
    'Director of Business Strategy',
    'Omnibuild',
  ),
  voice(
    b,
    'Everyone is enthusiastic about the work, and I get compliments on it all the time. We’re no longer nervous that we’re losing people who are referred to us because they’re scared off.',
    'Andy Tuck',
    'Co-founder',
    'ARC Research',
  ),
  voice(
    c,
    'They were great collaborators and dug deep into our business to get to why we needed this build, not just what we needed.',
    'Ben Green',
    'CEO',
    'Gentle Beast',
  ),
  voice(
    d,
    'The level of accountability and communication is the best we’ve ever experienced in the industry.',
    'CEO, Digital Marketing Agency',
    null,
    null,
  ),
  ...testimonialFixtures.slice(1, 3).map((fixture) => ({ ...fixture, id: fixture.id + 10 })),
]

const meta = {
  title: 'Blocks/Statements/QuoteBanner',
  component: QuoteBannerBlock,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: 'What clients say',
    testimonials,
    theme: 'default',
  },
  argTypes: {
    theme: { control: 'inline-radio', options: ['default', 'inverted', 'neutral', 'brand'] },
  },
} satisfies Meta<typeof QuoteBannerBlock>

export default meta

type Story = StoryObj<typeof meta>

/** Six voices: the client row under the quote switches between them. */
export const List: Story = {}

/** One testimonial: the quote alone, no client row. */
export const Single: Story = {
  args: { testimonials: testimonials.slice(0, 1) },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}

/** A phone: the quotes swipe, and the client row pans with an edge fade. */
export const Phone: Story = {
  globals: { viewport: { value: 'iphone12', isRotated: false } },
  parameters: { viewport: { options: INITIAL_VIEWPORTS } },
}
