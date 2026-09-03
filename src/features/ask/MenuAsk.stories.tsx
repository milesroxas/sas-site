import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import { createChat } from '@/shared/testing/shadcn-helpers/ai-sdk'
import { MenuAsk } from './MenuAsk'

/**
 * MenuAsk lives in the takeover menu's center column: the preview slot on top
 * (where the docked page window lands), the floating pill composer under it.
 * Submitting swaps the slot for the transcript. All stories drive the real
 * `useChat` lifecycle through a scripted transport: no /api/ask, no network.
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
      // `max-w-full` lets the phone story shrink it to the padded viewport.
      <div className="flex h-[36rem] w-[28rem] max-w-full flex-col items-center gap-6 [&>[data-menu-preview-slot]]:min-h-0 [&>[data-menu-preview-slot]]:flex-1 [&>[data-menu-preview-slot]]:aspect-auto">
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
      'Suits & Sandals focuses on brand strategy, identity systems, and web design for growing companies. "Beyond the logo" walks through how the identity work scales past launch.',
    )
})

/** Pill idle under an (empty) preview slot; submit to watch the swap. */
export const Default: Story = {
  args: {
    transport: scriptedAnswers.transport({
      fallback: 'That is the end of this scripted demo. Reload the story to start over.',
    }),
  },
}

/** Seeded conversation: focus the pill to bring the transcript back. */
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

/**
 * Phone. Every control is a 44px target (HIG): the header actions, the
 * scroll-to-end disc, the composer's submit (a 40px disc padded out to the
 * pill's 48px). Header type reads one step up. `play` focuses the seeded
 * composer so the transcript is up in the capture.
 */
export const Mobile: Story = {
  args: {
    transport: answeredChat.transport(),
    initialMessages: answeredChat.get(),
  },
  globals: { viewport: { value: 'iphone12', isRotated: false } },
  parameters: {
    layout: 'padded',
    viewport: { options: INITIAL_VIEWPORTS },
    chromatic: { viewports: [390] },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('textbox', { name: 'Ask a question' }))
  },
}

/** Transport streams an error chunk, e.g. the rate limiter pushing back. */
const errorChat = createChat().error('Too many questions. Try again in a minute.')

export const ErrorState: Story = {
  args: {
    transport: errorChat.transport(),
  },
}
