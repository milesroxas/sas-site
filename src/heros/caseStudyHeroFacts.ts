import { termNames } from '@/blocks/shared/resolve-work-entry'
import { resolveOpening } from '@/features/immersive/visual'
import type { CaseStudy, Organization, Project, WorkPage } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'

/**
 * The facts every case-study hero layout draws on, resolved once from the work
 * page and its canonical case study: the client organization behind the
 * project, the hero opening (the effect grounding the band and the media
 * filling the layout's frame, an upload falling back to the page's cover
 * asset), and the taxonomy terms, capabilities preferring the case study's
 * featured set over the project's full list.
 */
export function caseStudyHeroFacts(page: WorkPage, study: CaseStudy) {
  const project = populatedDoc<Project>(study.project)
  const organization = populatedDoc<Organization>(project?.organization)
  const { ground, media, surface } = resolveOpening(page.hero, {
    fallbackMedia: page.coverAsset,
    seedKey: page.id,
  })
  const featured = termNames(study.featuredCapabilities)

  return {
    capabilities: featured.length ? featured : termNames(project?.capabilities),
    /** The effect behind the whole band, when the page chose one. */
    ground,
    industries: termNames(project?.industries),
    /** The page's own picture, whether or not an effect grounds the band. */
    media,
    organization,
    platforms: termNames(project?.platforms),
    project,
    /** The palette the editor pinned the ground to, which the opening takes with it. */
    surface,
  }
}
