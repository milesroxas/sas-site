import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Kbd, KbdGroup } from './kbd'

const meta = {
  title: 'UI/Kbd',
  component: Kbd,
  subcomponents: { KbdGroup },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Kbd>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Kbd>⌘K</Kbd>,
}

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⇧</Kbd>
      <Kbd>⌘</Kbd>
      <Kbd>Z</Kbd>
    </KbdGroup>
  ),
}
