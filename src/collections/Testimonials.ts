import type { Access, CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

const publicApprovedTestimonial: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' }, approvalStatus: { equals: 'approved-public' } }
}

export const Testimonials: CollectionConfig<'testimonials'> = {
  slug: 'testimonials',
  access: {
    create: authenticated,
    delete: authenticated,
    read: publicApprovedTestimonial,
    update: authenticated,
  },
  admin: {
    group: 'Content Hub',
    useAsTitle: 'internalTitle',
    defaultColumns: ['internalTitle', 'organization', 'approvalStatus', '_status'],
  },
  defaultPopulate: {
    speakerName: true,
    speakerRole: true,
    speakerOrganization: true,
    quote: true,
    portrait: true,
  },
  fields: [
    { name: 'internalTitle', type: 'text', required: true },
    { name: 'organization', type: 'relationship', relationTo: 'organizations', required: true },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    { name: 'speakerName', type: 'text', required: true },
    { name: 'speakerRole', type: 'text' },
    { name: 'speakerOrganization', type: 'text' },
    { name: 'quote', type: 'richText', required: true },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    {
      name: 'approvalStatus',
      type: 'select',
      required: true,
      defaultValue: 'unverified',
      options: ['unverified', 'client-review', 'approved-public', 'internal-only'],
    },
    { name: 'source', type: 'text', access: { read: ({ req }) => Boolean(req.user) } },
    { name: 'approvedAt', type: 'date' },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) },
    },
  ],
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
