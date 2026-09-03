import { segmentPageCollection } from '../segmentPage'
import {
  revalidateExpertisePage,
  revalidateExpertisePageDelete,
} from './hooks/revalidateExpertisePage'

export const ExpertisePages = segmentPageCollection({
  slug: 'expertise-pages',
  labels: { singular: 'Expertise Page', plural: 'Expertise' },
  description:
    'Service offering pages published at /expertise/[slug]. Composition and SEO only; canonical service facts live in Capabilities.',
  taxonomy: {
    name: 'capabilities',
    relationTo: 'capabilities',
    description:
      'Canonical capabilities this offering bundles. Drives automatic related-work matching.',
  },
  relatedWorkDescription:
    'Manual selection. Leave empty to match published work automatically by capability.',
  revalidate: revalidateExpertisePage,
  revalidateDelete: revalidateExpertisePageDelete,
})
