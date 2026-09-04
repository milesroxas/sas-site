import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { RichTextInsightsBlock } from '@/payload-types'
import { blockNode, heading, insightMarkFixtures, paragraph, richText, text } from '../fixtures'
import { RichTextBlock } from './Component'

const paragraphs = [
  paragraph(
    text('Technical companies often have more substance than their brands know how to carry.'),
  ),
  paragraph(
    text(
      'The work is not about making the business sound simple. It is about deciding what people need to understand first, then creating a clear path into the expertise, technology, and methodology behind it.',
    ),
  ),
  paragraph(
    text(
      'Strong B2B branding connects positioning, messaging, identity, and experience. It helps people understand what you do, why your approach matters, and why they should keep paying attention.',
    ),
  ),
]

const body = richText(
  heading('h2', text('Complexity is not the problem. Unclear value is.')),
  ...paragraphs,
)

/** The Insight list's six insights, so the two blocks are seen to share one item. */
const insightItems: RichTextInsightsBlock['items'] = [
  {
    id: 'category',
    media: insightMarkFixtures.twoCircles,
    title: 'Known category. Blurry difference.',
    description: 'Buyers understand what you offer, but not why your version is worth choosing.',
  },
  {
    id: 'room',
    media: insightMarkFixtures.twoCirclesDashed,
    title: 'Clear in the room. Unclear online.',
    description:
      'Leadership can explain the value in a meeting. The website cannot yet do the same work on its own.',
  },
  {
    id: 'outgrown',
    media: insightMarkFixtures.nestedSquares,
    title: 'A story the business has outgrown.',
    description: 'The company has changed. The brand is still describing an earlier version of it.',
  },
  {
    id: 'versions',
    media: insightMarkFixtures.threeLines,
    title: 'Too many versions of the truth.',
    description: 'Sales, marketing, product, and leadership all explain the business differently.',
  },
  {
    id: 'capable',
    media: insightMarkFixtures.halfCircle,
    title: 'More capable than it looks.',
    description: 'The identity and digital experience undersell the quality of the organization.',
  },
]

const insights = (count: number, id = 'insights') =>
  blockNode({
    blockType: 'insights',
    id,
    items: insightItems.slice(0, count),
  } satisfies RichTextInsightsBlock)

const meta = {
  title: 'Blocks/Text/RichText',
  component: RichTextBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'richText',
    body,
    theme: 'light',
  },
} satisfies Meta<typeof RichTextBlock>

export default meta

type Story = StoryObj<typeof meta>

/** The Paper frame: an inline heading over three paragraphs, columns 3-6. */
export const Default: Story = {}

/** Body copy only, no inline heading. */
export const ParagraphsOnly: Story = {
  args: {
    body: richText(...paragraphs),
  },
}

/** The one-insight Paper frame: the run fills the reading column. */
export const OneInsight: Story = {
  args: {
    body: richText(...body.root.children, insights(1)),
  },
}

/** The two-insight Paper frame: two share the reading column. */
export const TwoInsights: Story = {
  args: {
    body: richText(...body.root.children, insights(2)),
  },
}

/** Three or more open out to column 8, three per row. */
export const ManyInsights: Story = {
  args: {
    body: richText(...body.root.children, insights(5)),
  },
}

/** Copy continues after a run, and a second run keeps its own reveal beats. */
export const InsightsBetweenCopy: Story = {
  args: {
    body: richText(
      ...body.root.children,
      insights(3, 'first'),
      paragraph(text('Each pattern has a different fix, and most companies show more than one.')),
      insights(2, 'second'),
    ),
  },
}

export const Dark: Story = {
  args: {
    body: richText(...body.root.children, insights(3)),
    theme: 'dark',
  },
}
