import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { postFixtures } from '@/blocks/fixtures'
import type { CardPostData } from '@/components/Card'
import { RelatedPostsSection } from './index'

const TITLES = [
  'Why your team can’t explain what your company does',
  'Designing resilient content models',
  'Shipping faster with block-based pages',
  'The brief is the product',
  'Naming systems that survive a rebrand',
  'What a design system owes its writers',
  'Measuring clarity without measuring words',
  'Craft is a schedule decision',
]

/** Eight cards: enough that the rail has somewhere to drag to at every width. */
const railPosts: CardPostData[] = TITLES.map((title, index) => ({
  ...postFixtures[index % postFixtures.length],
  slug: `related-post-${index}`,
  title,
}))

const meta = {
  title: 'Sections/RelatedPosts',
  component: RelatedPostsSection,
  parameters: { layout: 'fullscreen' },
  args: { posts: railPosts },
} satisfies Meta<typeof RelatedPostsSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Three or fewer cards: a static three-column grid, not a carousel. */
export const Grid: Story = {
  args: { posts: railPosts.slice(0, 3) },
}
