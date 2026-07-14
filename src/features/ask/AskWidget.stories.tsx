import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { createChat } from '@/shared/testing/shadcn-helpers/ai-sdk'
import { AskWidget } from './AskWidget'

/**
 * All stories drive the real `useChat` lifecycle through a scripted transport
 * (vendored @shadcn/helpers ai-sdk) — no /api/ask route, network, or API key.
 * Type a question (3+ characters) and submit to play the next scripted reply.
 */
const meta = {
  title: 'Features/AskWidget',
  component: AskWidget,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[32rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AskWidget>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Assistant-only script: whatever the user types, the next scripted reply
 * streams back — sources first, then the grounded answer, mirroring what
 * /api/ask emits.
 */
const scriptedAnswers = createChat()
  .assistant(({ writer }) => {
    writer
      .sourceUrl({
        sourceId: '/posts/beyond-the-logo',
        title: 'Beyond the logo: brand systems that scale',
        url: '/posts/beyond-the-logo',
      })
      .sourceUrl({
        sourceId: '/posts/websites-that-sell',
        title: 'Websites that sell the way you do',
        url: '/posts/websites-that-sell',
      })
      .text(
        'Suits & Sandals focuses on brand strategy, identity systems, and web design for growing companies. "Beyond the logo" walks through how the identity work scales past launch, and "Websites that sell the way you do" covers how the sites are built to carry that positioning.',
      )
  })
  .assistant(({ writer }) => {
    writer
      .sourceUrl({
        sourceId: '/posts/positioning-first',
        title: 'Positioning first, pixels second',
        url: '/posts/positioning-first',
      })
      .text(
        'Engagements start with discovery and positioning before any design work — "Positioning first, pixels second" describes that sequence in detail.',
      )
  })

export const Default: Story = {
  args: {
    transport: scriptedAnswers.transport({
      fallback: 'That is the end of this scripted demo — reload the story to start over.',
    }),
  },
}

/** Transcript seeded to its final state — the answered, sources-rendered UI. */
const answeredChat = createChat()
  .user('What services does Suits & Sandals offer?')
  .assistant(({ writer }) => {
    writer
      .sourceUrl({
        sourceId: '/posts/beyond-the-logo',
        title: 'Beyond the logo: brand systems that scale',
        url: '/posts/beyond-the-logo',
      })
      .text(
        'Suits & Sandals offers brand strategy, identity systems, and web design. The "Beyond the logo" case study covers how those identity systems are built to scale.',
      )
  })

export const Answered: Story = {
  args: {
    transport: answeredChat.transport(),
    initialMessages: answeredChat.get(),
  },
}

/** The retrieval-came-back-empty path: a plain refusal with no source links. */
const noSourcesChat = createChat().assistant(
  "I couldn't find anything on this site that answers that. Try the search page, or browse the latest posts.",
)

export const NoSources: Story = {
  args: {
    transport: noSourcesChat.transport(),
  },
}

/** First chunk delayed far beyond the demo window — pins the shimmer state. */
const slowChat = createChat().sleep(300_000).assistant('This reply never arrives in the demo.')

export const Thinking: Story = {
  args: {
    transport: slowChat.transport(),
  },
}

/** Transport streams an error chunk, e.g. the rate limiter pushing back. */
const errorChat = createChat().error('Too many questions — try again in a minute.')

export const ErrorState: Story = {
  args: {
    transport: errorChat.transport(),
  },
}
