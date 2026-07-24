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
            {
              name: 'internalTitle',
              type: 'text',
              required: true,
              admin: { description: 'Team-facing label. Not shown publicly.' },
            },
            {
              name: 'publicTitle',
              type: 'text',
              admin: {
                description: 'Public project name when it differs from the internal title.',
              },
            },
            {
              name: 'organization',
              type: 'relationship',
              relationTo: 'organizations',
              required: true,
              admin: { description: 'Client this engagement belongs to.' },
            },
            {
              name: 'status',
              type: 'select',
              enumName: 'project_engagement_status',
              required: true,
              defaultValue: 'planned',
              options: ['planned', 'active', 'completed', 'archived'],
              admin: {
                description: 'Engagement lifecycle. Separate from draft/publish state.',
              },
            },
            {
              name: 'engagementType',
              type: 'text',
              admin: { description: 'How the work was structured (e.g. retainer, sprint).' },
            },
            {
              name: 'startDate',
              type: 'date',
              admin: { description: 'When the engagement began.' },
            },
            {
              name: 'endDate',
              type: 'date',
              admin: { description: 'When the engagement ended, if completed.' },
            },
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
              admin: {
                description: 'Capabilities demonstrated. Used for related-work matching.',
              },
            },
            {
              name: 'industries',
              type: 'relationship',
              relationTo: 'industries',
              hasMany: true,
              admin: { description: 'Industries this project applies to.' },
            },
            {
              name: 'platforms',
              type: 'array',
              admin: { description: 'Platforms or products involved in the work.' },
              fields: [{ name: 'name', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Project facts',
          fields: [
            {
              name: 'publicSummary',
              type: 'richText',
              admin: {
                description: 'Factual public overview. Keep channel-agnostic — not website copy.',
              },
            },
            {
              name: 'scope',
              type: 'richText',
              admin: { description: 'What was in and out of scope for the engagement.' },
            },
            {
              name: 'deliverables',
              type: 'array',
              admin: { description: 'Concrete outputs delivered.' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
              ],
            },
            {
              name: 'constraints',
              type: 'richText',
              admin: { description: 'Known limits: timeline, tech, brand, or legal.' },
            },
            {
              name: 'projectLinks',
              type: 'array',
              admin: { description: 'Related URLs. Set visibility per link.' },
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
                {
                  name: 'visibility',
                  type: 'select',
                  defaultValue: 'public',
                  options: ['public', 'internal'],
                  admin: { description: 'Internal links never appear in the public API.' },
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
              admin: { description: 'Internal only. Never exposed to anonymous API consumers.' },
            },
          ],
        },
      ],
    },
  ],
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
