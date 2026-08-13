import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { paragraph, postFixtures, richText, text } from '../fixtures'
import { ArchiveLayout } from './ArchiveLayout'

/**
 * The Archive block's server component fetches posts through the Payload Local
 * API, so the story renders the shared `ArchiveLayout` it returns: intro rich
 * text above the scroll-scrubbed `ArchiveRail` filmstrip of post cards.
 */
const posts = [
  ...postFixtures,
  { ...postFixtures[0], id: 3, title: 'Naming a product without a committee' },
  { ...postFixtures[1], id: 4, title: 'What a message hierarchy actually does' },
]

const meta = {
  title: 'Blocks/Archive',
  component: ArchiveLayout,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    introContent: richText(paragraph(text('Recent writing on brand, product, and growth.'))),
    posts,
  },
} satisfies Meta<typeof ArchiveLayout>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutIntro: Story = {
  args: { introContent: undefined },
}
