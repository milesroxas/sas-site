import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import {
  askHandoffChat,
  askHandoffTermsFixture,
  askSourcesFixture,
  createAskChat,
} from '@/features/ask/fixtures'
import {
  askSwapSettled,
  openAskHandoff,
  sendAskHandoff,
  stubInquiryIntake,
} from '@/features/ask/storyPlays'
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
  args: { terms: askHandoffTermsFixture, transport: reply.transport() },
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

/** A pricing question: the handoff is the whole reply, its lead line then the offer, with the question still in view. */
export const Handoff: Story = {
  args: { initialMessages: askHandoffChat.get(), transport: askHandoffChat.transport() },
}

/** The offer opened in the band's short panel: the form must fit the transcript viewport above the composer. */
export const HandoffForm: Story = {
  args: Handoff.args,
  parameters: askSwapSettled,
  play: openAskHandoff,
}

/** Sent from the band: the form becomes its receipt, the composer ready for the next question. */
export const HandoffSent: Story = {
  args: Handoff.args,
  parameters: askSwapSettled,
  beforeEach: () => stubInquiryIntake(),
  play: async (context) => {
    await openAskHandoff(context)
    await sendAskHandoff(context, { name: 'Jordan Lee', email: 'jordan@northwind.co' })
  },
}

/**
 * Phone: the conversation takes the whole screen as a sheet, its composer
 * docked at the bottom, instead of a panel boxed inside the band's card.
 */
export const MobileSheet: Story = {
  args: Sources.args,
  globals: { viewport: { value: 'iphone12', isRotated: false } },
  parameters: {
    layout: 'padded',
    viewport: { options: INITIAL_VIEWPORTS },
    chromatic: { viewports: [390] },
  },
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
