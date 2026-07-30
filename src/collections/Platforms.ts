import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const Platforms: CollectionConfig<'platforms'> = {
  slug: 'platforms',
  orderable: true,
  defaultSort: '_order',
  access: { create: authenticated, delete: authenticated, read: anyone, update: authenticated },
  admin: {
    group: 'Taxonomy',
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    description:
      'Shared vocabulary of platforms and products work is delivered on (e.g. Webflow, Shopify, Figma). Projects link to these — add new platforms deliberately and reuse existing ones instead of creating near-duplicates.',
  },
  defaultPopulate: { name: true, slug: true },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Public platform name, e.g. "Webflow". Use official product spelling.' },
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional. What this platform is and when we reach for it. May appear publicly.',
      },
    },
  ],
}
