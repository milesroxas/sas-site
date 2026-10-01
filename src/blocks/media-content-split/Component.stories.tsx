import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  contentColumnFixture,
  mediaFixture,
  paragraph,
  richText,
  text,
  videoFixture,
} from '../fixtures'
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
    theme: 'default',
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

export const Inverted: Story = {
  args: { theme: 'inverted' },
}

/** Everything the content-column editor offers: kicker, h4 over a ruled list, small note, Actions. */
export const Composed: Story = {
  args: { body: contentColumnFixture },
}

export const ComposedInverted: Story = {
  args: { body: contentColumnFixture, theme: 'inverted' },
}

/** A Streak Field in the media column. */
export const StreakField: Story = {
  args: {
    media: null,
    visualType: 'streakField',
    shader: { preset: 'backdrop-v1', seed: 3, speed: 0.6 },
  },
}
