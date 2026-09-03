import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import {
  worksBrowseCapabilities,
  worksBrowseIndustries,
  worksBrowseItems,
} from '@/sections/WorksBrowse/fixtures'
import { RelatedWorkSection } from './index'

const webDesign = worksBrowseCapabilities.filter((option) => option.slug === 'web-design')
const enterprise = worksBrowseIndustries.filter((option) => option.slug === 'enterprise-technology')

const byCapability = worksBrowseItems.filter((item) =>
  item.capabilities.some((capability) => capability.slug === 'web-design'),
)
const byIndustry = worksBrowseItems.filter((item) =>
  item.industries.some((industry) => industry.slug === 'enterprise-technology'),
)

const meta = {
  title: 'Sections/RelatedWork',
  component: RelatedWorkSection,
  parameters: { layout: 'fullscreen' },
  args: {
    filter: { kind: 'capabilities', terms: webDesign },
    items: byCapability,
  },
} satisfies Meta<typeof RelatedWorkSection>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Expertise page defined by one capability: its chip carries the dot in every
 * row, and with a single term there is nothing to narrow, so no filter shows.
 */
export const Expertise: Story = {}

/** Audience page: the filter is an industry, so the match lights in the facts line instead of a chip. */
export const Audience: Story = {
  args: {
    filter: { kind: 'industries', terms: enterprise },
    items: byIndustry,
  },
}

/**
 * A page defined by more than one term the rows carry: one filter each,
 * nothing pressed and every match lit until a term is picked, which narrows
 * the list to it.
 */
export const SeveralTerms: Story = {
  args: {
    filter: {
      kind: 'capabilities',
      terms: worksBrowseCapabilities.filter((option) =>
        ['web-design', 'brand-communications'].includes(option.slug),
      ),
    },
    items: worksBrowseItems,
  },
}

/** Sole match: the list keeps its opening rule and closing hairline, and too few rows for a filter. */
export const SingleProject: Story = {
  args: { items: byCapability.slice(0, 1) },
}

/**
 * Below `2xl` the aside sits above the list and its terms run inline across
 * the full page column, the active marker a rule under a picked label; the
 * heading keeps to half the columns.
 */
export const Tablet: Story = {
  args: SeveralTerms.args,
  globals: { viewport: { value: 'ipad', isRotated: false } },
  parameters: { viewport: { options: INITIAL_VIEWPORTS } },
}

/** On a phone the aside takes the full column and the rows fold as on the index. */
export const Mobile: Story = {
  globals: { viewport: { value: 'iphone12', isRotated: false } },
  parameters: { viewport: { options: INITIAL_VIEWPORTS } },
}
