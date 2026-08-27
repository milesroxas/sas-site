import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * Curated list of work entries, used by the Home global and Work Pages. Hover
 * (or focus) expands a row to reveal client/industry and the entry's featured
 * media. The slug and table name stay `home*` for the rows already stored.
 */
export const HomeFeaturedWork: Block = {
  slug: 'homeFeaturedWork',
  admin: { group: BLOCK_GROUPS.lists },
  dbName: 'home_feat_work',
  interfaceName: 'HomeFeaturedWorkBlock',
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
    {
      ...themeField(),
      defaultValue: 'dark',
    },
  ],
}
