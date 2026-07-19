import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedField } from '@/access/authenticatedField'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  orderable: true,
  defaultSort: '_order',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: 'Content Hub',
    useAsTitle: 'internalTitle',
    defaultColumns: ['internalTitle', 'organization', 'status', '_status'],
  },
  defaultPopulate: { publicTitle: true, organization: true, capabilities: true, industries: true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            { name: 'internalTitle', type: 'text', required: true },
            { name: 'publicTitle', type: 'text' },
            {
              name: 'organization',
              type: 'relationship',
              relationTo: 'organizations',
              required: true,
            },
            {
              name: 'status',
              type: 'select',
              enumName: 'project_engagement_status',
              required: true,
              defaultValue: 'planned',
              options: ['planned', 'active', 'completed', 'archived'],
            },
            { name: 'engagementType', type: 'text' },
            { name: 'startDate', type: 'date' },
            { name: 'endDate', type: 'date' },
          ],
        },
        {
          label: 'Classification',
          fields: [
            {
              name: 'capabilities',
              type: 'relationship',
              relationTo: 'capabilities',
              hasMany: true,
            },
            { name: 'industries', type: 'relationship', relationTo: 'industries', hasMany: true },
            {
              name: 'platforms',
              type: 'array',
              fields: [{ name: 'name', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Project facts',
          fields: [
            { name: 'publicSummary', type: 'richText' },
            { name: 'scope', type: 'richText' },
            {
              name: 'deliverables',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
              ],
            },
            { name: 'constraints', type: 'richText' },
            {
              name: 'projectLinks',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
                {
                  name: 'visibility',
                  type: 'select',
                  defaultValue: 'public',
                  options: ['public', 'internal'],
                },
              ],
            },
            {
              name: 'internalNotes',
              type: 'textarea',
              access: {
                read: authenticatedField,
                update: authenticatedField,
              },
            },
          ],
        },
      ],
    },
  ],
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
