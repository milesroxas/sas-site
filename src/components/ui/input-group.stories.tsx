import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconArrowUp, IconSearch } from '@tabler/icons-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from './input-group'

const meta = {
  title: 'UI/InputGroup',
  component: InputGroup,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputGroup>

export default meta

type Story = StoryObj<typeof meta>

export const WithInlineIcon: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput placeholder="Search…" />
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const Composer: Story = {
  render: () => (
    <InputGroup>
      <InputGroupTextarea placeholder="Ask something…" rows={2} />
      <InputGroupAddon align="block-end">
        <InputGroupButton type="submit" variant="default" size="icon-sm" className="ml-auto">
          <IconArrowUp />
          <span className="sr-only">Send</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

/**
 * The takeover menu's floating "ask" capsule. The variant owns its metrics:
 * popover surface, full radius, and the focus-grow width transition.
 */
export const Pill: Story = {
  render: () => (
    <InputGroup variant="pill">
      <InputGroupInput placeholder="Ask anything…" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton type="submit" variant="default" size="icon-sm">
          <IconArrowUp />
          <span className="sr-only">Ask</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <InputGroup data-disabled="true">
      <InputGroupInput placeholder="Search…" disabled />
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
    </InputGroup>
  ),
}
