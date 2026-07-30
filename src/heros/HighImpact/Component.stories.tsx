import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import { HighImpactHero } from './index'

const meta = {
  title: 'Heroes/HighImpact',
  component: HighImpactHero,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-svh bg-background pt-(--header-height)">
        <Story />
      </div>
    ),
  ],
  args: {
    type: 'highImpact',
    title: 'Make your expertise easier to choose',
    description:
      'We clarify positioning and messaging, build distinctive brand identities, and activate those brands through websites and campaigns.',
    media: mediaFixture,
    links: [
      {
        link: { type: 'custom', url: '/work', label: 'See our work', appearance: 'default' },
      },
      {
        link: { type: 'custom', url: '/contact', label: 'Get in touch', appearance: 'outline' },
      },
    ],
  },
} satisfies Meta<typeof HighImpactHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: {
    media: videoFixture,
  },
}
