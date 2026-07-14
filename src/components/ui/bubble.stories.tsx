import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Bubble, BubbleContent, BubbleGroup } from './bubble'

const meta = {
  title: 'UI/Bubble',
  component: Bubble,
  subcomponents: { BubbleGroup, BubbleContent },
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'],
    },
    align: {
      control: 'select',
      options: ['start', 'end'],
    },
  },
} satisfies Meta<typeof Bubble>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: 'default', align: 'start' },
  render: (args) => (
    <div className="w-96">
      <Bubble {...args}>
        <BubbleContent>How do you kick off a new branding project?</BubbleContent>
      </Bubble>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <BubbleGroup className="w-96">
      <Bubble>
        <BubbleContent>default</BubbleContent>
      </Bubble>
      <Bubble variant="secondary">
        <BubbleContent>secondary</BubbleContent>
      </Bubble>
      <Bubble variant="muted">
        <BubbleContent>muted</BubbleContent>
      </Bubble>
      <Bubble variant="tinted">
        <BubbleContent>tinted</BubbleContent>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent>outline</BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>ghost</BubbleContent>
      </Bubble>
      <Bubble variant="destructive">
        <BubbleContent>destructive</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
}

export const Conversation: Story = {
  render: () => (
    <BubbleGroup className="w-96">
      <Bubble align="end">
        <BubbleContent>Can you share a recent case study?</BubbleContent>
      </Bubble>
      <Bubble variant="muted">
        <BubbleContent>
          Sure — the latest one covers a full rebrand and site relaunch for a B2B services firm.
        </BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
}
