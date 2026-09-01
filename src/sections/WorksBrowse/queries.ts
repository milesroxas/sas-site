import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Media } from '@/payload-types'
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

const yearOf = (date: string | null | undefined): string | null =>
  date ? String(new Date(date).getUTCFullYear()) : null

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
  const { docs } = await payload.find({
    collection: 'work-pages',
    draft: false,
    overrideAccess: false,
    // Three levels: caseStudy → project/capabilities → organization/industries.
    depth: 3,
    limit: 100,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      caseStudy: true,
      hero: true,
      coverAsset: true,
      featured: true,
      publishedAt: true,
    },
  })

  const items = docs.flatMap((page): WorksBrowseItem[] => {
    if (!page.slug) return []
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

    return [
      {
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
      },
    ]
  })

  return {
    items,
    industries: collectOptions(items.map((item) => item.industries)),
    capabilities: collectOptions(items.map((item) => item.capabilities)),
  }
}
