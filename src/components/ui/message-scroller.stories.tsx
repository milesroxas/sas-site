import { useChat } from '@ai-sdk/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { createChat } from '@/shared/testing/shadcn-helpers/ai-sdk'
import { Bubble, BubbleContent } from './bubble'
import { Button } from './button'
import { Message, MessageContent } from './message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from './message-scroller'

const meta = {
  title: 'UI/MessageScroller',
  component: MessageScroller,
  subcomponents: {
    MessageScrollerProvider,
    MessageScrollerViewport,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerButton,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MessageScroller>

export default meta

type Story = StoryObj<typeof meta>

const transcript = [
  { id: 'm1', role: 'user', text: 'What does Suits & Sandals do?' },
  {
    id: 'm2',
    role: 'assistant',
    text: 'Brand strategy, identity systems, and web design for growing companies.',
  },
  { id: 'm3', role: 'user', text: 'Do you take on early-stage startups?' },
  {
    id: 'm4',
    role: 'assistant',
    text: 'Yes — positioning work for early-stage teams is a core part of the practice.',
  },
  { id: 'm5', role: 'user', text: 'What does a typical engagement look like?' },
  {
    id: 'm6',
    role: 'assistant',
    text: 'Discovery and strategy first, then identity, then the site — usually 8 to 12 weeks end to end, with a small senior team throughout. Along the way you get positioning artifacts, a full identity system, and a launched site.',
  },
  { id: 'm7', role: 'user', text: 'How do we start?' },
  {
    id: 'm8',
    role: 'assistant',
    text: 'Reach out through the contact form with a bit about your company and timeline, and we go from there.',
  },
] as const

function TranscriptMessage({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  const isUser = role === 'user'
  return (
    <Message align={isUser ? 'end' : 'start'}>
      <MessageContent>
        <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'default' : 'ghost'}>
          <BubbleContent>{text}</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

export const Default: Story = {
  render: () => (
    <div className="h-96 w-96">
      <MessageScrollerProvider defaultScrollPosition="start">
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {transcript.map((message) => (
                <MessageScrollerItem
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={message.role === 'user'}
                >
                  <TranscriptMessage role={message.role} text={message.text} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  ),
}

/**
 * Scripted conversation streamed through the real `useChat` lifecycle via the
 * vendored @shadcn/helpers ai-sdk transport — no network, no model. Click
 * "Send next message" and watch autoScroll keep the streamed reply in view.
 */
const scriptedChat = createChat()
  .user('What does a typical engagement look like?')
  .assistant(
    'Discovery and strategy first, then identity, then the site — usually 8 to 12 weeks end to end, with a small senior team throughout. Deliverables include positioning artifacts, a complete identity system, and a launched marketing site with a CMS your team can actually run.',
  )
  .user('And after launch?')
  .assistant(
    'Most clients stay on a light retainer: design support, new page templates, and quarterly reviews of how the positioning is holding up against the market.',
  )

function StreamingDemo() {
  const { messages, sendMessage, status } = useChat({
    messages: scriptedChat.get(0),
    transport: scriptedChat.transport(),
  })
  const nextMessage = scriptedChat.next(messages)

  return (
    <div className="flex w-96 flex-col gap-3">
      <div className="h-80">
        <MessageScrollerProvider autoScroll>
          <MessageScroller className="rounded-lg border">
            <MessageScrollerViewport>
              <MessageScrollerContent className="p-3">
                {messages.map((message) => (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={message.role === 'user'}
                  >
                    <TranscriptMessage
                      role={message.role === 'user' ? 'user' : 'assistant'}
                      text={message.parts
                        .filter(
                          (part): part is Extract<typeof part, { type: 'text' }> =>
                            part.type === 'text',
                        )
                        .map((part) => part.text)
                        .join('')}
                    />
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      <Button
        disabled={!nextMessage || status === 'streaming' || status === 'submitted'}
        onClick={() => {
          if (nextMessage) void sendMessage(nextMessage)
        }}
      >
        {nextMessage ? 'Send next message' : 'Conversation complete'}
      </Button>
    </div>
  )
}

export const StreamingAutoScroll: Story = {
  render: () => <StreamingDemo />,
}
