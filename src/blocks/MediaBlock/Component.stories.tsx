import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '../fixtures'
import { MediaBlock } from './Component'

const meta = {
  title: 'Blocks/Media',
  component: MediaBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'mediaBlock',
    media: mediaFixture,
  },
} satisfies Meta<typeof MediaBlock>

export default meta

type Story = StoryObj<typeof meta>

export const WithCaption: Story = {}

export const Video: Story = {
  args: {
    media: videoFixture,
  },
}

export const WithoutCaption: Story = {
  args: {
    media: { ...mediaFixture, caption: null },
  },
}

export const WithoutGutter: Story = {
  args: {
    enableGutter: false,
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
