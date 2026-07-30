import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heroImageFixture, videoFixture } from '@/blocks/fixtures'
import { MediumImpactHero } from './index'

const meta = {
  title: 'Heroes/MediumImpact',
  component: MediumImpactHero,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    type: 'mediumImpact',
    eyebrow: 'Expertise',
    title: 'Positioning for technical companies',
    description:
      'Turn complex offerings into a clear market story buyers can understand and choose.',
    media: heroImageFixture,
    links: [
      {
        link: { type: 'custom', url: '/contact', label: 'Talk to us', appearance: 'default' },
      },
    ],
  },
} satisfies Meta<typeof MediumImpactHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: {
    media: videoFixture,
  },
}
