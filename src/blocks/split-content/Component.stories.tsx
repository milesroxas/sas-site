import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  contentColumnFixture,
  mediaFixture,
  paragraph,
  richText,
  text,
  videoFixture,
} from '../fixtures'
import { SplitContentNarrowBlock } from './Component'

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
  title: 'Blocks/MediaAndContent/SplitNarrow',
  component: SplitContentNarrowBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'splitContentNarrow',
    source: 'custom',
    media: mediaFixture,
    body,
    imagePosition: 'right',
    theme: 'light',
  },
} satisfies Meta<typeof SplitContentNarrowBlock>

export default meta

type Story = StoryObj<typeof meta>

export const ImageRight: Story = {}

export const Video: Story = {
  args: { media: videoFixture },
}

export const ImageLeft: Story = {
  args: { imagePosition: 'left' },
}

export const WithHeading: Story = {
  args: { eyebrow: 'About', heading: 'A branding agency for complex offerings' },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}

/** Everything the content-column editor offers, in the narrow column: the Actions row wraps. */
export const Composed: Story = {
  args: { body: contentColumnFixture, heading: 'A branding agency for complex offerings' },
}
