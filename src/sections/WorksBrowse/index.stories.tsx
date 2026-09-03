import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import { worksBrowseCapabilities, worksBrowseIndustries, worksBrowseItems } from './fixtures'
import { WorksBrowse } from './index'

const meta = {
  title: 'Sections/WorksBrowse',
  component: WorksBrowse,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: 'Work',
    title: 'Our work',
    items: worksBrowseItems,
    industries: worksBrowseIndustries,
    capabilities: worksBrowseCapabilities,
  },
} satisfies Meta<typeof WorksBrowse>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Sole row: the count line reads singular and the list keeps its hairlines. */
export const SingleProject: Story = {
  args: { items: worksBrowseItems.slice(0, 1) },
}

/** Nothing published yet — the empty state carries the reset back to all projects. */
export const Empty: Story = {
  args: { items: [], industries: [], capabilities: [] },
}

/**
 * Below `md` the row stacks: the number and arrow ride a header line above the
 * thumbnail, and the filter strip wraps onto its own rows.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'iphone12', isRotated: false } },
  parameters: { viewport: { options: INITIAL_VIEWPORTS } },
}
