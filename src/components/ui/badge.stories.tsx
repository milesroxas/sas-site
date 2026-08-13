import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconCircleCheck } from '@tabler/icons-react'
import { Badge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Badge',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline'],
    },
    asChild: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const WithIcon: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <IconCircleCheck />
        Approved
      </>
    ),
  },
}
