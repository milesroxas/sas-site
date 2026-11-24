import type { Block } from 'payload'
import { relatedSelectionFields } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/** Lab Pages only: other Lab Pages, picked by hand or by shared capability. */
export const RelatedLabProjects: Block = {
  slug: 'labRelatedProjects',
  admin: { group: BLOCK_GROUPS.lists },
  dbName: 'lp_related',
  interfaceName: 'RelatedLabProjectsBlock',
  labels: { singular: 'Related lab projects', plural: 'Related lab projects' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'More from the lab' },
    ...relatedSelectionFields(),
  ],
}
