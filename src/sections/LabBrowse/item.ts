import { resolveVisual, type Visual, visualMedia } from '@/features/immersive/visual'
import type { LabPage, Media } from '@/payload-types'
import type { IndexFilterOption } from '@/sections/Browse'

export type LabBrowseFilterOption = IndexFilterOption

export type LabBrowseItem = {
  id: number
  slug: string
  title: string
  /** What kind of internal work this is, as a filter term. */
  kind: LabBrowseFilterOption | null
  /** Where the project sits in its lifecycle; read-only on the facts line. */
  status: string | null
  capabilities: LabBrowseFilterOption[]
  /** Hero visual, falling back to the cover asset — same as the lab hero and menu. */
  visual: Visual | null
  /** The media behind `visual`; null for a Streak Field hero without a cover. */
  media: Media | null
  featured: boolean
  publishedAt: string | null
}

/** The fields `LAB_BROWSE_QUERY` (queries.ts) selects. */
type LabBrowsePage = Pick<
  LabPage,
  'id' | 'title' | 'slug' | 'labProject' | 'hero' | 'coverAsset' | 'featured' | 'publishedAt'
>

/** `experiment` → `Experiment`: the stored enum value read as a term. */
const termLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

/**
 * A lab page flattened into the serializable row the index renders. Null for
 * a page with no slug, which has no route to link to. Pure, so a component
 * holding an already populated lab page (the home hero card) can flatten it
 * without the query module.
 */
export const toLabBrowseItem = (page: LabBrowsePage): LabBrowseItem | null => {
  if (!page.slug) return null
  const project = typeof page.labProject === 'object' ? page.labProject : null

  const capabilities = (project?.capabilities ?? []).flatMap((capability) =>
    typeof capability === 'object' ? [{ slug: capability.slug, label: capability.name }] : [],
  )

  const visual = resolveVisual(page.hero, { fallbackMedia: page.coverAsset, seedKey: page.id })

  return {
    id: page.id,
    slug: page.slug,
    title: project?.title || page.title,
    kind: project ? { slug: project.kind, label: termLabel(project.kind) } : null,
    status: project ? termLabel(project.status) : null,
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
