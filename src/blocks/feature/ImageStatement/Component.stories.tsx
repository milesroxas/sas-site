import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture } from '../../fixtures'
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
    caption:
      'Strong B2B branding does not remove the deeper information. It places that information in an order people can understand.',
  },
} satisfies Meta<typeof FeatureImageStatementBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

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
