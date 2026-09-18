import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { Slider } from './slider'

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  args: {
    onValueChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { defaultValue: [55], min: 1, max: 10, step: 0.1 },
}

/** The fill in primary ink and a tick at the default: a value that departs from its default. */
export const Changed: Story = {
  args: {
    defaultValue: [3.4],
    min: 0.2,
    max: 4,
    step: 0.1,
    variant: 'changed',
    marks: [{ value: 2.8 }],
    formatValue: (value) => value.toFixed(1),
  },
}

/** A signed range fills from zero, with a taller tick where zero sits. */
export const Signed: Story = {
  args: {
    defaultValue: [-6],
    min: -50,
    max: 50,
    step: 1,
    origin: 0,
    variant: 'changed',
    marks: [{ value: 0, kind: 'zero' }, { value: 4 }],
    formatValue: (value) => String(value),
  },
}

/** Two thumbs on one track; the pair cannot cross. */
export const RangePair: Story = {
  args: {
    defaultValue: [4, 9],
    min: 1,
    max: 80,
    step: 1,
    minStepsBetweenThumbs: 0,
    formatValue: (value) => String(value),
  },
}

export const AtLimits: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Slider {...args} defaultValue={[4]} min={4} max={100} />
      <Slider {...args} defaultValue={[4]} min={0.2} max={4} step={0.1} variant="changed" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { defaultValue: [40], disabled: true },
}

/** Controlled: the bubble follows the thumb while it is dragged. */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState([6])
    return (
      <div className="flex items-center gap-3">
        <Slider
          {...args}
          value={value}
          onValueChange={setValue}
          min={1}
          max={10}
          step={0.1}
          marks={[{ value: 6 }]}
          formatValue={(v) => v.toFixed(1)}
        />
        <span className="w-8 text-right font-mono text-xs tabular-nums">{value[0].toFixed(1)}</span>
      </div>
    )
  },
}
