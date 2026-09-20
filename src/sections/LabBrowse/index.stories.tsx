import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import { labBrowseCapabilities, labBrowseItems, labBrowseKinds } from './fixtures'
import { LabBrowse } from './index'

const meta = {
  title: 'Sections/LabBrowse',
  component: LabBrowse,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: 'Lab',
    title: 'The lab',
    items: labBrowseItems,
    kinds: labBrowseKinds,
    capabilities: labBrowseCapabilities,
  },
} satisfies Meta<typeof LabBrowse>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Sole row: the count line reads singular and the list keeps its hairlines. */
export const SingleProject: Story = {
  args: { items: labBrowseItems.slice(0, 1) },
}

/** Nothing published yet — the empty state carries the reset back to all lab projects. */
export const Empty: Story = {
  args: { items: [], kinds: [], capabilities: [] },
}

/**
 * At `md` the row takes its horizontal form on the narrowest page column that
 * carries it: the thumbnail and gaps sit a size down so the copy keeps a
 * working measure beside them.
 */
export const Tablet: Story = {
  globals: { viewport: { value: 'ipad', isRotated: false } },
  parameters: { viewport: { options: INITIAL_VIEWPORTS } },
}

/**
 * Below `md` the row stacks: the number and arrow ride a header line above the
 * thumbnail, and the filter strip wraps onto its own rows.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'iphone12', isRotated: false } },
  parameters: { viewport: { options: INITIAL_VIEWPORTS } },
}
