import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { workPageFixtures } from '../fixtures'
import { RelatedWorkList } from './RelatedWork'

/**
 * Which pages qualify is resolved against Payload in `RenderCaseStudyBlocks`,
 * so the story hands the list its pages directly.
 */
const meta = {
  title: 'Blocks/CaseStudy/RelatedWork',
  component: RelatedWorkList,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    block: {
      blockType: 'caseStudyRelatedWork',
      layout: 'grid',
      limit: 3,
      selectionMode: 'document-settings',
    },
    pages: workPageFixtures,
  },
} satisfies Meta<typeof RelatedWorkList>

export default meta

type Story = StoryObj<typeof meta>

export const Grid: Story = {}

/** Any layout other than `grid` stacks into one column. */
export const List: Story = {
  args: {
    block: {
      blockType: 'caseStudyRelatedWork',
      layout: 'list',
      limit: 3,
      selectionMode: 'document-settings',
    },
  },
}

export const CustomHeading: Story = {
  args: {
    block: {
      blockType: 'caseStudyRelatedWork',
      heading: 'More like this',
      layout: 'grid',
      limit: 3,
      selectionMode: 'automatic-capability-match',
    },
  },
}

/** A page whose case study is unpopulated falls back to the page title. */
export const UnpopulatedCaseStudy: Story = {
  args: {
    pages: workPageFixtures.map((page) => ({ ...page, caseStudy: page.id })),
  },
}

export const Empty: Story = {
  args: { pages: [] },
}
