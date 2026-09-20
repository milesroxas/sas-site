import { heroImageFixture } from '@/blocks/fixtures'
import type { LabBrowseFilterOption, LabBrowseItem } from './queries'

/** Story fixtures for the lab index rows. */
export const labBrowseKinds: LabBrowseFilterOption[] = [
  { slug: 'experiment', label: 'Experiment' },
  { slug: 'prototype', label: 'Prototype' },
  { slug: 'showcase', label: 'Showcase' },
  { slug: 'tool', label: 'Tool' },
]

export const labBrowseCapabilities: LabBrowseFilterOption[] = [
  { slug: 'web-design', label: 'Web Design' },
  { slug: 'website-production', label: 'Website Production' },
  { slug: 'brand-expansion', label: 'Brand Expansion' },
  { slug: 'web-strategy', label: 'Web Strategy' },
]

const capability = (...slugs: string[]) =>
  labBrowseCapabilities.filter((option) => slugs.includes(option.slug))

const item = (
  id: number,
  title: string,
  kindSlug: string,
  status: string,
  capabilities: ReturnType<typeof capability>,
  overrides: Partial<LabBrowseItem> = {},
): LabBrowseItem => ({
  id,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  title,
  kind: labBrowseKinds.find((option) => option.slug === kindSlug) ?? null,
  status,
  capabilities,
  visual: { kind: 'media', media: heroImageFixture },
  media: heroImageFixture,
  featured: false,
  publishedAt: `2026-0${6 - id}-01T00:00:00.000Z`,
  ...overrides,
})

export const labBrowseItems: LabBrowseItem[] = [
  item(
    1,
    'Refraction playground',
    'experiment',
    'Active',
    capability('web-design', 'website-production'),
    { featured: true },
  ),
  item(2, 'Streak Field studio', 'tool', 'Active', capability('website-production')),
  item(
    3,
    'Type scale under motion',
    'experiment',
    'Completed',
    capability('web-design', 'brand-expansion'),
    // No media: the row falls back to the muted placeholder frame.
    { media: null, visual: null },
  ),
  item(4, 'Route transition sandbox', 'prototype', 'Completed', capability('web-strategy')),
  item(5, 'Cursor grammar', 'showcase', 'Archived', capability('web-design')),
]
