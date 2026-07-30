import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heading, paragraph, richText, text } from '@/blocks/fixtures'
import { LowImpactHero } from './index'

const meta = {
  title: 'Heroes/LowImpact',
  component: LowImpactHero,
  parameters: {
    layout: 'padded',
  },
  args: {
    type: 'lowImpact',
    richText: richText(
      heading('h1', text('A quieter page opening')),
      paragraph(
        text(
          'Low-impact heroes lead with rich text instead of media — used on simpler interior pages.',
        ),
      ),
    ),
  },
} satisfies Meta<typeof LowImpactHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
