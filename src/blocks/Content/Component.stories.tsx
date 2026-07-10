import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heading, paragraph, richText, text } from '../fixtures'
import { ContentBlock } from './Component'

const column = (
  size: 'oneThird' | 'half' | 'twoThirds' | 'full',
  title: string,
  body: string,
  enableLink = false,
) => ({
  size,
  richText: richText(heading('h3', text(title)), paragraph(text(body))),
  enableLink,
  ...(enableLink
    ? {
        link: {
          type: 'custom' as const,
          url: '#',
          label: 'Learn more',
          appearance: 'default' as const,
        },
      }
    : {}),
})

const meta = {
  title: 'Blocks/Content',
  component: ContentBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'content',
    columns: [
      column(
        'full',
        'Full-width column',
        'A single column spanning the full 12-column grid. Column sizes come from the CMS.',
      ),
    ],
  },
} satisfies Meta<typeof ContentBlock>

export default meta

type Story = StoryObj<typeof meta>

export const FullWidth: Story = {}

export const Halves: Story = {
  args: {
    columns: [
      column('half', 'First half', 'Two columns, each spanning six of twelve grid tracks.'),
      column('half', 'Second half', 'Columns collapse to a single track on small screens.'),
    ],
  },
}

export const Thirds: Story = {
  args: {
    columns: [
      column('oneThird', 'One third', 'Three equal columns across the grid.'),
      column('oneThird', 'Two thirds… no, one third', 'Each spans four grid tracks.'),
      column('oneThird', 'Last third', 'Resize the viewport to see the responsive collapse.'),
    ],
  },
}

export const MixedWithLinks: Story = {
  args: {
    columns: [
      column(
        'twoThirds',
        'Feature column',
        'A two-thirds column paired with a one-third column, both with CMS links.',
        true,
      ),
      column('oneThird', 'Sidebar column', 'Enable a link per column from the CMS.', true),
    ],
  },
}
