import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, paragraph, richText, text } from '../fixtures'
import { SplitImageOffsetBlock } from './Component'

const body = richText(
  paragraph(
    text('We connected solutions to the relevant products, services, languages, and industries.'),
  ),
)

const meta = {
  title: 'Blocks/MediaAndContent/PairOffset',
  component: SplitImageOffsetBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'splitImageOffset',
    source: 'custom',
    heading: 'Make the relationships visible',
    body,
    largeMedia: mediaFixture,
    smallMedia: mediaFixture,
    captionPosition: 'right',
    theme: 'light',
  },
} satisfies Meta<typeof SplitImageOffsetBlock>

export default meta

type Story = StoryObj<typeof meta>

export const CaptionRight: Story = {}

export const CaptionLeft: Story = {
  args: { captionPosition: 'left' },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}
