import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import { postFixtures } from '@/blocks/fixtures'
import type { IndexFilterOption } from '@/sections/Browse'
import { InsightsBrowse, type InsightsBrowsePost } from './index'

const topicFixtures: IndexFilterOption[] = [
  { slug: 'branding', label: 'Branding' },
  { slug: 'website', label: 'Website' },
  { slug: 'strategy', label: 'Strategy' },
  { slug: 'product-design', label: 'Product Design' },
  { slug: 'news', label: 'News' },
  { slug: 'press', label: 'Press' },
]

// Spread posts across the first four topics so the filter visibly changes the
// grid (News and Press stay empty for the no-results state), and give each a
// distinct date so every sort reorders it.
const posts: InsightsBrowsePost[] = Array.from({ length: 9 }, (_, index) => {
  const base = postFixtures[index % postFixtures.length]
  const topic = topicFixtures[index % 4]
  return {
    ...base,
    id: 100 + index,
    slug: `${base.slug}-${index}`,
    title: `${base.title} ${index + 1}`,
    categories: [
      {
        id: index,
        title: topic.label,
        slug: topic.slug,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    publishedAt: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(),
  }
})

const meta = {
  title: 'Sections/InsightsBrowse',
  component: InsightsBrowse,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: 'Insights',
    title: 'News & Insights',
    posts,
    topics: topicFixtures,
  },
} satisfies Meta<typeof InsightsBrowse>

export default meta

type Story = StoryObj<typeof meta>

export const AllPosts: Story = {}

/** Deep link: the topic route lands with its filter already set. */
export const TopicSelected: Story = {
  args: { initialTopicSlug: 'branding' },
}

/** A topic none of the posts carry: the empty state carries the reset back to all posts. */
export const NoMatches: Story = {
  args: { initialTopicSlug: 'press' },
}

/** Nothing published yet. */
export const Empty: Story = {
  args: { posts: [], topics: [] },
}

/** Two columns between `sm` and `lg`. */
export const Tablet: Story = {
  globals: { viewport: { value: 'ipad', isRotated: false } },
  parameters: { viewport: { options: INITIAL_VIEWPORTS } },
}

/** Below `sm` the grid is one column and the filter strip wraps onto its own rows. */
export const Mobile: Story = {
  globals: { viewport: { value: 'iphone12', isRotated: false } },
  parameters: { viewport: { options: INITIAL_VIEWPORTS } },
}
