import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '../fixtures'
import { DynamicAudienceBlock } from './Component'

const meta = {
  title: 'Blocks/DynamicAudience',
  component: DynamicAudienceBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'dynamicAudience',
    heading: 'Built for',
    audiences: [
      {
        id: 'teams',
        title: 'teams',
        subheading: 'that need a shared story.',
        intro:
          'We give teams one narrative to work from, so every deck and page says the same thing.',
        items: [
          { id: 'i1', text: 'Messaging frameworks' },
          { id: 'i2', text: 'Brand guidelines' },
          { id: 'i3', text: 'Sales communications' },
        ],
        media: mediaFixture,
      },
      {
        id: 'leaders',
        title: 'leaders',
        subheading: 'who carry the vision.',
        intro: 'We sharpen the position so leadership can tell the company story with confidence.',
        items: [
          { id: 'i1', text: 'Brand positioning' },
          { id: 'i2', text: 'Investor narratives' },
        ],
        media: videoFixture,
      },
    ],
    theme: 'light',
  },
} satisfies Meta<typeof DynamicAudienceBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkTheme: Story = {
  args: { theme: 'dark' },
}
