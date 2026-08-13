import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { paragraph, richText, TEXT_FORMAT_BOLD, text } from '../../fixtures'
import { FeatureStatementLinksBlock } from './Component'

const meta = {
  title: 'Blocks/Feature/StatementLinks',
  component: FeatureStatementLinksBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'featureStatementLinks',
    statement: richText(
      paragraph(
        text('We build brands that '),
        text('explain themselves', TEXT_FORMAT_BOLD),
        text(
          ' — so the people who matter most understand what you do, why it matters, and why now.',
        ),
      ),
    ),
    links: [
      { id: 'l1', link: { type: 'custom', url: '/works', label: 'View work' } },
      { id: 'l2', link: { type: 'custom', url: '/expertise', label: 'Our expertise' } },
      { id: 'l3', link: { type: 'custom', url: '/contact', label: 'Start a project' } },
    ],
    theme: 'light',
  },
} satisfies Meta<typeof FeatureStatementLinksBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkTheme: Story = {
  args: { theme: 'dark' },
}

export const StatementOnly: Story = {
  args: { links: [] },
}
