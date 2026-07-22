import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { richTextFixture } from '@/shared/testing/richTextFixture'
import { mediaFixture } from '../../fixtures'
import { FeatureStatementGridBlock } from './Component'

const meta = {
  title: 'Blocks/Feature/StatementGrid',
  component: FeatureStatementGridBlock,
  parameters: {
    layout: 'padded',
  },
  args: {
    blockType: 'featureStatementGrid',
    eyebrow: 'Where clarity breaks down',
    heading: 'Deep expertise does not always translate into a clear market story.',
    statement: richTextFixture(
      'We help technical companies and expert-led firms turn complex offerings into clear positioning, distinctive brands, and digital experiences that build buyer confidence.',
    ),
    footnote: 'The goal is not to make the business sound simple. It is to make the value clear.',
    cards: [
      {
        id: 'card-1',
        media: mediaFixture,
        title: 'Outgrown the original story',
        description:
          'The business has added new offerings, audiences, or capabilities, but the brand still reflects an earlier version of the company.',
      },
      {
        id: 'card-2',
        media: mediaFixture,
        title: 'Difficult to differentiate',
        description:
          'Competitors use similar language and make similar claims, causing meaningful differences to appear too late in the buying process.',
      },
      {
        id: 'card-3',
        media: mediaFixture,
        title: 'Hard to explain online',
        description:
          'The company makes sense in a meeting, but the website and marketing materials cannot communicate the same value independently.',
      },
    ],
  },
} satisfies Meta<typeof FeatureStatementGridBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutMedia: Story = {
  args: {
    cards: meta.args.cards.map((card) => ({ ...card, media: null })),
  },
}

export const TwoCards: Story = {
  args: {
    cards: meta.args.cards.slice(0, 2),
  },
}
