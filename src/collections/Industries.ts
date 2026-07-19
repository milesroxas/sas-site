import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const Industries: CollectionConfig<'industries'> = {
  slug: 'industries',
  orderable: true,
  defaultSort: '_order',
  access: { create: authenticated, delete: authenticated, read: anyone, update: authenticated },
  admin: { group: 'Taxonomy', useAsTitle: 'name', defaultColumns: ['name', 'updatedAt'] },
  defaultPopulate: { name: true, slug: true },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ fieldToUse: 'name' }),
    { name: 'description', type: 'textarea' },
  ],
}
