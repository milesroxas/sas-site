import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Bubble, BubbleContent } from './bubble'
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from './message'

const meta = {
  title: 'UI/Message',
  component: Message,
  subcomponents: { MessageGroup, MessageAvatar, MessageContent, MessageHeader, MessageFooter },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Message>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <MessageGroup className="w-96">
      <Message align="end">
        <MessageContent>
          <Bubble align="end">
            <BubbleContent>Do you handle brand strategy as well as web design?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <Bubble variant="ghost">
            <BubbleContent>
              Yes — brand strategy and identity systems are the foundation of most engagements, with
              web design and development building on top of them.
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
}

export const WithHeaderAndFooter: Story = {
  render: () => (
    <MessageGroup className="w-96">
      <Message>
        <MessageAvatar className="size-8 text-xs">S&amp;S</MessageAvatar>
        <MessageContent>
          <MessageHeader>Assistant</MessageHeader>
          <Bubble variant="muted">
            <BubbleContent>
              We publish case studies and insights on branding, positioning, and the web.
            </BubbleContent>
          </Bubble>
          <MessageFooter>Just now</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
}
