import { consumerPageHooks } from '@/hooks/revalidateConsumers'
import type { LabProject } from '@/payload-types'

export const {
  afterChange: revalidateLabProjectConsumers,
  beforeDelete: preventDeletingUsedLabProject,
} = consumerPageHooks<LabProject>({
  basePath: '/lab',
  blockedDeleteMessage: 'Delete the related Lab Page before deleting its Lab Project.',
  collection: 'lab-pages',
  relationField: 'labProject',
  sitemapTag: 'lab-sitemap',
})
