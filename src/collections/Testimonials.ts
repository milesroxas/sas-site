import type { Access, CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedField } from '@/access/authenticatedField'

const publicApprovedTestimonial: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' }, approvalStatus: { equals: 'approved-public' } }
}

export const Testimonials: CollectionConfig<'testimonials'> = {
  slug: 'testimonials',
  orderable: true,
  defaultSort: '_order',
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
    {
      name: 'internalTitle',
      type: 'text',
      required: true,
      admin: { description: 'Team-facing label. Not shown publicly.' },
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      admin: { description: 'Client the quote is associated with.' },
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      admin: { description: 'Related engagement, when known.' },
    },
    {
      name: 'speakerName',
      type: 'text',
      required: true,
      admin: { description: 'Name shown with the quote.' },
    },
    {
      name: 'speakerRole',
      type: 'text',
      admin: { description: 'Speaker title or role at the time of the quote.' },
    },
    {
      name: 'speakerOrganization',
      type: 'text',
      admin: {
        description: 'Organization attributed on the quote, if different from the client record.',
      },
    },
    {
      name: 'quote',
      type: 'richText',
      required: true,
      admin: { description: 'The approved quotation text.' },
    },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional speaker photo. Use a public-approved media item.' },
    },
    {
      name: 'approvalStatus',
      type: 'select',
      required: true,
      defaultValue: 'unverified',
      options: ['unverified', 'client-review', 'approved-public', 'internal-only'],
      admin: {
        description:
          'Only published + approved-public testimonials appear publicly. Everything else stays internal.',
      },
    },
    {
      name: 'source',
      type: 'text',
      access: { read: authenticatedField },
      admin: { description: 'Internal provenance (email, call notes, etc.). Never public.' },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: { description: 'When the client cleared this quote for use.' },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { read: authenticatedField, update: authenticatedField },
      admin: { description: 'Internal only. Never exposed to anonymous API consumers.' },
    },
  ],
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
