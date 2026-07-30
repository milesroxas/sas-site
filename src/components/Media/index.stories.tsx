import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import { Media } from './index'

const meta = {
  title: 'Components/Media',
  component: Media,
  parameters: {
    layout: 'padded',
  },
  args: {
    resource: mediaFixture,
  },
} satisfies Meta<typeof Media>

export default meta

type Story = StoryObj<typeof meta>

export const Image: Story = {}

export const Video: Story = {
  args: {
    resource: videoFixture,
  },
}

export const ImageFill: Story = {
  args: {
    fill: true,
    imgClassName: 'object-cover',
    resource: mediaFixture,
  },
  decorators: [
    (Story) => (
      <div className="relative aspect-video w-full max-w-3xl overflow-clip">
        <Story />
      </div>
    ),
  ],
}

export const VideoFill: Story = {
  args: {
    fill: true,
    imgClassName: 'object-cover',
    resource: videoFixture,
  },
  decorators: [
    (Story) => (
      <div className="relative aspect-video w-full max-w-3xl overflow-clip">
        <Story />
      </div>
    ),
  ],
}
