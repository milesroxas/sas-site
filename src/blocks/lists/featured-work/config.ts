import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * Curated list of work entries. Hover (or focus) expands a row to reveal
 * client/industry and the entry's featured media. Collection-agnostic: any
 * composition field can offer it.
 */
export const FeaturedWork: Block = {
  slug: 'featuredWork',
  admin: { group: BLOCK_GROUPS.lists },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_feat_work`,
  interfaceName: 'FeaturedWorkBlock',
  labels: { singular: 'Featured work', plural: 'Featured work' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'Featured Work',
      admin: {
        description: 'Small label above the list. Leave empty to hide.',
      },
    },
    {
      name: 'entries',
      type: 'relationship',
      relationTo: 'work-pages',
      hasMany: true,
      required: true,
      minRows: 1,
      admin: {
        description:
          'Work pages shown in order. Hover reveals client, industry, and featured media (cover, else hero media).',
      },
    },
    themeField(),
  ],
}
