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
    showContent: true,
    eyebrow: 'Eyebrow',
    heading: 'Make the relationships visible',
    media: mediaFixture,
    body,
    width: 'full-width',
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

export const Contained: Story = {
  args: { width: 'contained', aspectRatio: '16-9' },
}

export const Contained3x2: Story = {
  args: { width: 'contained', aspectRatio: '3-2' },
}

export const Contained21x9: Story = {
  args: { width: 'contained', aspectRatio: '21-9' },
}

/** Toggle off: media renders on its own, authored copy stays in the CMS. */
export const MediaOnly: Story = {
  args: { showContent: false, width: 'contained', aspectRatio: '16-9' },
}

/** Media is the only requirement — nothing authored still renders. */
export const NoContentAuthored: Story = {
  args: { eyebrow: undefined, heading: undefined, body: undefined },
}
