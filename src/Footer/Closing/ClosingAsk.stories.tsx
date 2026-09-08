import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { createChat } from '@/shared/testing/shadcn-helpers/ai-sdk'
import { ClosingAsk } from './ClosingAsk'

const reply = createChat().assistant(
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

const answered = createChat()
  .user('How do we start?')
  .assistant(
    'Start with a conversation about your goals. We will help define the scope, timeline, and next steps.',
  )
export const Open: Story = {
  args: { initialMessages: answered.get(), transport: answered.transport() },
}
export const Thinking: Story = {
  args: { transport: createChat().sleep(300_000).assistant('Ready.').transport() },
}
export const ErrorState: Story = {
  args: {
    transport: createChat().error('Too many questions. Please try again in a minute.').transport(),
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
