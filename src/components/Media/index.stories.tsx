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

/**
 * Default video: self-playing and viewport gated. In view from the first
 * paint, so the source attaches immediately and the loop plays.
 */
export const Video: Story = {
  args: {
    resource: videoFixture,
  },
}

/**
 * Hero video: `priority` ships the source in the HTML with `preload="auto"`
 * and preloads the poster at high priority. Never gated (the takeover menu
 * clones this element for its handoff).
 */
export const VideoPriority: Story = {
  args: {
    priority: true,
    resource: videoFixture,
  },
}

/**
 * Gated loop below the fold: the server HTML carries the poster only
 * (`preload="none"`, no `<source>`). Scroll down and the source attaches two
 * screens ahead, then playback starts as the box enters view.
 */
export const VideoBelowFold: Story = {
  args: {
    resource: videoFixture,
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-8">
        <div className="flex h-[300vh] items-start rounded-md bg-muted p-6 text-muted-foreground text-sm">
          Scroll: the video below is three screens down. Its source attaches at two screens out.
        </div>
        <Story />
      </div>
    ),
  ],
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
