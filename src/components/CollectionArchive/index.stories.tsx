import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { postFixtures, videoFixture } from '@/blocks/fixtures'
import { CollectionArchive } from './index'

const meta = {
  title: 'Components/CollectionArchive',
  component: CollectionArchive,
  parameters: {
    layout: 'padded',
  },
  args: {
    posts: postFixtures,
    cardVariant: 'contained',
  },
} satisfies Meta<typeof CollectionArchive>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithVideoCards: Story = {
  args: {
    posts: postFixtures.map((post) => ({
      ...post,
      meta: {
        ...post.meta,
        image: videoFixture,
      },
      heroImage: videoFixture,
    })),
  },
}

export const Overlay: Story = {
  args: {
    cardVariant: 'overlay',
  },
}
