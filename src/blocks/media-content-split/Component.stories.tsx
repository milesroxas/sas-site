import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, paragraph, richText, text, videoFixture } from '../fixtures'
import { MediaContentSplitBlock } from './Component'

const body = richText(
  paragraph(
    text(
      'Suits & Sandals is a B2B branding agency for technical companies, specialized service providers, and expert-led firms with complex offerings.',
    ),
  ),
  paragraph(
    text(
      'We clarify positioning and messaging, build distinctive brand identities, and activate those brands through websites, sales communications, campaigns, and ongoing creative services.',
    ),
  ),
)

const meta = {
  title: 'Blocks/MediaAndContent/Split',
  component: MediaContentSplitBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'mediaContentSplit',
    source: 'custom',
    eyebrow: 'About',
    heading: 'A branding agency for complex offerings',
    body,
    media: mediaFixture,
    layout: 'left',
    aspectRatio: '16-9',
    theme: 'light',
  },
} satisfies Meta<typeof MediaContentSplitBlock>

export default meta

type Story = StoryObj<typeof meta>

export const MediaLeft: Story = {}

export const MediaRight: Story = {
  args: { layout: 'right' },
}

export const Video: Story = {
  args: { media: videoFixture },
}

export const ThreeTwo: Story = {
  args: { aspectRatio: '3-2' },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}
