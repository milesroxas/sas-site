import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, paragraph, richText, text, videoFixture } from '../fixtures'
import { StorySection } from './StorySection'

/**
 * Copy resolution (block override vs the Lab Project's canonical story) happens
 * in `RenderLabBlocks`, so the story hands the section its already-resolved
 * heading and body.
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
    heading: 'Context',
  },
} satisfies Meta<typeof StorySection>

export default meta

type Story = StoryObj<typeof meta>

export const TextOnly: Story = {}

export const WithEyebrow: Story = {
  args: {
    block: {
      blockType: 'labStorySection',
      source: 'approach',
      eyebrow: 'How it works',
      layout: 'text-only',
      theme: 'light',
      width: 'narrow',
    },
    heading: 'One scale, two surfaces',
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
      source: 'outcome-summary',
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
