import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NewsletterSignupBlock } from './Component'

const meta = {
  title: 'Blocks/NewsletterSignup',
  component: NewsletterSignupBlock,
  parameters: {
    layout: 'padded',
  },
  args: {
    blockType: 'newsletterSignup',
    eyebrow: 'Stay in the loop',
    heading: 'Insights on branding complex businesses',
    body: 'Occasional notes on positioning, identity, and activation — no fluff.',
    buttonLabel: 'Subscribe',
    audience: {
      id: 1,
      name: 'Newsletter',
      slug: 'newsletter',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  },
} satisfies Meta<typeof NewsletterSignupBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutEyebrow: Story = {
  args: {
    eyebrow: null,
  },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}

export const Brand: Story = {
  args: { theme: 'brand' },
}
