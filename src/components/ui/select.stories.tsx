import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'

const meta = {
  title: 'UI/Select',
  component: Select,
  subcomponents: {
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  },
  parameters: {
    layout: 'centered',
  },
  args: {
    onValueChange: fn(),
  },
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Grouped: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="est">Eastern (EST)</SelectItem>
          <SelectItem value="pst">Pacific (PST)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="cet">Central European (CET)</SelectItem>
          <SelectItem value="gmt">Greenwich Mean (GMT)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

/**
 * `description` puts a second line under the option, for a menu whose options
 * need a word of explanation. The label and its line set as one left-aligned
 * block, and the row reserves the column the check mark sits in.
 */
export const Described: Story = {
  args: { defaultValue: 'curl' },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a noise" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none" description="Streaks stay on their rows: no displacement.">
          None
        </SelectItem>
        <SelectItem value="simplex" description="A smooth isotropic drift.">
          Simplex
        </SelectItem>
        <SelectItem value="ridged" description="The field creased into seams.">
          Ridged
        </SelectItem>
        <SelectItem value="curl" description="A divergence-free swirl that runs along contours.">
          Curl
        </SelectItem>
      </SelectContent>
    </Select>
  ),
}
