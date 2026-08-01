import type { Block } from 'payload'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'
import { featureHeaderFields, featureSourceField } from '../shared'

export const FeatureStatementGrid: Block = {
  slug: 'featureStatementGrid',
  interfaceName: 'FeatureStatementGridBlock',
  labels: { singular: 'Feature: statement grid', plural: 'Feature: statement grids' },
  fields: [
    ...featureHeaderFields,
    featureSourceField(),
    {
      name: 'statement',
      type: 'richText',
      admin: {
        description:
          "Lead paragraph in the left column — the section's core claim. Leave empty to pull the source.",
      },
    },
    {
      name: 'footnote',
      type: 'textarea',
      admin: { description: 'Short supporting line pinned below the statement.' },
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 4,
      labels: { singular: 'Card', plural: 'Cards' },
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          filterOptions: caseStudyScopedMediaFilter,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    browseAllMediaField(),
  ],
}
