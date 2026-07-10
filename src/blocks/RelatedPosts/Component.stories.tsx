import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heading, paragraph, postFixtures, richText, text } from '../fixtures'
import { RelatedPosts } from './Component'

const meta = {
  title: 'Blocks/RelatedPosts',
  component: RelatedPosts,
  parameters: {
    layout: 'padded',
  },
  args: {
    docs: postFixtures,
    introContent: richText(
      heading('h3', text('Related posts')),
      paragraph(text('Cards link to their posts and show categories from the CMS.')),
    ),
  },
} satisfies Meta<typeof RelatedPosts>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutIntro: Story = {
  args: {
    introContent: undefined,
  },
}
