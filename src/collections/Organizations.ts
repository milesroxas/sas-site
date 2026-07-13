import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'

export const Organizations: CollectionConfig<'organizations'> = {
  slug: 'organizations',
  labels: { singular: 'Client', plural: 'Clients' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: { group: 'Content Hub', useAsTitle: 'name', defaultColumns: ['name', 'slug', '_status'] },
  defaultPopulate: { name: true, shortName: true, slug: true, logo: true, industries: true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'shortName', type: 'text' },
    slugField({ fieldToUse: 'name' }),
    { name: 'website', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'industries', type: 'relationship', relationTo: 'industries', hasMany: true },
    { name: 'description', type: 'richText' },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) },
      admin: { description: 'Internal only. Never exposed to anonymous API consumers.' },
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
  ],
  hooks: { beforeChange: [populatePublishedAt] },
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
