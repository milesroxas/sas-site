import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { insightMarkFixtures } from '../fixtures'
import { InsightListBlock } from './Component'

/** The six insights on the Paper frame, in reading order. */
const items = [
  {
    id: 'room',
    media: insightMarkFixtures.twoCirclesDashed,
    title: 'Clear in the room. Unclear online.',
    description:
      'Leadership can explain the value in a meeting. The website cannot yet do the same work on its own.',
  },
  {
    id: 'category',
    media: insightMarkFixtures.twoCircles,
    title: 'Known category. Blurry difference.',
    description: 'Buyers understand what you offer, but not why your version is worth choosing.',
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
  {
    id: 'stage',
    media: insightMarkFixtures.expandArrow,
    title: 'Ready for a bigger stage.',
    description:
      'The company is moving upmarket, entering a new category, or growing beyond founder-led sales.',
  },
]

const meta = {
  title: 'Blocks/Lists/InsightList',
  component: InsightListBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'insightList',
    eyebrow: 'Where clarity breaks down',
    heading: 'Deep expertise does not always translate into a clear market story.',
    summary: 'Six patterns we see most often. Usually more than one at once.',
    layout: 'side',
    markSize: 'medium',
    items,
    theme: 'light',
  },
} satisfies Meta<typeof InsightListBlock>

export default meta

type Story = StoryObj<typeof meta>

/** The first Paper frame: heading beside the list, two insights per row. */
export const SideBySide: Story = {}

/** The second Paper frame: heading above, three insights per row set to the right. */
export const Stacked: Story = {
  args: { layout: 'stacked' },
}

export const SmallMarks: Story = {
  args: { markSize: 'small' },
}

export const LargeMarks: Story = {
  args: { markSize: 'large' },
}

/** No marks: the ordinal holds the line on its own. */
export const WithoutMarks: Story = {
  args: { items: items.map((item) => ({ ...item, media: null })) },
}

/** An odd count leaves the last row half full. */
export const FiveInsights: Story = {
  args: { items: items.slice(0, 5) },
}

/** The mark takes the band's ink, so one upload works on every surface. */
export const Dark: Story = {
  args: { theme: 'dark' },
}
