import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PageRange } from './index'

const meta = {
  title: 'Components/PageRange',
  component: PageRange,
  parameters: {
    layout: 'centered',
  },
  args: {
    collection: 'posts',
    currentPage: 1,
    limit: 12,
    totalDocs: 30,
  },
} satisfies Meta<typeof PageRange>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LastPage: Story = {
  args: { currentPage: 3 },
}

export const NoResults: Story = {
  args: { totalDocs: 0 },
}

export const CustomLabels: Story = {
  args: {
    collection: undefined,
    collectionLabels: { plural: 'Projects', singular: 'Project' },
  },
}
