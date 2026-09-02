import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { authenticated } from '@/access/authenticated'
import { authenticatedField } from '@/access/authenticatedField'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'

export const Organizations: CollectionConfig<'organizations'> = {
  slug: 'organizations',
  labels: { singular: 'Client', plural: 'Clients' },
  orderable: true,
  defaultSort: '_order',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: { group: 'Content Hub', useAsTitle: 'name', defaultColumns: ['name', 'slug', '_status'] },
  defaultPopulate: { name: true, shortName: true, slug: true, logo: true, industries: true },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Primary client name used across the Content Hub.' },
    },
    {
      name: 'shortName',
      type: 'text',
      admin: { description: 'Shorter name for cards and tight layouts.' },
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'website',
      type: 'text',
      admin: { description: "Client's public website URL." },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Preferred logo for public use. Use a public-approved media item.' },
    },
    {
      name: 'industries',
      type: 'relationship',
      relationTo: 'industries',
      hasMany: true,
      admin: { description: 'Shared industry terms used for filtering and related work.' },
    },
    {
      name: 'description',
      type: 'richText',
      admin: { description: 'Public client description. Keep factual and channel-agnostic.' },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { read: authenticatedField, update: authenticatedField },
      admin: { description: 'Internal only. Never exposed to anonymous API consumers.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Set automatically on publish. Override only if needed.',
      },
    },
  ],
  hooks: { beforeChange: [populatePublishedAt] },
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
