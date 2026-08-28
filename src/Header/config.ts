import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: { group: 'Website' },
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Menu call to action',
      admin: {
        description: 'The pill button in the takeover menu (label + destination).',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          // Default (not just a fallback in the menu) so the NOT NULL column
          // adds cleanly to the existing header row in push and in migration.
          defaultValue: 'Get in touch',
        },
        link({
          appearances: false,
          disableLabel: true,
        }),
      ],
    },
    {
      name: 'featuredWork',
      type: 'relationship',
      relationTo: 'work-pages',
      hasMany: true,
      maxRows: 4,
      label: 'Menu case studies',
      admin: {
        description:
          'Case studies shown in the takeover menu, in this order (max 4). Unpublished picks are skipped. Leave empty to show the 4 most recent published.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
