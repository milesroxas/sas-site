import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { paragraph, richText, TEXT_FORMAT_BOLD, text } from '../fixtures'
import { BannerBlock } from './Component'

const meta = {
  title: 'Blocks/Banner',
  component: BannerBlock,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    style: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
    },
  },
  args: {
    blockType: 'banner',
    style: 'info',
    content: richText(
      paragraph(
        text('Heads up: ', TEXT_FORMAT_BOLD),
        text('this banner is rendered from Lexical rich text with a selectable style.'),
      ),
    ),
  },
} satisfies Meta<typeof BannerBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Info: Story = {}

export const Warning: Story = {
  args: { style: 'warning' },
}

export const ErrorStyle: Story = {
  name: 'Error',
  args: { style: 'error' },
}

export const Success: Story = {
  args: { style: 'success' },
}
