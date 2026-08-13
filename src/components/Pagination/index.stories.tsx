import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Pagination } from './index'

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  args: {
    page: 3,
    totalPages: 6,
  },
} satisfies Meta<typeof Pagination>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const FirstPage: Story = {
  args: { page: 1 },
}

export const LastPage: Story = {
  args: { page: 6, totalPages: 6 },
}

export const SinglePage: Story = {
  args: { page: 1, totalPages: 1 },
}
