import { termNames } from '@/blocks/shared/resolve-work-entry'
import { resolveVisual, visualMedia } from '@/features/immersive/visual'
import type { CaseStudy, Organization, Project, WorkPage } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'

/**
 * The facts every case-study hero layout draws on, resolved once from the work
 * page and its canonical case study: the client organization behind the
 * project, the hero visual (an upload, falling back to the page's cover asset,
 * or a Streak Field that needs no upload at all), and the taxonomy terms,
 * capabilities preferring the case study's featured set over the project's
 * full list.
 */
export function caseStudyHeroFacts(page: WorkPage, study: CaseStudy) {
  const project = populatedDoc<Project>(study.project)
  const organization = populatedDoc<Organization>(project?.organization)
  const visual = resolveVisual(page.hero, { fallbackMedia: page.coverAsset, seedKey: page.id })
  const featured = termNames(study.featuredCapabilities)

  return {
    capabilities: featured.length ? featured : termNames(project?.capabilities),
    industries: termNames(project?.industries),
    /** The media document behind `visual`, for consumers that need pixels. */
    media: visualMedia(visual),
    visual,
    organization,
    platforms: termNames(project?.platforms),
    project,
  }
}
