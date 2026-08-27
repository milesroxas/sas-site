import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'
import { featureSourceField } from '../shared'

export const FeatureTabs: Block = {
  slug: 'featureTabs',
  admin: { group: BLOCK_GROUPS.interactive },
  interfaceName: 'FeatureTabsBlock',
  labels: { singular: 'Feature: tabs', plural: 'Feature: tabs' },
  fields: [
    {
      name: 'tabs',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 4,
      labels: { singular: 'Tab', plural: 'Tabs' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', label: 'Tab label', required: true },
        {
          name: 'heading',
          type: 'text',
          required: true,
          admin: { description: 'Lead statement for this tab.' },
        },
        featureSourceField(),
        {
          name: 'description',
          type: 'richText',
          admin: { description: 'Tab body copy. Leave empty to pull the source.' },
        },
        {
          name: 'subheading',
          type: 'text',
          label: 'List heading',
          defaultValue: 'Included',
        },
        {
          name: 'items',
          type: 'array',
          labels: { singular: 'Item', plural: 'Items' },
          fields: [{ name: 'text', type: 'text', required: true }],
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          filterOptions: caseStudyScopedMediaFilter,
        },
        {
          name: 'caption',
          type: 'textarea',
          label: 'Media callout',
          admin: { description: 'Short note shown as a card over the media.' },
        },
      ],
    },
    browseAllMediaField(),
    themeField(),
  ],
}
