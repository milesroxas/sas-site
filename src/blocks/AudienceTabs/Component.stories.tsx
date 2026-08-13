import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '../fixtures'
import { AudienceTabsBlock } from './Component'

const meta = {
  title: 'Blocks/AudienceTabs',
  component: AudienceTabsBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'audienceTabs',
    heading: 'Whoever you are, the brand has to work as hard as you do.',
    tabs: [
      {
        id: 'founders',
        title: 'Founders',
        intro: 'You need a brand that keeps up with the pace of the product.',
        items: [
          { id: 'i1', text: 'Positioning that survives the next pivot' },
          { id: 'i2', text: 'A story investors can retell' },
          { id: 'i3', text: 'Identity that scales past the seed round' },
        ],
        media: mediaFixture,
      },
      {
        id: 'marketing',
        title: 'Marketing leaders',
        intro: 'You need a system your team can run without a bottleneck.',
        items: [
          { id: 'i1', text: 'Messaging frameworks the whole team uses' },
          { id: 'i2', text: 'Guidelines that answer questions before they reach you' },
        ],
        media: videoFixture,
      },
      {
        id: 'product',
        title: 'Product teams',
        intro: 'You need the story and the interface to say the same thing.',
        items: [
          { id: 'i1', text: 'Language aligned with the product experience' },
          { id: 'i2', text: 'Design systems that carry the brand' },
        ],
        media: mediaFixture,
      },
    ],
    theme: 'dark',
  },
} satisfies Meta<typeof AudienceTabsBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LightTheme: Story = {
  args: { theme: 'light' },
}

export const TwoTabs: Story = {
  args: { tabs: meta.args.tabs.slice(0, 2) },
}
