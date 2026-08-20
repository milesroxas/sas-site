import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { paragraph, richText, text } from '@/blocks/fixtures'
import { HomeStatement } from './index'

const meta = {
  title: 'Sections/HomeStatement',
  component: HomeStatement,
  parameters: {
    layout: 'fullscreen',
  },
  // Scroll room on both sides so the full-viewport reveal has an approach.
  decorators: [
    (Story) => (
      <div className="bg-background">
        <div className="h-svh" />
        <Story />
        <div className="h-svh" />
      </div>
    ),
  ],
  args: {
    body: richText(
      paragraph(
        text(
          'We work with technical companies whose offering is genuinely hard to explain — and make it make sense.',
        ),
      ),
      paragraph(text('Strategy first. Then identity, story, and a site that carries both.')),
    ),
  },
} satisfies Meta<typeof HomeStatement>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleParagraph: Story = {
  args: {
    body: richText(paragraph(text('One clear statement, centered, revealed on approach.'))),
  },
}
