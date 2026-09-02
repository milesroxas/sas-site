import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import {
  INQUIRY_BUDGETS,
  INQUIRY_MESSAGE_MAX_LENGTH,
  INQUIRY_STATUSES,
  INQUIRY_TIMELINES,
  INQUIRY_TYPES,
} from '@/shared/content/inquiry'
import { inquiryEndpoints } from './endpoints'
import { assignReference, stampHandlingDates } from './hooks'

/** Project-shaped questions only appear on a project inquiry. */
const isProjectInquiry = (data: Partial<{ type?: string | null }> | undefined) =>
  data?.type === 'project'

/**
 * Everything a visitor has sent the studio, and the studio's handling of it.
 *
 * One collection for both contact templates: they ask different questions but
 * produce the same thing — a request that someone has to read, own, and answer.
 * `type` is the discriminator, and the project-only questions are conditioned
 * on it so a general message opens as six fields rather than twelve.
 *
 * Contains visitor PII, so every operation is team-only. The public form never
 * touches this collection directly: it posts to `/api/inquiries`, which
 * validates and writes through the Local API server-side.
 */
export const Inquiries: CollectionConfig<'inquiries'> = {
  slug: 'inquiries',
  labels: { singular: 'Inquiry', plural: 'Inquiries' },
  defaultSort: '-submittedAt',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'Inbox',
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'name', 'type', 'status', 'assignedTo', 'submittedAt'],
    listSearchableFields: ['reference', 'name', 'email', 'company', 'message'],
    description:
      'Requests from the site. New ones are unread until someone opens them — assign an owner so nothing sits.',
    components: {
      beforeListTable: ['@/collections/Inquiries/components/InboxFilters#InboxFilters'],
    },
  },
  endpoints: inquiryEndpoints,
  hooks: {
    beforeChange: [assignReference, stampHandlingDates],
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Quoted in the confirmation email — the visitor knows this code.',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'general',
      options: [...INQUIRY_TYPES],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'new',
      options: [...INQUIRY_STATUSES],
      admin: {
        position: 'sidebar',
        description: 'Where this request has got to. "New" means nobody has picked it up yet.',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Who owns the reply. Assigning emails them.',
      },
    },
    {
      name: 'actions',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: { Field: '@/collections/Inquiries/components/InquiryActions#InquiryActions' },
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'repliedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        condition: (data) => Boolean(data?.repliedAt),
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Request',
          description: 'Exactly what the visitor sent. Read-only so it stays a faithful record.',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, admin: { readOnly: true } },
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                  index: true,
                  admin: { readOnly: true },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'company', type: 'text', admin: { readOnly: true } },
                {
                  name: 'website',
                  type: 'text',
                  label: 'Current site',
                  admin: { readOnly: true },
                },
              ],
            },
            {
              name: 'capabilities',
              type: 'relationship',
              relationTo: 'capabilities',
              hasMany: true,
              admin: {
                readOnly: true,
                condition: isProjectInquiry,
                description: 'What they said they need.',
              },
            },
            {
              name: 'capabilitiesUnsure',
              type: 'checkbox',
              label: 'Not sure what they need yet',
              admin: { readOnly: true, condition: isProjectInquiry },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'budget',
                  type: 'select',
                  options: [...INQUIRY_BUDGETS],
                  admin: { readOnly: true, condition: isProjectInquiry },
                },
                {
                  name: 'timeline',
                  type: 'select',
                  options: [...INQUIRY_TIMELINES],
                  admin: { readOnly: true, condition: isProjectInquiry },
                },
              ],
            },
            {
              name: 'message',
              type: 'textarea',
              required: true,
              maxLength: INQUIRY_MESSAGE_MAX_LENGTH,
              admin: { readOnly: true, rows: 8 },
            },
            {
              name: 'sourceUrl',
              type: 'text',
              label: 'Submitted from',
              admin: {
                readOnly: true,
                description: 'Page the form was on — useful when a campaign is running.',
              },
            },
          ],
        },
        {
          label: 'Handling',
          description: 'Internal only. Nothing here is ever shown to the visitor.',
          fields: [
            {
              name: 'notes',
              type: 'array',
              labels: { singular: 'Note', plural: 'Notes' },
              admin: {
                description: 'What was said, decided, or is still outstanding.',
                initCollapsed: false,
              },
              fields: [
                { name: 'note', type: 'textarea', required: true },
                {
                  name: 'author',
                  type: 'relationship',
                  relationTo: 'users',
                  admin: { readOnly: true },
                  hooks: {
                    beforeChange: [
                      ({ req, value }) => value ?? (req.user?.id as number | undefined),
                    ],
                  },
                },
                {
                  name: 'createdAt',
                  type: 'date',
                  admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
                  hooks: { beforeChange: [({ value }) => value ?? new Date().toISOString()] },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
