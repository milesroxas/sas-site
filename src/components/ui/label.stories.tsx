import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Email address',
  },
} satisfies Meta<typeof Label>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithInput: Story = {
  render: (args) => (
    <div className="flex w-72 flex-col gap-1.5">
      <Label htmlFor="label-email" {...args} />
      <Input id="label-email" placeholder="you@example.com" type="email" />
    </div>
  ),
}

export const WithDisabledPeer: Story = {
  render: (args) => (
    <div className="flex w-72 flex-col gap-1.5">
      <Input className="peer" disabled id="label-disabled" type="email" />
      <Label htmlFor="label-disabled" {...args} />
    </div>
  ),
}
