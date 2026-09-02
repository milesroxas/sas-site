import type { CollectionConfig } from 'payload'

import { INQUIRY_TYPES } from '@/shared/content/inquiry'
import { authenticated } from '../../access/authenticated'
import { inviteEndpoint } from './endpoints/invite'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'System',
    components: {
      beforeListTable: ['@/collections/Users/components/InviteUserButton#InviteUserButton'],
    },
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  endpoints: [inviteEndpoint],
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'notifications',
      type: 'group',
      label: 'Email notifications',
      admin: {
        description: 'What this person is emailed about, on top of anything assigned to them.',
      },
      fields: [
        {
          name: 'inquiries',
          type: 'checkbox',
          label: 'New inquiries from the site',
          defaultValue: false,
        },
        {
          name: 'inquiryTypes',
          type: 'select',
          hasMany: true,
          options: [...INQUIRY_TYPES],
          defaultValue: INQUIRY_TYPES.map((type) => type.value),
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.inquiries),
            description: 'Leave both selected to be told about everything.',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
