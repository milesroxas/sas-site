import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconPlayerPause, IconPlayerPlay, IconRefresh } from '@tabler/icons-react'
import { fn } from 'storybook/test'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

const meta = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  subcomponents: { ToggleGroupItem },
  parameters: {
    layout: 'centered',
  },
  args: {
    onValueChange: fn(),
  },
} satisfies Meta<typeof ToggleGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { type: 'single', defaultValue: 'play' },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="play" aria-label="Play">
        <IconPlayerPlay />
      </ToggleGroupItem>
      <ToggleGroupItem value="pause" aria-label="Pause">
        <IconPlayerPause />
      </ToggleGroupItem>
      <ToggleGroupItem value="restart" aria-label="Restart">
        <IconRefresh />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

/** One boxed track, the chosen option lifted onto its own plate. */
export const Segmented: Story = {
  args: { type: 'single', defaultValue: 'rows', variant: 'segmented' },
  render: (args) => (
    <div className="w-64">
      <ToggleGroup {...args}>
        <ToggleGroupItem value="rows">Rows</ToggleGroupItem>
        <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}

export const SegmentedFour: Story = {
  args: { type: 'single', defaultValue: 'hero', variant: 'segmented' },
  render: (args) => (
    <div className="w-64">
      <ToggleGroup {...args}>
        <ToggleGroupItem value="hero">Hero</ToggleGroupItem>
        <ToggleGroupItem value="block">Block</ToggleGroupItem>
        <ToggleGroupItem value="menu">Menu</ToggleGroupItem>
        <ToggleGroupItem value="card">Card</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}
