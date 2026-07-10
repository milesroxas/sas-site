import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Separator } from './separator'

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: (args) => (
    <div className="w-72">
      <p className="text-sm">Section one</p>
      <Separator className="my-4" {...args} />
      <p className="text-sm">Section two</p>
    </div>
  ),
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div className="flex h-6 items-center gap-4 text-sm">
      <span>Docs</span>
      <Separator {...args} />
      <span>Source</span>
    </div>
  ),
}
