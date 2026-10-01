import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { type LabBrowseFilterOption, type LabBrowseItem, toLabBrowseItems } from './item'

export type LabBrowseData = {
  items: LabBrowseItem[]
  kinds: LabBrowseFilterOption[]
  capabilities: LabBrowseFilterOption[]
}

/**
 * The query every lab index row consumer shares: published-only,
 * access-enforced, and two levels deep so labProject → capabilities arrives
 * populated for `toLabBrowseItem` (item.ts). Consumers add `where`, `limit` and `sort`;
 * the lab-page closer also swaps in the draft rules (`related.ts`).
 */
export const LAB_BROWSE_QUERY = {
  collection: 'lab-pages',
  draft: false,
  overrideAccess: false,
  depth: 2,
  select: {
    title: true,
    slug: true,
    labProject: true,
    hero: true,
    coverAsset: true,
    featured: true,
    publishedAt: true,
  },
} as const

/** Unique options across items, in alphabetical order. */
const collectOptions = (lists: LabBrowseFilterOption[][]): LabBrowseFilterOption[] => {
  const bySlug = new Map<string, LabBrowseFilterOption>()
  for (const option of lists.flat()) {
    if (!bySlug.has(option.slug)) bySlug.set(option.slug, option)
  }
  return [...bySlug.values()].sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Published lab pages flattened into serializable rows for the lab index,
 * plus the filter vocabularies derived from those rows — an option can never
 * point at an empty result set. Lab pages are not orderable, so the set
 * arrives featured-first and newest-first, which is what `listed` restates.
 */
export const queryLabBrowseData = async (): Promise<LabBrowseData> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    ...LAB_BROWSE_QUERY,
    limit: 100,
    sort: '-featured,-publishedAt',
  })

  const items = toLabBrowseItems(docs)

  return {
    items,
    kinds: collectOptions(items.map((item) => (item.kind ? [item.kind] : []))),
    capabilities: collectOptions(items.map((item) => item.capabilities)),
  }
}
