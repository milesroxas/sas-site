import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  contentColumnFixture,
  heading,
  paragraph,
  richText,
  TEXT_FORMAT_BOLD,
  text,
} from '@/blocks/fixtures'
import RichText from './index'

const proseFixture = richText(
  heading('h2', text('A clearer story, told once')),
  paragraph(
    text('Most teams do not have a messaging problem. They have '),
    text('too many messages', TEXT_FORMAT_BOLD),
    text(
      ', each written for a different room. The fix is one narrative the whole company can carry.',
    ),
  ),
  heading('h3', text('What that takes')),
  paragraph(
    text(
      'Research with the audiences that matter, a position sharp enough to exclude something, and language plain enough to survive a hallway retelling.',
    ),
  ),
)

const meta = {
  title: 'Components/RichText',
  component: RichText,
  parameters: {
    layout: 'padded',
  },
  args: {
    data: proseFixture,
  },
} satisfies Meta<typeof RichText>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Emphasis: Story = {
  args: {
    data: richText(
      paragraph(
        text('We build brands that '),
        text('explain themselves', TEXT_FORMAT_BOLD),
        text(' — plainly, and without a sales call.'),
      ),
    ),
    enableProse: false,
    variant: 'emphasis',
    className: 'text-3xl font-light leading-normal',
  },
}

export const WithoutGutter: Story = {
  args: { enableGutter: false },
}

/**
 * Bare mode as the Split family renders it: the content-column editor's
 * flow (kicker, h4 over a ruled list, small note, Actions) styled by the
 * `.payload-richtext:not(.prose)` rules alone.
 */
export const ContentColumn: Story = {
  args: {
    data: contentColumnFixture,
    enableGutter: false,
    enableProse: false,
    className: 'max-w-sm text-base',
  },
}

/** A styled run inside a mixed paragraph falls back to an inline span. */
export const InlineTextStyle: Story = {
  args: {
    data: richText(
      paragraph(
        text('Since 2014', 0, 'eyebrow'),
        text('  we have worked with technical companies, and '),
        text('still do', 0, 'small'),
        text('.'),
      ),
    ),
    enableGutter: false,
    enableProse: false,
    className: 'max-w-sm text-base',
  },
}
