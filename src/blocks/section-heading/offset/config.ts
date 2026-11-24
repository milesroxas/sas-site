import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { featureHeaderFields, featureSourceField } from '../../shared/feature-fields'

export const Offset: Block = {
  slug: 'featureHeadingOffset',
  admin: { group: BLOCK_GROUPS.sectionHeading },
  interfaceName: 'OffsetBlock',
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
      /* Retired 2026-11-20: type size comes from the block's role
       (src/blocks/shared/typography.ts), never an editor control. Hidden and
       ignored by the renderer; the column stays until the next migration
       drops it. */
      admin: { hidden: true },
    },
    themeField(),
  ],
}
