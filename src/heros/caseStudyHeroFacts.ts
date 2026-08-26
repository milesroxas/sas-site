import { termNames } from '@/blocks/shared/resolve-work-entry'
import type { CaseStudy, Media, Organization, Project, WorkPage } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'

/**
 * The facts every case-study hero layout draws on, resolved once from the work
 * page and its canonical case study: the client organization behind the
 * project, the hero media (falling back to the page's cover asset), and the
 * taxonomy terms — capabilities preferring the case study's featured set over
 * the project's full list.
 */
export function caseStudyHeroFacts(page: WorkPage, study: CaseStudy) {
  const project = populatedDoc<Project>(study.project)
  const organization = populatedDoc<Organization>(project?.organization)
  const media = populatedDoc<Media>(page.hero?.media) ?? populatedDoc<Media>(page.coverAsset)
  const featured = termNames(study.featuredCapabilities)

  return {
    capabilities: featured.length ? featured : termNames(project?.capabilities),
    industries: termNames(project?.industries),
    media,
    organization,
    platforms: termNames(project?.platforms),
    project,
  }
}
