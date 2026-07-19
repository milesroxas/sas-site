import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedField } from '@/access/authenticatedField'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
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
            { name: 'title', type: 'text', required: true },
            {
              name: 'kind',
              type: 'select',
              enumName: 'lab_project_kind',
              required: true,
              defaultValue: 'experiment',
              options: ['experiment', 'prototype', 'showcase', 'tool', 'research'],
            },
            {
              name: 'status',
              type: 'select',
              enumName: 'lab_project_status',
              required: true,
              defaultValue: 'active',
              options: ['planned', 'active', 'completed', 'archived'],
            },
            { name: 'startDate', type: 'date' },
            { name: 'endDate', type: 'date' },
            { name: 'thesis', type: 'textarea' },
            {
              name: 'summaries',
              type: 'group',
              admin: {
                description:
                  'Reused everywhere: heroes, cards, newsletters, future channels. Write them to stand alone.',
              },
              fields: [
                { name: 'oneLine', type: 'text' },
                { name: 'short', type: 'textarea' },
                { name: 'medium', type: 'textarea' },
              ],
            },
            {
              name: 'capabilities',
              type: 'relationship',
              relationTo: 'capabilities',
              hasMany: true,
            },
            {
              name: 'technologies',
              type: 'array',
              fields: [{ name: 'name', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Story',
          fields: [
            { name: 'context', type: 'richText' },
            { name: 'approach', type: 'richText' },
            { name: 'outcome', type: 'richText' },
            { name: 'learnings', type: 'richText' },
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
        {
          label: 'Assets & Links',
          fields: [
            {
              name: 'coverAsset',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { usageStatus: { equals: 'public-approved' } },
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
              name: 'presentations',
              type: 'join',
              collection: 'lab-pages',
              on: 'labProject',
              admin: {
                allowCreate: false,
                defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
              },
            },
          ],
        },
      ],
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
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
