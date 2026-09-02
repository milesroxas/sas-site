import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  args: {
    placeholder: 'Email address',
    type: 'email',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url', 'file'],
    },
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'not-an-email' },
}

export const File: Story = {
  args: { placeholder: undefined, type: 'file' },
}

/** The editorial treatment: a mono label above a hairline, no box. */
export const Line: Story = {
  args: { variant: 'line' },
  decorators: [
    (Story) => (
      <div className="flex w-80 flex-col gap-3">
        <span className="font-mono text-xs/4 tracking-widest text-muted-foreground uppercase">
          Email
        </span>
        <Story />
      </div>
    ),
  ],
}

/** A filled `line` input darkens its rule — pure CSS, no state to track. */
export const LineFilled: Story = {
  args: { variant: 'line', defaultValue: 'maya@northlight.co' },
  decorators: Line.decorators,
}
