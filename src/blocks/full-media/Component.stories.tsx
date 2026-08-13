import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, paragraph, richText, text, videoFixture } from '../fixtures'
import { FullMediaBlock } from './Component'

const body = richText(
  paragraph(
    text('We connected solutions to the relevant products, services, languages, and industries.'),
  ),
  paragraph(
    text(
      'Visitors gained a clearer path through the platform while retaining access to the technical depth they needed.',
    ),
  ),
)

const meta = {
  title: 'Blocks/FullMedia',
  component: FullMediaBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'fullMedia',
    source: 'custom',
    eyebrow: 'Eyebrow',
    heading: 'Make the relationships visible',
    media: mediaFixture,
    body,
    contentPosition: 'left',
    theme: 'light',
  },
} satisfies Meta<typeof FullMediaBlock>

export default meta

type Story = StoryObj<typeof meta>

export const ContentLeft: Story = {}

export const ContentRight: Story = {
  args: { contentPosition: 'right' },
}

export const Video: Story = {
  args: { media: videoFixture },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}
