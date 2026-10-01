import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { publicApprovedMediaWhere } from '@/fields/caseStudyScopedMedia'
import { featureHeaderFields, featureSourceField } from '../shared'

export const FeatureStatementGrid: Block = {
  slug: 'featureStatementGrid',
  admin: { group: BLOCK_GROUPS.statements },
  // Per-parent table name, short enough that the cards table's index and
  // foreign key names stay inside Postgres' 63-character limit on the longest
  // parents (_expertise_pages_v, _audience_pages_v). A static dbName would
  // collapse every collection that uses this block into one table.
  dbName: ({ tableName }) => `${tableName}_stmt_grid`,
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
          filterOptions: publicApprovedMediaWhere,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    themeField(),
  ],
}
