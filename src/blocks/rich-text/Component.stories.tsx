import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heading, paragraph, richText, text } from '../fixtures'
import { RichTextBlock } from './Component'

const paragraphs = [
  paragraph(
    text('Technical companies often have more substance than their brands know how to carry.'),
  ),
  paragraph(
    text(
      'The work is not about making the business sound simple. It is about deciding what people need to understand first, then creating a clear path into the expertise, technology, and methodology behind it.',
    ),
  ),
  paragraph(
    text(
      'Strong B2B branding connects positioning, messaging, identity, and experience. It helps people understand what you do, why your approach matters, and why they should keep paying attention.',
    ),
  ),
]

const body = richText(
  heading('h2', text('Complexity is not the problem. Unclear value is.')),
  ...paragraphs,
)

const meta = {
  title: 'Blocks/Text/RichText',
  component: RichTextBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'richText',
    body,
    theme: 'light',
  },
} satisfies Meta<typeof RichTextBlock>

export default meta

type Story = StoryObj<typeof meta>

/** The Paper frame: an inline heading over three paragraphs, columns 2-4. */
export const Default: Story = {}

/** Body copy only, no inline heading. */
export const ParagraphsOnly: Story = {
  args: {
    body: richText(...paragraphs),
  },
}

export const Dark: Story = {
  args: {
    theme: 'dark',
  },
}
