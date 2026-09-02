import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, paragraph, richText, text, videoFixture } from '../fixtures'
import { StorySection } from './StorySection'

/**
 * Copy resolution (block override vs the canonical case study) happens in
 * `RenderCaseStudyBlocks`, so the story hands the section its already-resolved
 * heading and body.
 */
const content = richText(
  paragraph(
    text(
      'The platform had grown by acquisition, and every team told the story a different way. Buyers arrived expecting one company and found four.',
    ),
  ),
  paragraph(
    text(
      'We wrote a single positioning line, then rebuilt the site so every page could be traced back to it.',
    ),
  ),
)

const meta = {
  title: 'Blocks/CaseStudy/StorySection',
  component: StorySection,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    block: {
      blockType: 'caseStudyStorySection',
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
      blockType: 'caseStudyStorySection',
      source: 'challenge',
      eyebrow: 'The problem',
      layout: 'text-only',
      theme: 'light',
      width: 'narrow',
    },
    heading: 'Four companies wearing one name',
  },
}

export const MediaRight: Story = {
  args: {
    block: {
      blockType: 'caseStudyStorySection',
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
      blockType: 'caseStudyStorySection',
      source: 'context',
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
      blockType: 'caseStudyStorySection',
      source: 'context',
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
