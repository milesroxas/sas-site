import type { CaseStudy, Media as MediaDoc, Organization, Project, WorkPage } from '@/payload-types'

export type FeaturedWorkEntry = {
  id: number
  href: string
  title: string
  client: string | null
  industry: string | null
  media: MediaDoc | null
}

const termName = (term?: number | { name: string } | null): string | null =>
  typeof term === 'object' && term !== null && 'name' in term ? term.name : null

export function resolveFeaturedWorkEntry(page: WorkPage): FeaturedWorkEntry | null {
  if (!page.slug) return null

  const study = typeof page.caseStudy === 'object' ? (page.caseStudy as CaseStudy) : null
  const project = study && typeof study.project === 'object' ? (study.project as Project) : null
  const organization =
    project && typeof project.organization === 'object'
      ? (project.organization as Organization)
      : null

  const cover = typeof page.coverAsset === 'object' ? page.coverAsset : null
  const heroMedia =
    page.hero?.media && typeof page.hero.media === 'object' ? page.hero.media : null
  const media = (cover || heroMedia) as MediaDoc | null

  const industries = (project?.industries ?? [])
    .map(termName)
    .filter((name): name is string => Boolean(name))

  return {
    id: page.id,
    href: `/works/${page.slug}`,
    title: study?.title || page.title,
    client: organization?.name || organization?.shortName || null,
    industry: industries[0] ?? null,
    media,
  }
}
