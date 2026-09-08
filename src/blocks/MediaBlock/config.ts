import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { publicApprovedMediaWhere } from '@/fields/caseStudyScopedMedia'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  admin: { group: BLOCK_GROUPS.media },
  interfaceName: 'MediaBlock',
  labels: { singular: 'Caption', plural: 'Captions' },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: publicApprovedMediaWhere,
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Full width', value: 'full' },
        { label: 'Inset', value: 'inset' },
        { label: 'Small', value: 'small' },
      ],
      admin: {
        description:
          'Presentation for this placement only; the media document itself stays layout-neutral.',
      },
    },
    {
      name: 'captionOverride',
      type: 'richText',
      admin: {
        description:
          "Optional. Replaces the media document's canonical caption for this placement only.",
      },
    },
    themeField(),
  ],
}
