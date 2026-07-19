import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedField } from '@/access/authenticatedField'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import {
  preventDeletingUsedCaseStudy,
  revalidateCaseStudyConsumers,
} from './hooks/revalidateCaseStudy'
import { validateCaseStudy } from './hooks/validateCaseStudy'

export const CaseStudies: CollectionConfig<'case-studies'> = {
  slug: 'case-studies',
  labels: { singular: 'Case Study Content', plural: 'Case Study Content' },
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
    defaultColumns: ['title', 'project', '_status', 'updatedAt'],
    description:
      'Canonical, reusable engagement content. Website presentation is authored under Website → Work Pages.',
  },
  defaultPopulate: {
    title: true,
    key: true,
    summaries: true,
    project: true,
    featuredCapabilities: true,
    assetLibraries: true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'project', type: 'relationship', relationTo: 'projects', required: true },
            { name: 'thesis', type: 'textarea' },
            {
              name: 'summaries',
              type: 'group',
              fields: [
                { name: 'oneLine', type: 'text' },
                { name: 'short', type: 'textarea' },
                { name: 'medium', type: 'textarea' },
              ],
            },
            {
              name: 'primaryAudience',
              type: 'select',
              options: [
                'prospective-client',
                'existing-client',
                'design-community',
                'development-community',
                'general',
              ],
            },
            {
              name: 'featuredCapabilities',
              type: 'relationship',
              relationTo: 'capabilities',
              hasMany: true,
            },
          ],
        },
        {
          label: 'Story',
          fields: [
            { name: 'context', type: 'richText' },
            { name: 'challenge', type: 'richText' },
            {
              name: 'objectives',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
              ],
            },
            { name: 'strategy', type: 'richText' },
            { name: 'approach', type: 'richText' },
            {
              name: 'keyDecisions',
              type: 'array',
              fields: [
                { name: 'key', type: 'text', required: true },
                { name: 'title', type: 'text', required: true },
                { name: 'problem', type: 'textarea' },
                { name: 'decision', type: 'textarea' },
                { name: 'rationale', type: 'textarea' },
                { name: 'impact', type: 'textarea' },
                { name: 'featured', type: 'checkbox' },
              ],
            },
            { name: 'learnings', type: 'richText' },
          ],
        },
        {
          label: 'Evidence',
          fields: [
            { name: 'outcomeSummary', type: 'richText' },
            {
              name: 'qualitativeOutcomes',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
                { name: 'featured', type: 'checkbox' },
              ],
            },
            {
              name: 'metrics',
              type: 'array',
              fields: [
                { name: 'key', type: 'text', required: true },
                { name: 'label', type: 'text' },
                { name: 'value', type: 'text' },
                { name: 'unit', type: 'text' },
                {
                  name: 'direction',
                  type: 'select',
                  options: ['increase', 'decrease', 'neutral', 'not-applicable'],
                },
                { name: 'qualifier', type: 'text' },
                { name: 'comparisonBaseline', type: 'text' },
                { name: 'timeframe', type: 'text' },
                { name: 'source', type: 'text', access: { read: authenticatedField } },
                { name: 'approvedForPublic', type: 'checkbox', defaultValue: false },
                { name: 'featured', type: 'checkbox' },
              ],
            },
            {
              name: 'testimonials',
              type: 'relationship',
              relationTo: 'testimonials',
              hasMany: true,
            },
            {
              name: 'approvedClaims',
              type: 'array',
              access: { read: authenticatedField },
              fields: [
                { name: 'claim', type: 'textarea', required: true },
                { name: 'source', type: 'text' },
                { name: 'approved', type: 'checkbox' },
              ],
            },
            { name: 'reviewDate', type: 'date' },
          ],
        },
        {
          label: 'Asset Libraries',
          fields: [
            {
              name: 'assetLibraries',
              type: 'relationship',
              relationTo: 'asset-libraries',
              hasMany: true,
              admin: {
                description:
                  'Reusable project libraries containing the approved source assets for every presentation surface.',
              },
            },
            {
              name: 'presentations',
              type: 'join',
              collection: 'work-pages',
              on: 'caseStudy',
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
    beforeValidate: [validateCaseStudy],
    beforeChange: [populatePublishedAt],
    afterChange: [revalidateCaseStudyConsumers],
    beforeDelete: [preventDeletingUsedCaseStudy],
  },
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
