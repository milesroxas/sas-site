import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, postFixtures, videoFixture } from '@/blocks/fixtures'
import { PostHero } from './index'

const basePost = {
  ...postFixtures[0],
  heroImage: mediaFixture,
  heroStyle: 'immersive' as const,
  populatedAuthors: [{ id: '1', name: 'Alex Rivera' }],
}

const meta = {
  title: 'Heroes/Post',
  component: PostHero,
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
    post: basePost,
  },
} satisfies Meta<typeof PostHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: {
    post: {
      ...basePost,
      heroImage: videoFixture,
    },
  },
}

export const Banner: Story = {
  args: {
    post: {
      ...basePost,
      heroStyle: 'banner',
    },
  },
}

export const BannerVideo: Story = {
  args: {
    post: {
      ...basePost,
      heroStyle: 'banner',
      heroImage: videoFixture,
    },
  },
}
