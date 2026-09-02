import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DetailList, DetailRow } from './detail-list'

const meta = {
  title: 'UI/DetailList',
  component: DetailList,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Ruled label/value table for facts that are read rather than scanned: the studio’s response promise beside a form, and the receipt of a request just sent.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-130">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DetailList>

export default meta

type Story = StoryObj<typeof meta>

/** Phrase-length values beside a form. */
export const Compact: Story = {
  args: {
    children: (
      <>
        <DetailRow term="Response">Within 2 business days</DetailRow>
        <DetailRow term="Direct">hello@suitsandsandals.com</DetailRow>
        <DetailRow term="Studios">Brooklyn, NY / Philadelphia, PA</DetailRow>
      </>
    ),
  },
}

/** Reading scale, for a row whose value is a sentence. */
export const Roomy: Story = {
  args: {
    size: 'lg',
    children: (
      <>
        <DetailRow term="Scope">Brand Expansion, Web Design</DetailRow>
        <DetailRow term="Budget">50–100K USD</DetailRow>
        <DetailRow term="Timeline">1–3 months</DetailRow>
        <DetailRow term="Brief">
          We&apos;re launching a second product line in Q1 and the current site can&apos;t carry it.
          Need positioning that covers both, then a site that ships with the launch.
        </DetailRow>
      </>
    ),
  },
}
