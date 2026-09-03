import { heroImageFixture } from '@/blocks/fixtures'
import type { WorksBrowseFilterOption, WorksBrowseItem } from './queries'

/** Story fixtures for every surface that renders index rows: the works index and the related-work list. */
export const worksBrowseIndustries: WorksBrowseFilterOption[] = [
  { slug: 'financial-technology', label: 'Financial Technology' },
  { slug: 'enterprise-technology', label: 'Enterprise Technology' },
  { slug: 'consumer-packaged-goods', label: 'Consumer Packaged Goods' },
  { slug: 'professional-services', label: 'Professional Services' },
]

export const worksBrowseCapabilities: WorksBrowseFilterOption[] = [
  { slug: 'brand-expansion', label: 'Brand Expansion' },
  { slug: 'web-design', label: 'Web Design' },
  { slug: 'web-strategy', label: 'Web Strategy' },
  { slug: 'website-production', label: 'Website Production' },
  { slug: 'brand-communications', label: 'Brand Communications' },
]

const capability = (...slugs: string[]) =>
  worksBrowseCapabilities.filter((option) => slugs.includes(option.slug))

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
  industries: worksBrowseIndustries.filter((option) => option.slug === industrySlug),
  year: '2026',
  capabilities,
  media: heroImageFixture,
  featured: false,
  // Descending, so the default Newest sort lists them in declaration order.
  publishedAt: `2026-0${6 - id}-01T00:00:00.000Z`,
  ...overrides,
})

export const worksBrowseItems: WorksBrowseItem[] = [
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
