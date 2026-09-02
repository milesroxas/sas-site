import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, paragraph, richText, text, videoFixture } from '../fixtures'
import { StorySection } from './StorySection'

/**
 * Copy resolution (block override vs the project's canonical section) happens
 * in `RenderLabBlocks`, so the story hands the section its resolved body; the
 * heading still comes off the block.
 */
const content = richText(
  paragraph(
    text(
      'We wanted to know whether a fluid type scale could hold up across a marketing site and an admin panel without a second set of tokens.',
    ),
  ),
  paragraph(
    text('The playground renders every step at every breakpoint so drift shows up immediately.'),
  ),
)

const meta = {
  title: 'Blocks/Lab/StorySection',
  component: StorySection,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    block: {
      blockType: 'labStorySection',
      source: 'context',
      layout: 'text-only',
      theme: 'light',
      width: 'standard',
    },
    content,
  },
} satisfies Meta<typeof StorySection>

export default meta

type Story = StoryObj<typeof meta>

/** With no override, the heading is the name of the section the block points at. */
export const TextOnly: Story = {}

export const WithOverrides: Story = {
  args: {
    block: {
      blockType: 'labStorySection',
      source: 'approach',
      eyebrow: 'How it works',
      headingOverride: 'One scale, two surfaces',
      layout: 'text-only',
      theme: 'light',
      width: 'narrow',
    },
  },
}

export const MediaRight: Story = {
  args: {
    block: {
      blockType: 'labStorySection',
      source: 'context',
      layout: 'text-left',
      media: mediaFixture,
      theme: 'light',
      width: 'wide',
    },
  },
}

export const MediaLeft: Story = {
  args: {
    block: {
      blockType: 'labStorySection',
      source: 'outcome',
      layout: 'text-right',
      media: videoFixture,
      theme: 'light',
      width: 'wide',
    },
  },
}

export const Dark: Story = {
  args: {
    block: {
      blockType: 'labStorySection',
      source: 'learnings',
      layout: 'text-left',
      media: mediaFixture,
      theme: 'dark',
      width: 'wide',
    },
  },
}

/** An unresolved body is nothing to show, so the whole band drops out. */
export const NoContent: Story = {
  args: { content: null },
}
