import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { YouTubeBlock } from './Component'

/**
 * "Me at the zoo" — the first video on YouTube, and a stable id to render
 * against. The poster comes from YouTube's CDN, so these stories need network.
 */
const URL = 'https://www.youtube.com/watch?v=jNQXAC9IVRw'

const meta = {
  title: 'Blocks/Media/YouTube',
  component: YouTubeBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'youtube',
    url: URL,
  },
} satisfies Meta<typeof YouTubeBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithTitle: Story = {
  args: {
    title: 'Me at the zoo',
  },
}

export const StartTime: Story = {
  args: {
    url: `${URL}&t=12s`,
    title: 'Opens twelve seconds in',
  },
}

export const Inset: Story = {
  args: {
    size: 'inset',
  },
}

export const Small: Story = {
  args: {
    size: 'small',
  },
}

export const WithoutGutter: Story = {
  args: {
    enableGutter: false,
  },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}

export const Brand: Story = {
  args: { theme: 'brand' },
}

/** An unreadable link renders nothing: draft saves skip field validation. */
export const InvalidLink: Story = {
  args: {
    url: 'https://vimeo.com/76979871',
  },
}
