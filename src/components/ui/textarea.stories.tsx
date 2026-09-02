import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Textarea } from './textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  args: {
    placeholder: 'Type your message here.',
  },
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'Too short.' },
}

/** Inside a `FieldPanel`, the control drops its own chrome and shares the frame. */
export const Bare: Story = {
  args: { variant: 'bare' },
  decorators: [
    (Story) => (
      <div className="w-96">
        <div className="flex w-full flex-col rounded-md border border-input bg-input/20">
          <Story />
          <div className="flex items-center justify-between gap-4 border-t border-input px-5 py-3">
            <span className="font-mono text-xs/4 tracking-widest text-muted-foreground uppercase">
              A paragraph is plenty
            </span>
            <span className="font-mono text-xs/4 text-muted-foreground tabular-nums">0 / 1200</span>
          </div>
        </div>
      </div>
    ),
  ],
}
