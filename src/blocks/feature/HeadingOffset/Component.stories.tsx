import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { richTextFixture } from '@/shared/testing/richTextFixture'
import { FeatureHeadingOffsetBlock } from './Component'

const meta = {
  title: 'Blocks/Feature/HeadingOffset',
  component: FeatureHeadingOffsetBlock,
  parameters: {
    layout: 'padded',
  },
  args: {
    blockType: 'featureHeadingOffset',
    eyebrow: 'Eyebrow text',
    heading: 'Make your expertise easier to understand and easier to choose.',
    body: richTextFixture(
      'Suits & Sandals is a B2B branding agency for technical companies, specialized service providers, and expert-led firms with complex offerings.\n\nWe clarify positioning and messaging, build distinctive brand identities, and activate those brands through websites, sales communications, campaigns, and ongoing creative services.',
    ),
  },
} satisfies Meta<typeof FeatureHeadingOffsetBlock>

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
