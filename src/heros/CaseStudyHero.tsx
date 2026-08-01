import type { CaseStudy, WorkPage } from '@/payload-types'
import { CaseStudyHeroCenteredMedia } from './CaseStudyHeroCenteredMedia'
import { CaseStudyHeroLandscape } from './CaseStudyHeroLandscape'

export const CaseStudyHero = ({ page, study }: { page: WorkPage; study: CaseStudy }) => {
  if (page.hero?.layout === 'landscape') {
    return <CaseStudyHeroLandscape page={page} study={study} />
  }
  return <CaseStudyHeroCenteredMedia page={page} study={study} />
}
