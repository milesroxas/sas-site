import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Media, WorkPage } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'

export type WorksBrowseFilterOption = { slug: string; label: string }

export type WorksBrowseItem = {
  id: number
  slug: string
  title: string
  /** Client display name — organization shortName when set. */
  client: string | null
  /** Industry names in project order; the first one leads the facts line. */
  industries: WorksBrowseFilterOption[]
  /** Engagement year — endDate when completed, else startDate. */
  year: string | null
  capabilities: WorksBrowseFilterOption[]
  /** Hero media, falling back to the cover asset — same as the work hero and menu. */
  media: Media | null
  featured: boolean
  publishedAt: string | null
}

export type WorksBrowseData = {
  items: WorksBrowseItem[]
  industries: WorksBrowseFilterOption[]
  capabilities: WorksBrowseFilterOption[]
}

/**
 * The query every index-row consumer shares (the works index, the related-work
 * list on segment pages): published-only, access-enforced, and three levels
 * deep so caseStudy → project/capabilities → organization/industries all
 * arrive populated for `toWorksBrowseItem`. Consumers add `where`, `limit`
 * and `sort`.
 */
export const WORKS_BROWSE_QUERY = {
  collection: 'work-pages',
  draft: false,
  overrideAccess: false,
  depth: 3,
  select: {
    title: true,
    slug: true,
    caseStudy: true,
    hero: true,
    coverAsset: true,
    featured: true,
    publishedAt: true,
  },
} as const

type WorksBrowsePage = Pick<
  WorkPage,
  'id' | 'title' | 'slug' | 'caseStudy' | 'hero' | 'coverAsset' | 'featured' | 'publishedAt'
>

const yearOf = (date: string | null | undefined): string | null =>
  date ? String(new Date(date).getUTCFullYear()) : null

/**
 * A work page fetched with `WORKS_BROWSE_QUERY`, flattened into the
 * serializable row the index and the related-work list render. Null for a
 * page with no slug, which has no route to link to.
 */
export const toWorksBrowseItem = (page: WorksBrowsePage): WorksBrowseItem | null => {
  if (!page.slug) return null
  const study = typeof page.caseStudy === 'object' ? page.caseStudy : null
  const project = study && typeof study.project === 'object' ? study.project : null
  const organization =
    project && typeof project.organization === 'object' ? project.organization : null

  const industries = (project?.industries ?? []).flatMap((industry) =>
    typeof industry === 'object' ? [{ slug: industry.slug, label: industry.name }] : [],
  )
  const capabilities = (study?.featuredCapabilities ?? []).flatMap((capability) =>
    typeof capability === 'object' ? [{ slug: capability.slug, label: capability.name }] : [],
  )

  return {
    id: page.id,
    slug: page.slug,
    title: study?.title || page.title,
    client: organization ? organization.shortName || organization.name : null,
    industries,
    year: yearOf(project?.endDate ?? project?.startDate),
    capabilities,
    media: populatedDoc<Media>(page.hero?.media) ?? populatedDoc<Media>(page.coverAsset),
    featured: Boolean(page.featured),
    publishedAt: page.publishedAt ?? null,
  }
}

/** Rows for a page of `WORKS_BROWSE_QUERY` results, dropping pages with no route. */
export const toWorksBrowseItems = (pages: WorksBrowsePage[]): WorksBrowseItem[] =>
  pages.flatMap((page) => {
    const item = toWorksBrowseItem(page)
    return item ? [item] : []
  })

/** Unique options across items, in alphabetical order. */
const collectOptions = (lists: WorksBrowseFilterOption[][]): WorksBrowseFilterOption[] => {
  const bySlug = new Map<string, WorksBrowseFilterOption>()
  for (const option of lists.flat()) {
    if (!bySlug.has(option.slug)) bySlug.set(option.slug, option)
  }
  return [...bySlug.values()].sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Published work pages flattened into serializable rows for the works index,
 * plus the filter vocabularies derived from those rows — an option can never
 * point at an empty result set.
 */
export const queryWorksBrowseData = async (): Promise<WorksBrowseData> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({ ...WORKS_BROWSE_QUERY, limit: 100, sort: '-publishedAt' })

  const items = toWorksBrowseItems(docs)

  return {
    items,
    industries: collectOptions(items.map((item) => item.industries)),
    capabilities: collectOptions(items.map((item) => item.capabilities)),
  }
}
