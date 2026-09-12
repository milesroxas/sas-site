import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AskWidget } from './AskWidget'
import {
  askHandoffChat,
  askHandoffFixture,
  askHandoffTermsFixture,
  askSourcesFixture,
  createAskChat,
} from './fixtures'
import { askSwapSettled, openAskHandoff, sendAskHandoff, stubInquiryIntake } from './storyPlays'

/**
 * All stories drive the real `useChat` lifecycle through a scripted transport
 * (vendored @shadcn/helpers ai-sdk): no /api/ask route, network, or API key.
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
  args: { terms: askHandoffTermsFixture },
} satisfies Meta<typeof AskWidget>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Assistant-only script: whatever the user types, the next scripted reply
 * streams back (sources first, then the grounded answer), mirroring what
 * /api/ask emits. The sleep between them is the real retrieval-to-first-token
 * gap: the shimmer must hold through it and the sources land after the answer.
 * The third reply is a pricing question's: the handoff card with no text.
 */
const scriptedAnswers = createAskChat()
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
      .sleep(1_200)
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
        'Engagements start with discovery and positioning before any design work. "Positioning first, pixels second" describes that sequence in detail.',
      )
  })
  .assistant(({ writer }) => {
    writer.sleep(800).tool('handoff', {
      input: { reason: 'estimate' },
      output: askHandoffFixture('estimate'),
    })
  })

export const Default: Story = {
  args: {
    transport: scriptedAnswers.transport({
      fallback: 'That is the end of this scripted demo. Reload the story to start over.',
    }),
  },
}

/** Transcript seeded to its final state: the answered UI, sources collapsed. */
const answeredChat = createAskChat()
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

/** The sources disclosure opened: inset rows, one per page, on the shared disclosure track. */
const sourcesChat = createAskChat()
  .user('Have you worked with platforms before a raise?')
  .assistant(({ writer }) => {
    for (const source of askSourcesFixture) writer.sourceUrl(source)
    writer.text(
      'Yes. A lot of our work is with platforms and digital products, often right before a raise or a big launch.',
    )
  })

export const SourcesOpen: Story = {
  args: {
    transport: sourcesChat.transport(),
    initialMessages: sourcesChat.get(),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /sources/i }))
  },
}

/**
 * A pricing question: nothing to publish, so the handoff is the whole reply.
 * The reason's lead line lands as the assistant's words, the offer a beat
 * after it.
 */
export const Handoff: Story = {
  args: {
    transport: askHandoffChat.transport(),
    initialMessages: askHandoffChat.get(),
  },
}

/** Thumbs down opens one more question in the same row; a pick closes it with the thumb filled. */
export const RatedDown: Story = {
  args: Answered.args,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Not helpful' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Incomplete' }))
  },
}

/** The offer opened: the row becomes the form in place. Send stays off until both fields hold something. */
export const HandoffForm: Story = {
  args: Handoff.args,
  parameters: askSwapSettled,
  play: openAskHandoff,
}

/** The visitor already wrote their address: the form lands open with it filled, marked "From your message". */
const handoffEmailChat = createAskChat()
  .user("Can you send me a quote? I'm at jordan@northwind.co")
  .assistant(({ writer }) => {
    writer.tool('handoff', {
      input: { reason: 'contact_details' },
      output: askHandoffFixture('contact_details'),
    })
  })

export const HandoffFromMessage: Story = {
  args: {
    transport: handoffEmailChat.transport(),
    initialMessages: handoffEmailChat.get(),
  },
}

/** A malformed address is caught before anything is posted, in the endpoint's own words. */
export const HandoffInvalidEmail: Story = {
  args: Handoff.args,
  parameters: askSwapSettled,
  play: async (context) => {
    await openAskHandoff(context)
    await context.userEvent.type(context.canvas.getByLabelText('Name'), 'Jordan Lee')
    await context.userEvent.type(context.canvas.getByLabelText('Email'), 'jordan@northwind')
    await context.userEvent.click(context.canvas.getByRole('button', { name: 'Send to the team' }))
  },
}

/**
 * Sent: the intake is stubbed to answer like /api/inquiries/submit, and the
 * form becomes its receipt in place.
 */
export const HandoffSent: Story = {
  args: Handoff.args,
  parameters: askSwapSettled,
  beforeEach: () => stubInquiryIntake(),
  play: async (context) => {
    await openAskHandoff(context)
    await sendAskHandoff(context, { name: 'Jordan Lee', email: 'jordan@northwind.co' })
  },
}

/** A partial answer: what the site says, its sources, then the offer for the rest. */
const partialChat = createAskChat()
  .user('How do we start, and what would it cost?')
  .assistant(({ writer }) => {
    for (const source of askSourcesFixture) writer.sourceUrl(source)
    writer
      .text(
        'Most projects start with a short call about goals, timeline, and budget. From there we send a scoped estimate, so you know what the work covers before anything is signed.',
      )
      .tool('handoff', { input: { reason: 'estimate' }, output: askHandoffFixture('estimate') })
  })

export const PartialAnswerHandoff: Story = {
  args: {
    transport: partialChat.transport(),
    initialMessages: partialChat.get(),
  },
}

/** Retrieval came back empty on a first question: the no-answer lead and offer, no model call. */
const noSourcesChat = createAskChat().assistant(({ writer }) => {
  writer.tool('handoff', { input: { reason: 'no_answer' }, output: askHandoffFixture('no_answer') })
})

export const NoSources: Story = {
  args: {
    transport: noSourcesChat.transport(),
  },
}

/**
 * A reply that settled with nothing to read (a tool call the schema refused,
 * an answer cut to nothing): no bubble, but the quiet offer still closes it,
 * so there is always a way forward.
 */
const emptyReplyChat = createAskChat()
  .user('What does an engagement look like?')
  .assistant(({ writer }) => {
    writer.sourceUrl({
      sourceId: '/posts/positioning-first',
      title: 'Positioning first, pixels second',
      url: '/posts/positioning-first',
    })
  })

export const EmptyReply: Story = {
  args: {
    transport: emptyReplyChat.transport(),
    initialMessages: emptyReplyChat.get(),
  },
}

/**
 * Sources in, first token still far off: pins the state /api/ask spends
 * retrieval-to-first-token in. Must read as Thinking (no empty bubble, no
 * source list) with the composer's button as Stop.
 */
const sourcesOnlyChat = createAskChat().assistant(({ writer }) => {
  writer
    .sourceUrl({
      sourceId: '/posts/positioning-first',
      title: 'Positioning first, pixels second',
      url: '/posts/positioning-first',
    })
    .sleep(300_000)
    .text('This reply never arrives in the demo.')
})

export const AwaitingFirstToken: Story = {
  args: {
    transport: sourcesOnlyChat.transport(),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('textbox'), 'What does an engagement look like?')
    await userEvent.keyboard('{Enter}')
  },
}

/** First chunk delayed far beyond the demo window: pins the shimmer state. */
const slowChat = createAskChat().sleep(300_000).assistant('This reply never arrives in the demo.')

export const Thinking: Story = {
  args: {
    transport: slowChat.transport(),
  },
}

/** Transport streams an error chunk, e.g. the rate limiter pushing back. */
const errorChat = createAskChat().error('Too many questions, try again in a minute.')

export const ErrorState: Story = {
  args: {
    transport: errorChat.transport(),
  },
}
