import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import { heroImageFixture } from '@/blocks/fixtures'
import { WorksBrowse } from './index'
import type { WorksBrowseItem } from './queries'

const industryFixtures = [
  { slug: 'financial-technology', label: 'Financial Technology' },
  { slug: 'enterprise-technology', label: 'Enterprise Technology' },
  { slug: 'consumer-packaged-goods', label: 'Consumer Packaged Goods' },
  { slug: 'professional-services', label: 'Professional Services' },
]

const capabilityFixtures = [
  { slug: 'brand-expansion', label: 'Brand Expansion' },
  { slug: 'web-design', label: 'Web Design' },
  { slug: 'web-strategy', label: 'Web Strategy' },
  { slug: 'website-production', label: 'Website Production' },
  { slug: 'brand-communications', label: 'Brand Communications' },
]

const capability = (...slugs: string[]) =>
  capabilityFixtures.filter((option) => slugs.includes(option.slug))

const item = (
  id: number,
  title: string,
  client: string,
  industrySlug: string,
  capabilities: ReturnType<typeof capability>,
  overrides: Partial<WorksBrowseItem> = {},
): WorksBrowseItem => ({
  id,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  title,
  client,
  industries: industryFixtures.filter((option) => option.slug === industrySlug),
  year: '2026',
  capabilities,
  media: heroImageFixture,
  featured: false,
  // Descending, so the default Newest sort lists them in declaration order.
  publishedAt: `2026-0${6 - id}-01T00:00:00.000Z`,
  ...overrides,
})

const items: WorksBrowseItem[] = [
  item(
    1,
    'Making the movement of money visible',
    'Interchecks',
    'financial-technology',
    capability('brand-expansion', 'web-design', 'web-strategy'),
    { featured: true },
  ),
  item(
    2,
    'Expanding the brand around a complex product',
    'Arturo',
    'enterprise-technology',
    capability('brand-expansion', 'website-production', 'web-strategy'),
  ),
  item(
    3,
    'Giving dog owners more reason to trust the product',
    'Gentle Beast',
    'consumer-packaged-goods',
    capability('web-design', 'brand-expansion', 'web-strategy', 'website-production'),
    // No media: the row falls back to the muted placeholder frame.
    { media: null },
  ),
  item(
    4,
    'Redefining a health brand for a new market',
    'Vault Workforce Screening',
    'professional-services',
    capability('web-design', 'brand-communications', 'brand-expansion'),
  ),
  item(
    5,
    'Making high-integrity software easier to understand',
    'Adacore',
    'enterprise-technology',
    capability('web-design', 'brand-communications'),
  ),
]

const meta = {
  title: 'Sections/WorksBrowse',
  component: WorksBrowse,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: 'Work',
    title: 'Our work',
    items,
    industries: industryFixtures,
    capabilities: capabilityFixtures,
  },
} satisfies Meta<typeof WorksBrowse>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Sole row: the count line reads singular and the list keeps its hairlines. */
export const SingleProject: Story = {
  args: { items: items.slice(0, 1) },
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
