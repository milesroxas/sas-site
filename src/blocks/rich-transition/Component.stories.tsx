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
    layout: 'offset',
    theme: 'light',
  },
} satisfies Meta<typeof RichTransition>

export default meta

type Story = StoryObj<typeof meta>

export const Offset: Story = {}

export const Left: Story = {
  args: {
    layout: 'left',
  },
}

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

/**
 * Prose: the article opener, on the Story beats reading column at a size set
 * against the 16px body it opens rather than the page type scale.
 */
export const Prose: Story = {
  args: {
    heading: 'From positioning to product story',
    layout: 'prose',
  },
}

/** Prose at h3: a subsection inside the same passage. */
export const ProseHeadingThree: Story = {
  args: {
    heading: 'From positioning to product story',
    headingLevel: 'h3',
    layout: 'prose',
  },
}

/** Prose at h4: the smallest opener, a step above the body it introduces. */
export const ProseHeadingFour: Story = {
  args: {
    heading: 'From positioning to product story',
    headingLevel: 'h4',
    layout: 'prose',
  },
}

export const Dark: Story = {
  args: {
    heading: 'From positioning to product story',
    layout: 'centered',
    theme: 'dark',
  },
}
