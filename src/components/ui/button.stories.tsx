import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconMail } from '@tabler/icons-react'
import { Button } from './button'
import { Spinner } from './spinner'

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
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg', 'clear'],
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

export const ExtraSmall: Story = {
  args: { size: 'xs' },
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
    children: <IconMail />,
    size: 'icon',
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <IconMail data-icon="inline-start" />
        Send email
      </>
    ),
  },
}

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Spinner data-icon="inline-start" />
        Sending…
      </>
    ),
  },
}

export const Clear: Story = {
  args: { size: 'clear', variant: 'link' },
}

export const Disabled: Story = {
  args: { disabled: true },
}
