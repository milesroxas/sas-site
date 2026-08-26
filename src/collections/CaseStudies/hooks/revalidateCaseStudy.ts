import { consumerPageHooks } from '@/hooks/revalidateConsumers'
import type { CaseStudy } from '@/payload-types'

export const {
  afterChange: revalidateCaseStudyConsumers,
  beforeDelete: preventDeletingUsedCaseStudy,
} = consumerPageHooks<CaseStudy>({
  basePath: '/works',
  blockedDeleteMessage: 'Delete the related Work Page before deleting its Case Study Content.',
  collection: 'work-pages',
  relationField: 'caseStudy',
  sitemapTag: 'works-sitemap',
})
