import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { paragraph, richText, text } from '@/blocks/fixtures'
import { LowImpactHero } from './index'

const meta = {
  title: 'Heroes/LowImpact',
  component: LowImpactHero,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    type: 'lowImpact',
    eyebrow: 'Insights',
    title: 'News & Insights',
    richText: richText(
      paragraph(
        text(
          'Plain-page hero: a single narrow reading column driven by rich text. Used for utility and legal pages where the content is the hero.',
        ),
      ),
    ),
  },
} satisfies Meta<typeof LowImpactHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
