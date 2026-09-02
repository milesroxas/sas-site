import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { featureHeaderFields, featureSourceField } from '../shared'

export const FeatureHeadingOffset: Block = {
  slug: 'featureHeadingOffset',
  admin: { group: BLOCK_GROUPS.sectionHeading },
  interfaceName: 'FeatureHeadingOffsetBlock',
  labels: { singular: 'Offset', plural: 'Offsets' },
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
    {
      name: 'bodySize',
      type: 'select',
      label: 'Body size',
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
      admin: { description: 'Type size of the supporting copy.' },
    },
    themeField(),
  ],
}
