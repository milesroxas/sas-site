import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heroImageFixture, videoFixture } from '@/blocks/fixtures'
import { SegmentHero } from './index'

const meta = {
  title: 'Heroes/Segment',
  component: SegmentHero,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    eyebrow: 'Who We Help',
    title: 'Make your expertise easier to understand. And easier to choose.',
    description:
      'We help technical companies and expert-led firms turn complex offerings into clear positioning, distinctive brands, and digital experiences built for confident decisions.',
    media: heroImageFixture,
    links: [
      { link: { type: 'custom', url: '/contact', label: 'Primary Action' } },
      { link: { type: 'custom', url: '/works', label: 'Secondary Action' } },
    ],
  },
} satisfies Meta<typeof SegmentHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: { media: videoFixture },
}

export const NoActions: Story = {
  args: { links: [] },
}
