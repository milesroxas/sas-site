import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { createChat } from '@/shared/testing/shadcn-helpers/ai-sdk'
import { MenuAsk } from './MenuAsk'

/**
 * MenuAsk lives in the takeover menu's center column: the preview slot on top
 * (where the docked page window lands), the floating pill composer under it.
 * Submitting swaps the slot for the transcript. All stories drive the real
 * `useChat` lifecycle through a scripted transport — no /api/ask, no network.
 */
const meta = {
  title: 'Features/MenuAsk',
  component: MenuAsk,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
  },
  decorators: [
    (Story) => (
      // Mirrors the menu's center column: the slot flexes, the pill hangs below.
      <div className="flex h-[36rem] w-[28rem] flex-col items-center gap-6 [&>[data-menu-preview-slot]]:min-h-0 [&>[data-menu-preview-slot]]:flex-1 [&>[data-menu-preview-slot]]:aspect-auto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MenuAsk>

export default meta

type Story = StoryObj<typeof meta>

const scriptedAnswers = createChat().assistant(({ writer }) => {
  writer
    .sourceUrl({
      sourceId: '/posts/beyond-the-logo',
      title: 'Beyond the logo: brand systems that scale',
      url: '/posts/beyond-the-logo',
    })
    .text(
      'Suits & Sandals focuses on brand strategy, identity systems, and web design for growing companies — "Beyond the logo" walks through how the identity work scales past launch.',
    )
})

/** Pill idle under an (empty) preview slot; submit to watch the swap. */
export const Default: Story = {
  args: {
    transport: scriptedAnswers.transport({
      fallback: 'That is the end of this scripted demo — reload the story to start over.',
    }),
  },
}

/** Seeded conversation — focus the pill to bring the transcript back. */
const answeredChat = createChat()
  .user('What does Suits & Sandals do?')
  .assistant(({ writer }) => {
    writer
      .sourceUrl({
        sourceId: '/posts/websites-that-sell',
        title: 'Websites that sell the way you do',
        url: '/posts/websites-that-sell',
      })
      .text('Brand strategy, identity systems, and web design for expert-led companies.')
  })

export const Answered: Story = {
  args: {
    transport: answeredChat.transport(),
    initialMessages: answeredChat.get(),
  },
}

/** Transport streams an error chunk, e.g. the rate limiter pushing back. */
const errorChat = createChat().error('Too many questions — try again in a minute.')

export const ErrorState: Story = {
  args: {
    transport: errorChat.transport(),
  },
}
