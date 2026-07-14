import type { CollectionConfig } from 'payload'

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
  ],
  timestamps: true,
}
