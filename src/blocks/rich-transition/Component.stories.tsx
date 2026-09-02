import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { paragraph, richText, text } from '../fixtures'
import { RichTransition } from './RichTransition'

const body = richText(
  paragraph(
    text(
      'With the platform narrative agreed, the work shifted from language to surfaces — the site, the docs, and the demo environment every prospect touches.',
    ),
  ),
)

const meta = {
  title: 'Blocks/SectionHeading/Standard',
  component: RichTransition,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    eyebrow: 'Part two',
    heading: 'A Visual Language Rooted in the Real World',
    body,
    layout: 'left',
    theme: 'light',
  },
} satisfies Meta<typeof RichTransition>

export default meta

type Story = StoryObj<typeof meta>

export const Left: Story = {}

export const Centered: Story = {
  args: {
    heading: 'From positioning to product story',
    layout: 'centered',
  },
}

export const Split: Story = {
  args: {
    heading: 'From positioning to product story',
    layout: 'split',
  },
}

export const Statement: Story = {
  args: {
    heading: 'From positioning to product story',
    layout: 'statement',
  },
}

export const Dark: Story = {
  args: {
    heading: 'From positioning to product story',
    layout: 'centered',
    theme: 'dark',
  },
}
