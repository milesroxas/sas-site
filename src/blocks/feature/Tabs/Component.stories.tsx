import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { richTextFixture } from '@/shared/testing/richTextFixture'
import { mediaFixture, videoFixture } from '../../fixtures'
import { FeatureTabsBlock } from './Component'

const meta = {
  title: 'Blocks/Feature/Tabs',
  component: FeatureTabsBlock,
  parameters: {
    layout: 'padded',
  },
  args: {
    blockType: 'featureTabs',
    tabs: [
      {
        id: 'position',
        title: 'Position',
        heading: 'Establish a sharper position and a more useful story.',
        description: richTextFixture(
          'We identify what the business means, why it matters, and how it should be understood by the audiences most important to its growth.',
        ),
        subheading: 'Included',
        items: [
          { id: 'i1', text: 'Audience and stakeholder research' },
          { id: 'i2', text: 'Competitive and category analysis' },
          { id: 'i3', text: 'Brand positioning' },
          { id: 'i4', text: 'Value propositions' },
          { id: 'i5', text: 'Messaging frameworks' },
          { id: 'i6', text: 'Brand and offer architecture' },
        ],
        media: mediaFixture,
        caption:
          'The objective is not simply to find better language. It is to create a shared foundation for how the company is understood and communicated.',
      },
      {
        id: 'express',
        title: 'Express',
        heading: 'Build a distinctive identity that carries the position.',
        description: richTextFixture(
          'We translate strategy into a visual and verbal identity that is recognizable, credible, and usable across every channel.',
        ),
        subheading: 'Included',
        items: [
          { id: 'i1', text: 'Visual identity systems' },
          { id: 'i2', text: 'Verbal identity and tone of voice' },
          { id: 'i3', text: 'Brand guidelines' },
        ],
        media: mediaFixture,
        caption: null,
      },
      {
        id: 'activate',
        title: 'Activate',
        heading: 'Put the brand to work across the buying journey.',
        description: richTextFixture(
          'We activate the brand through websites, sales communications, campaigns, and ongoing creative services.',
        ),
        subheading: 'Included',
        items: [
          { id: 'i1', text: 'Websites and digital experiences' },
          { id: 'i2', text: 'Sales communications' },
          { id: 'i3', text: 'Campaigns and ongoing creative' },
        ],
        media: null,
        caption: null,
      },
    ],
  },
} satisfies Meta<typeof FeatureTabsBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: {
    tabs: meta.args.tabs.map((tab) => (tab.media ? { ...tab, media: videoFixture } : tab)),
  },
}

export const TwoTabs: Story = {
  args: {
    tabs: meta.args.tabs.slice(0, 2),
  },
}
