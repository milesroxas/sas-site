import { resolveVisual, type Visual, visualMedia } from '@/features/immersive/visual'
import type { CaseStudy, Media as MediaDoc, Organization, Project, WorkPage } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'

export type WorkEntry = {
  id: number
  slug: string
  href: string
  title: string
  client: string | null
  industry: string | null
  capabilities: string[]
  /**
   * The featured visual: the cover asset, else the hero's visual (an upload
   * or a Streak Field, which repeated entries show as a poster).
   */
  visual: Visual | null
  /** The media document behind `visual`, for consumers that need pixels; null for a Streak Field. */
  media: MediaDoc | null
}

/** Names of populated taxonomy terms; unpopulated ids are dropped. */
export const termNames = (terms?: (number | { name: string })[] | null): string[] =>
  (terms ?? [])
    .filter((term): term is { name: string } => typeof term === 'object' && term !== null)
    .map((term) => term.name)

/**
 * Presentation-ready summary of a work page for blocks that feature work
 * entries: canonical title, client, first industry, capabilities (featured
 * ones win over the project's), and the featured visual (cover, else the
 * hero's visual).
 */
export function resolveWorkEntry(page: WorkPage): WorkEntry | null {
  if (!page.slug) return null

  const study = populatedDoc<CaseStudy>(page.caseStudy)
  const project = populatedDoc<Project>(study?.project)
  const organization = populatedDoc<Organization>(project?.organization)

  const cover = populatedDoc<MediaDoc>(page.coverAsset)
  const visual: Visual | null = cover
    ? { kind: 'media', media: cover }
    : resolveVisual(page.hero, { seedKey: page.id })

  const industries = termNames(project?.industries)
  const featured = termNames(study?.featuredCapabilities)
  const capabilities = featured.length ? featured : termNames(project?.capabilities)

  return {
    id: page.id,
    slug: page.slug,
    href: `/works/${page.slug}`,
    title: study?.title || page.title,
    client: organization?.name || organization?.shortName || null,
    industry: industries[0] ?? null,
    capabilities,
    visual,
    media: visualMedia(visual),
  }
}
