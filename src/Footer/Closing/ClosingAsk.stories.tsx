import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { askHandoffFixture, askSourcesFixture, createAskChat } from '@/features/ask/fixtures'
import { ClosingAsk } from './ClosingAsk'

const reply = createAskChat().assistant(
  'Start with a conversation about your goals. We will help define the scope, timeline, and next steps.',
)
const meta = {
  title: 'Features/ClosingAsk',
  component: ClosingAsk,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,calc(100vw-2rem))] pt-32 pb-8">
        <Story />
      </div>
    ),
  ],
  args: { transport: reply.transport() },
} satisfies Meta<typeof ClosingAsk>
export default meta

type Story = StoryObj<typeof meta>
export const Preview: Story = {}

const answered = createAskChat()
  .user('How do we start?')
  .assistant(
    'Start with a conversation about your goals. We will help define the scope, timeline, and next steps.',
  )
export const Open: Story = {
  args: { initialMessages: answered.get(), transport: answered.transport() },
}
/** A grounded answer with its sources collapsed under it (the Paper "05 Answered" frame). */
const sourced = createAskChat()
  .user('Have you worked with platforms before a raise?')
  .assistant(({ writer }) => {
    for (const source of askSourcesFixture) writer.sourceUrl(source)
    writer.text(
      'Yes. A lot of our work is with platforms and digital products, often right before a raise or a big launch. Most projects start with a short call about goals, timeline, and budget.',
    )
  })
export const Sources: Story = {
  args: { initialMessages: sourced.get(), transport: sourced.transport() },
}

/** The same answer with the disclosure opened. */
export const SourcesOpen: Story = {
  args: { initialMessages: sourced.get(), transport: sourced.transport() },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /sources/i }))
  },
}

/** A pricing question: the handoff card is the whole reply (Paper "Ask handoff - A"). */
const handoff = createAskChat()
  .user('What does a website cost, and when can you start?')
  .assistant(({ writer }) => {
    writer.tool('handoff', { input: { reason: 'estimate' }, output: askHandoffFixture('estimate') })
  })
export const Handoff: Story = {
  args: { initialMessages: handoff.get(), transport: handoff.transport() },
}

export const Thinking: Story = {
  args: { transport: createAskChat().sleep(300_000).assistant('Ready.').transport() },
}
export const ErrorState: Story = {
  args: {
    transport: createAskChat().error('Too many questions, try again in a minute.').transport(),
  },
}
export const LongCopy: Story = {
  args: {
    ask: {
      title: 'A homepage can only tell you so much…',
      body: 'Get into the details about our work, process, capabilities, and how we can work together.',
    },
  },
}
