import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { resolveVisual, type Visual, visualMedia } from '@/features/immersive/visual'
import type { LabPage, Media } from '@/payload-types'
import type { IndexFilterOption } from '@/sections/Browse'
import { formatAuthors } from '@/utilities/formatAuthors'

export type LabBrowseFilterOption = IndexFilterOption

export type LabBrowseItem = {
  id: number
  slug: string
  title: string
  /** What kind of internal work this is, as a filter term. */
  kind: LabBrowseFilterOption | null
  /** Where the project sits in its lifecycle; read-only on the facts line. */
  status: string | null
  /** The project's byline as one line, or null when no author is set. */
  author: string | null
  capabilities: LabBrowseFilterOption[]
  /** Hero visual, falling back to the cover asset — same as the lab hero and menu. */
  visual: Visual | null
  /** The media behind `visual`; null for a Streak Field hero without a cover. */
  media: Media | null
  featured: boolean
  publishedAt: string | null
}

export type LabBrowseData = {
  items: LabBrowseItem[]
  kinds: LabBrowseFilterOption[]
  capabilities: LabBrowseFilterOption[]
}

/**
 * The query every lab index row consumer shares: published-only,
 * access-enforced, and two levels deep so labProject → capabilities arrives
 * populated for `toLabBrowseItem`. Consumers add `where`, `limit` and `sort`.
 *
 * The lab project arrives under an explicit `populate` rather than its
 * `defaultPopulate`, which carries no byline. `authors` is listed beside
 * `populatedAuthors` because the mirror is filled by an `afterRead` hook that
 * reads `authors` off the doc: without it the hook has nothing to read and the
 * byline comes back empty.
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
  populate: {
    'lab-projects': {
      title: true,
      kind: true,
      status: true,
      capabilities: true,
      authors: true,
      populatedAuthors: true,
    },
  },
} as const

type LabBrowsePage = Pick<
  LabPage,
  'id' | 'title' | 'slug' | 'labProject' | 'hero' | 'coverAsset' | 'featured' | 'publishedAt'
>

/** `experiment` → `Experiment`: the stored enum value read as a term. */
const termLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

/**
 * A lab page fetched with `LAB_BROWSE_QUERY`, flattened into the serializable
 * row the index renders. Null for a page with no slug, which has no route to
 * link to.
 */
export const toLabBrowseItem = (page: LabBrowsePage): LabBrowseItem | null => {
  if (!page.slug) return null
  const project = typeof page.labProject === 'object' ? page.labProject : null

  const capabilities = (project?.capabilities ?? []).flatMap((capability) =>
    typeof capability === 'object' ? [{ slug: capability.slug, label: capability.name }] : [],
  )

  const visual = resolveVisual(page.hero, { fallbackMedia: page.coverAsset, seedKey: page.id })
  // The same byline the lab hero prints, read from the shared `populatedAuthors`
  // mirror (`@/fields/authors`) rather than the access-locked `users` relation.
  const author = formatAuthors(project?.populatedAuthors ?? [])

  return {
    id: page.id,
    slug: page.slug,
    title: project?.title || page.title,
    kind: project ? { slug: project.kind, label: termLabel(project.kind) } : null,
    status: project ? termLabel(project.status) : null,
    author: author || null,
    capabilities,
    visual,
    media: visualMedia(visual),
    featured: Boolean(page.featured),
    publishedAt: page.publishedAt ?? null,
  }
}

/** Rows for a page of `LAB_BROWSE_QUERY` results, dropping pages with no route. */
export const toLabBrowseItems = (pages: LabBrowsePage[]): LabBrowseItem[] =>
  pages.flatMap((page) => {
    const item = toLabBrowseItem(page)
    return item ? [item] : []
  })

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
