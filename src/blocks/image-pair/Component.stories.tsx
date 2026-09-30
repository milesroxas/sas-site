import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, paragraph, richText, text } from '../fixtures'
import { ImagePairBlock } from './Component'

const body = richText(
  paragraph(
    text('We connected solutions to the relevant products, services, languages, and industries.'),
  ),
)

const meta = {
  title: 'Blocks/MediaAndContent/Pair',
  component: ImagePairBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'imagePair',
    source: 'custom',
    heading: 'Make the relationships visible',
    body,
    portraitMedia: mediaFixture,
    landscapeMedia: mediaFixture,
    portraitPosition: 'left',
    textPosition: 'under-portrait',
    theme: 'default',
  },
} satisfies Meta<typeof ImagePairBlock>

export default meta

type Story = StoryObj<typeof meta>

export const PortraitLeft: Story = {}

export const PortraitRight: Story = {
  args: { portraitPosition: 'right' },
}

export const TextUnderLandscape: Story = {
  args: { textPosition: 'under-landscape' },
}

export const PortraitRightTextUnderLandscape: Story = {
  args: { portraitPosition: 'right', textPosition: 'under-landscape' },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}
