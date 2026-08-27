import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heading, paragraph, richText, text } from '../fixtures'
import { CallToActionBlock } from './Component'

const meta = {
  title: 'Blocks/CallToAction',
  component: CallToActionBlock,
  parameters: {
    layout: 'padded',
  },
  args: {
    blockType: 'cta',
    richText: richText(
      heading('h3', text('Ready to launch your next project?')),
      paragraph(text('Pair copy with one or more links to drive readers toward an action.')),
    ),
    links: [
      {
        id: 'primary',
        link: {
          type: 'custom',
          url: '#',
          label: 'Get started',
          appearance: 'default',
        },
      },
    ],
  },
} satisfies Meta<typeof CallToActionBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TwoLinks: Story = {
  args: {
    links: [
      {
        id: 'primary',
        link: {
          type: 'custom',
          url: '#',
          label: 'Get started',
          appearance: 'default',
        },
      },
      {
        id: 'secondary',
        link: {
          type: 'custom',
          url: '#',
          label: 'Read the docs',
          appearance: 'outline',
        },
      },
    ],
  },
}

export const TextOnly: Story = {
  args: {
    links: [],
  },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}

export const Brand: Story = {
  args: { theme: 'brand' },
}
