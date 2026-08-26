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
 * ones win over the project's), and featured media (cover, else hero media).
 */
export function resolveWorkEntry(page: WorkPage): WorkEntry | null {
  if (!page.slug) return null

  const study = populatedDoc<CaseStudy>(page.caseStudy)
  const project = populatedDoc<Project>(study?.project)
  const organization = populatedDoc<Organization>(project?.organization)

  const cover = populatedDoc<MediaDoc>(page.coverAsset)
  const heroMedia = populatedDoc<MediaDoc>(page.hero?.media)
  const media = cover || heroMedia

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
    media,
  }
}
