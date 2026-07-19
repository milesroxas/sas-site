import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture } from '../../fixtures'
import { FeatureImageCaptionBlock } from './Component'

const meta = {
  title: 'Blocks/Feature/ImageCaption',
  component: FeatureImageCaptionBlock,
  parameters: {
    layout: 'padded',
  },
  args: {
    blockType: 'featureImageCaption',
    media: mediaFixture,
    caption:
      'Strong B2B branding does not remove the deeper information. It places that information in an order people can understand.',
  },
} satisfies Meta<typeof FeatureImageCaptionBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
