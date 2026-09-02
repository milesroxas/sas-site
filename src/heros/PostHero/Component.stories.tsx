import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, postFixtures, videoFixture } from '@/blocks/fixtures'
import { PostHero } from './index'

const basePost = {
  ...postFixtures[0],
  heroImage: mediaFixture,
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

/**
 * No `heroImage`: the hero falls back to the SEO image — the same asset the
 * insights cards show — so the header (and the takeover menu's docked window,
 * which clones it) still opens on media rather than an empty box.
 */
export const SeoImageFallback: Story = {
  args: {
    post: {
      ...basePost,
      heroImage: null,
      meta: { ...basePost.meta, image: mediaFixture },
    },
  },
}

/** No standfirst and no author: the two rows the hero can drop. */
export const Minimal: Story = {
  args: {
    post: {
      ...basePost,
      populatedAuthors: [],
      standfirst: null,
    },
  },
}
