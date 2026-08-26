import { segmentPageCollection } from '../segmentPage'
import {
  revalidateAudiencePage,
  revalidateAudiencePageDelete,
} from './hooks/revalidateAudiencePage'

export const AudiencePages = segmentPageCollection({
  slug: 'audience-pages',
  labels: { singular: 'Audience Page', plural: 'Audience Pages' },
  description:
    'Who We Help segment pages published at /who-we-help/[slug]. The page defines the audience segment; industries drive automatic related-work matching.',
  taxonomy: {
    name: 'industries',
    relationTo: 'industries',
    description: 'Industries this segment spans. Drives automatic related-work matching.',
  },
  relatedWorkDescription:
    'Manual selection. Leave empty to match published work automatically by industry.',
  revalidate: revalidateAudiencePage,
  revalidateDelete: revalidateAudiencePageDelete,
})
