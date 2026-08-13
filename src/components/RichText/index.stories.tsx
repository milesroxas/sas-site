import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heading, paragraph, richText, TEXT_FORMAT_BOLD, text } from '@/blocks/fixtures'
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
