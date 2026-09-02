import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { authenticated } from '@/access/authenticated'
import { authenticatedField } from '@/access/authenticatedField'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { projectLinksField } from '@/fields/pageFields'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import {
  preventDeletingUsedLabProject,
  revalidateLabProjectConsumers,
} from './hooks/revalidateLabProject'
import { validateLabProject } from './hooks/validateLabProject'

export const LabProjects: CollectionConfig<'lab-projects'> = {
  slug: 'lab-projects',
  labels: { singular: 'Lab Project', plural: 'Lab Projects' },
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
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'status', '_status', 'updatedAt'],
    description:
      'Canonical, reusable records of internal work — experiments, prototypes, and showcase pieces that are not client engagements. Website presentation is authored under Website → Lab Pages.',
  },
  defaultPopulate: {
    title: true,
    key: true,
    kind: true,
    status: true,
    summaries: true,
    capabilities: true,
    coverAsset: true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: { description: 'Canonical lab project title. Channel-agnostic.' },
            },
            {
              name: 'kind',
              type: 'select',
              enumName: 'lab_project_kind',
              required: true,
              defaultValue: 'experiment',
              options: ['experiment', 'prototype', 'showcase', 'tool', 'research'],
              admin: { description: 'What kind of internal work this is.' },
            },
            {
              name: 'status',
              type: 'select',
              enumName: 'lab_project_status',
              required: true,
              defaultValue: 'active',
              options: ['planned', 'active', 'completed', 'archived'],
              admin: {
                description: 'Project lifecycle. Separate from draft/publish state.',
              },
            },
            {
              name: 'startDate',
              type: 'date',
              admin: { description: 'When the lab work began.' },
            },
            {
              name: 'endDate',
              type: 'date',
              admin: { description: 'When the lab work ended, if completed.' },
            },
            {
              name: 'thesis',
              type: 'textarea',
              admin: { description: 'Core point of view or hypothesis in one or two sentences.' },
            },
            {
              name: 'summaries',
              type: 'group',
              admin: {
                description:
                  'Reused everywhere: heroes, cards, newsletters, future channels. Write them to stand alone.',
              },
              fields: [
                {
                  name: 'oneLine',
                  type: 'text',
                  admin: { description: 'Single-sentence summary for tight spaces.' },
                },
                {
                  name: 'short',
                  type: 'textarea',
                  admin: { description: 'Brief summary for cards and listings.' },
                },
                {
                  name: 'medium',
                  type: 'textarea',
                  admin: { description: 'Longer summary for heroes and overviews.' },
                },
              ],
            },
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
              name: 'technologies',
              type: 'array',
              admin: { description: 'Tools, frameworks, or stacks used.' },
              fields: [{ name: 'name', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Story',
          fields: [
            {
              name: 'context',
              type: 'richText',
              admin: { description: 'Why this lab work was started.' },
            },
            {
              name: 'approach',
              type: 'richText',
              admin: { description: 'How the work was carried out.' },
            },
            {
              name: 'outcome',
              type: 'richText',
              admin: { description: 'What resulted from the experiment or build.' },
            },
            {
              name: 'learnings',
              type: 'richText',
              admin: { description: 'What the team took away from the work.' },
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
        {
          label: 'Assets & Links',
          fields: [
            {
              name: 'coverAsset',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { usageStatus: { equals: 'public-approved' } },
              admin: {
                description: 'Primary image. Must be public-approved media.',
              },
            },
            {
              name: 'selectedAssets',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              filterOptions: { usageStatus: { equals: 'public-approved' } },
              admin: {
                description:
                  'Approved source assets for every presentation surface. Internal work attaches media directly rather than through client Asset Libraries.',
              },
            },
            projectLinksField(),
            {
              name: 'presentations',
              type: 'join',
              collection: 'lab-pages',
              on: 'labProject',
              admin: {
                allowCreate: false,
                defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
                description: 'Website Lab Pages that present this lab project.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Set automatically on publish. Override only if needed.',
      },
    },
    slugField({ name: 'key', checkboxName: 'generateKey', useAsSlug: 'title' }),
  ],
  hooks: {
    beforeValidate: [validateLabProject],
    beforeChange: [populatePublishedAt],
    afterChange: [revalidateLabProjectConsumers],
    beforeDelete: [preventDeletingUsedLabProject],
  },
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
