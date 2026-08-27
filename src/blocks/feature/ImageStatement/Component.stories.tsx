import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { richTextFixture } from '@/shared/testing/richTextFixture'
import { mediaFixture, videoFixture } from '../../fixtures'
import { FeatureImageStatementBlock } from './Component'

const meta = {
  title: 'Blocks/Feature/ImageStatement',
  component: FeatureImageStatementBlock,
  parameters: {
    layout: 'padded',
  },
  args: {
    blockType: 'featureImageStatement',
    media: mediaFixture,
    caption: richTextFixture(
      'Strong B2B branding does not remove the deeper information. It places that information in an order people can understand.',
    ),
  },
} satisfies Meta<typeof FeatureImageStatementBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: { media: videoFixture },
}

export const TextLeft: Story = {
  args: { textPosition: 'left' },
}

export const SmallText: Story = {
  args: { textSize: 'small' },
}

export const FullBleed: Story = {
  args: { imageWidth: 'full' },
  parameters: { layout: 'fullscreen' },
}

export const AspectSixteenNine: Story = {
  args: { aspectRatio: '16-9' },
}

export const AspectThreeTwo: Story = {
  args: { aspectRatio: '3-2' },
}

export const AspectTwentyOneNine: Story = {
  args: { aspectRatio: '21-9' },
}

export const FullBleedSixteenNine: Story = {
  args: { imageWidth: 'full', aspectRatio: '16-9' },
  parameters: { layout: 'fullscreen' },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}

export const Brand: Story = {
  args: { theme: 'brand' },
}
