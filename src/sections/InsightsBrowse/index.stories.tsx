import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import { postFixtures } from '@/blocks/fixtures'
import type { Category } from '@/payload-types'
import type { InsightsBrowseTopic } from './index'
import { InsightsBrowse } from './index'

const topicFixtures: InsightsBrowseTopic[] = [
  {
    id: 1,
    title: 'Branding',
    slug: 'branding',
    description: 'Identity systems and brand strategy.',
  },
  { id: 2, title: 'Website', slug: 'website' },
  { id: 3, title: 'Strategy', slug: 'strategy' },
  { id: 4, title: 'Product Design', slug: 'product-design' },
  { id: 5, title: 'News', slug: 'news' },
  { id: 6, title: 'Press', slug: 'press' },
]

const topicCategory = (topic: InsightsBrowseTopic): Category => ({
  id: topic.id,
  title: topic.title,
  slug: topic.slug,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

// Spread posts across the first four topics so toggling filters visibly
// changes the grid; News and Press stay empty for the no-results state.
const posts = Array.from({ length: 8 }, (_, index) => {
  const base = postFixtures[index % postFixtures.length]
  const topic = topicFixtures[index % 4]
  return {
    ...base,
    id: 100 + index,
    slug: `${base.slug}-${index}`,
    categories: [topicCategory(topic)],
  }
})

const meta = {
  title: 'Sections/InsightsBrowse',
  component: InsightsBrowse,
  parameters: {
    layout: 'padded',
  },
  args: {
    posts,
    topics: topicFixtures,
  },
} satisfies Meta<typeof InsightsBrowse>

export default meta

type Story = StoryObj<typeof meta>

export const AllPosts: Story = {}

export const TopicSelected: Story = {
  args: {
    initialTopicSlug: 'branding',
  },
}

export const NoMatches: Story = {
  args: {
    initialTopicSlug: 'press',
  },
}

const mobile = {
  globals: { viewport: { value: 'iphone12', isRotated: false } },
  parameters: { viewport: { options: INITIAL_VIEWPORTS } },
}

/**
 * Below `lg` the topic sidebar becomes a rail that pans. It bleeds past the
 * page gutter so a half-cut topic is the affordance, and the active marker
 * moves under the label — a bar at the leading edge would push the label
 * sideways and drag every topic after it mid-pan.
 */
export const MobileRail: Story = { ...mobile }

/** Deep link: the preselected topic sits past the rail's edge until it is panned into view on mount. */
export const MobileRailTopicSelected: Story = {
  ...mobile,
  args: {
    initialTopicSlug: 'news',
  },
}
