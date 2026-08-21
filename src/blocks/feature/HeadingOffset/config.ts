import type { Block } from 'payload'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { featureHeaderFields, featureSourceField } from '../shared'

export const FeatureHeadingOffset: Block = {
  slug: 'featureHeadingOffset',
  admin: { group: BLOCK_GROUPS.statements },
  interfaceName: 'FeatureHeadingOffsetBlock',
  labels: { singular: 'Feature: heading offset', plural: 'Feature: heading offsets' },
  fields: [
    ...featureHeaderFields,
    featureSourceField(),
    {
      name: 'body',
      type: 'richText',
      admin: {
        description: 'Supporting copy in the offset right column. Leave empty to pull the source.',
      },
    },
  ],
}
