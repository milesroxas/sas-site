import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import { createChat } from '@/shared/testing/shadcn-helpers/ai-sdk'
import { FooterClosing } from './FooterClosing'

/**
 * The embedded AskWidget drives the real chat lifecycle through a scripted
 * transport (vendored @shadcn/helpers ai-sdk) — no /api/ask route, network,
 * or API key. Type a question and submit to play the scripted reply.
 */
const scriptedAnswers = createChat().assistant(
  'Suits & Sandals pairs brand strategy with design and engineering — ask about the work, the process, or how an engagement starts.',
)

const closing = {
  eyebrow: 'Ready to start?',
  heading: 'Let’s make it make sense.',
  links: [
    {
      id: 'estimate',
      link: {
        type: 'custom' as const,
        url: '/contact',
        label: 'Request an estimate',
        appearance: 'default' as const,
      },
    },
    {
      id: 'call',
      link: {
        type: 'custom' as const,
        url: '/contact',
        label: 'Schedule a call',
        appearance: 'outline' as const,
      },
    },
  ],
  ask: {
    title: 'A homepage can only tell you so much…',
    body: 'Get into the details about our work, process, capabilities, and how we can work together.',
  },
  media: mediaFixture,
}

const meta = {
  title: 'Features/FooterClosing',
  component: FooterClosing,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    closing,
    askTransport: scriptedAnswers.transport({
      fallback: 'That is the end of this scripted demo — reload the story to start over.',
    }),
  },
} satisfies Meta<typeof FooterClosing>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The background upload can also be a video — same band, motion background. */
export const Video: Story = {
  args: { closing: { ...closing, media: videoFixture } },
}

/**
 * Site Info › Ask › Hide Ask: the address panel takes the composer's place.
 * Note from Footer › Closing › Address panel; lines from Site Info › Address.
 */
export const AddressPanel: Story = {
  args: {
    askHidden: true,
    address: ['240 Kent Ave', 'Brooklyn, NY 11249'],
    closing: {
      ...closing,
      address: {
        note: 'We’re a fully remote company and have been since 2019. But, in case you need it, our business address is:',
      },
    },
  },
}
