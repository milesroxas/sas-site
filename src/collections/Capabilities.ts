import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const Capabilities: CollectionConfig<'capabilities'> = {
  slug: 'capabilities',
  labels: { singular: 'Capability', plural: 'Capabilities' },
  access: { create: authenticated, delete: authenticated, read: anyone, update: authenticated },
  admin: { group: 'Taxonomy', useAsTitle: 'name', defaultColumns: ['name', 'order', 'updatedAt'] },
  defaultPopulate: { name: true, slug: true },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ fieldToUse: 'name' }),
    { name: 'description', type: 'textarea' },
    { name: 'order', type: 'number', defaultValue: 0, index: true },
  ],
}
