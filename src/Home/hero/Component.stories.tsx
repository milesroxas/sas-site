import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heroImageFixture, postFixtures, videoFixture } from '@/blocks/fixtures'
import { RenderHomeHero } from './index'

const meta = {
  title: 'Heroes/Home',
  component: RenderHomeHero,
  parameters: {
    layout: 'fullscreen',
  },
  // Mirror the frontend page frame so -mt-(--header-height) / footer calc land correctly.
  decorators: [
    (Story) => (
      <div className="min-h-svh bg-background pt-(--header-height) pb-(--footer-height)">
        <Story />
      </div>
    ),
  ],
  args: {
    type: 'left',
    title: 'Make it make sense',
    description:
      'Suits & Sandals is a B2B branding agency for technical companies and expert-led firms with complex offerings.',
    media: heroImageFixture,
    featuredPost: postFixtures[0],
    featuredLabel: 'Insights',
  },
} satisfies Meta<typeof RenderHomeHero>

export default meta

type Story = StoryObj<typeof meta>

export const Left: Story = {}

export const LeftVideo: Story = {
  args: {
    media: videoFixture,
  },
}

export const Center: Story = {
  args: {
    type: 'center',
    title: 'Brand clarity for complex businesses',
  },
}

export const CenterVideo: Story = {
  args: {
    type: 'center',
    title: 'Brand clarity for complex businesses',
    media: videoFixture,
  },
}

export const WithoutFeatured: Story = {
  args: {
    featuredPost: null,
  },
}

export const WithoutMedia: Story = {
  args: {
    media: null,
  },
}
