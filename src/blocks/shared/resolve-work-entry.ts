import type { CaseStudy, Media as MediaDoc, Organization, Project, WorkPage } from '@/payload-types'

export type WorkEntry = {
  id: number
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

  const study = typeof page.caseStudy === 'object' ? (page.caseStudy as CaseStudy) : null
  const project = study && typeof study.project === 'object' ? (study.project as Project) : null
  const organization =
    project && typeof project.organization === 'object'
      ? (project.organization as Organization)
      : null

  const cover = typeof page.coverAsset === 'object' ? page.coverAsset : null
  const heroMedia = page.hero?.media && typeof page.hero.media === 'object' ? page.hero.media : null
  const media = (cover || heroMedia) as MediaDoc | null

  const industries = termNames(project?.industries)
  const featured = termNames(study?.featuredCapabilities)
  const capabilities = featured.length ? featured : termNames(project?.capabilities)

  return {
    id: page.id,
    href: `/works/${page.slug}`,
    title: study?.title || page.title,
    client: organization?.name || organization?.shortName || null,
    industry: industries[0] ?? null,
    capabilities,
    media,
  }
}
