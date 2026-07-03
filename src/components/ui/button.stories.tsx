import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Mail } from 'lucide-react'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Button',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['clear', 'default', 'sm', 'lg', 'icon'],
    },
    asChild: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
}

export const Link: Story = {
  args: { variant: 'link' },
}

export const Small: Story = {
  args: { size: 'sm' },
}

export const Large: Story = {
  args: { size: 'lg' },
}

export const Icon: Story = {
  args: {
    'aria-label': 'Send email',
    children: <Mail />,
    size: 'icon',
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail />
        Send email
      </>
    ),
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}
