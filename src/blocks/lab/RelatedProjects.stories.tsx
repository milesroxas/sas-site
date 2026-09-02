import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { labPageFixtures } from '../fixtures'
import { RelatedProjectsList } from './RelatedProjects'

/**
 * Which pages qualify is resolved against Payload in `RenderLabBlocks`, so the
 * story hands the list its pages directly.
 */
const meta = {
  title: 'Blocks/Lab/RelatedProjects',
  component: RelatedProjectsList,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    block: {
      blockType: 'labRelatedProjects',
      layout: 'grid',
      limit: 3,
      selectionMode: 'document-settings',
    },
    pages: labPageFixtures,
  },
} satisfies Meta<typeof RelatedProjectsList>

export default meta

type Story = StoryObj<typeof meta>

export const Grid: Story = {}

/** Any layout other than `grid` stacks into one column. */
export const List: Story = {
  args: {
    block: {
      blockType: 'labRelatedProjects',
      layout: 'list',
      limit: 3,
      selectionMode: 'document-settings',
    },
  },
}

export const CustomHeading: Story = {
  args: {
    block: {
      blockType: 'labRelatedProjects',
      heading: 'Related experiments',
      layout: 'grid',
      limit: 3,
      selectionMode: 'automatic-capability-match',
    },
  },
}

/** A page whose lab project is unpopulated falls back to the page title. */
export const UnpopulatedProject: Story = {
  args: {
    pages: labPageFixtures.map((page) => ({ ...page, labProject: page.id })),
  },
}

export const Empty: Story = {
  args: { pages: [] },
}
