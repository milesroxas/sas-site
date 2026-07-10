import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './button'
import { Spinner } from './spinner'

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Spinner>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Large: Story = {
  args: { className: 'size-8' },
}

export const InButton: Story = {
  render: () => (
    <Button disabled>
      <Spinner data-icon="inline-start" />
      Saving…
    </Button>
  ),
}
