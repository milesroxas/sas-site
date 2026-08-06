import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'

/**
 * Home-only list of work entries. Hover (or focus) expands a row to reveal
 * client/industry and the entry's featured media.
 */
export const HomeFeaturedWork: Block = {
  slug: 'homeFeaturedWork',
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
