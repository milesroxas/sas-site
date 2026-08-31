import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CARD_VARIANTS } from '@/components/Card/variants'
import { heading, paragraph, postFixtures, richText, text } from '../fixtures'
import { RelatedPosts } from './Component'

const meta = {
  title: 'Blocks/RelatedPosts',
  component: RelatedPosts,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    cardVariant: {
      control: 'select',
      options: [...CARD_VARIANTS],
    },
  },
  args: {
    docs: postFixtures,
    introContent: richText(
      heading('h3', text('Related posts')),
      paragraph(text('Cards link to their posts; non-backdrop variants show categories.')),
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

export const OpenCards: Story = {
  args: {
    cardVariant: 'open',
  },
}

export const OverlayCards: Story = {
  args: {
    cardVariant: 'overlay',
  },
}
