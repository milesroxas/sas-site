import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { authenticated } from '@/access/authenticated'
import { authenticatedField } from '@/access/authenticatedField'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import {
  preventDeletingUsedCaseStudy,
  revalidateCaseStudyConsumers,
} from './hooks/revalidateCaseStudy'
import { validateCaseStudy } from './hooks/validateCaseStudy'
import { CASE_STUDY_STORY_SECTION_DEFINITIONS, caseStudyStorySectionField } from './story'

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
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: { description: 'Canonical case study title. Channel-agnostic.' },
            },
            {
              name: 'project',
              type: 'relationship',
              relationTo: 'projects',
              required: true,
              admin: { description: 'The factual project record this narrative belongs to.' },
            },
            {
              name: 'thesis',
              type: 'textarea',
              admin: { description: 'Core point of view in one or two sentences.' },
            },
            {
              name: 'summaries',
              type: 'group',
              admin: {
                description:
                  'Reused everywhere: heroes, cards, search, future channels. Write them to stand alone. At least one is required to publish.',
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
              name: 'primaryAudience',
              type: 'select',
              options: [
                'prospective-client',
                'existing-client',
                'design-community',
                'development-community',
                'general',
              ],
              admin: { description: 'Who this case study is primarily written for.' },
            },
            {
              name: 'featuredCapabilities',
              type: 'relationship',
              relationTo: 'capabilities',
              hasMany: true,
              admin: {
                description: 'Capabilities to highlight. Used for related-work matching.',
              },
            },
          ],
        },
        {
          label: 'Narrative',
          description:
            'Channel-neutral prose, organized by story role. Each section can stay continuous or be split into reusable Story Beats.',
          fields: CASE_STUDY_STORY_SECTION_DEFINITIONS.map(caseStudyStorySectionField),
        },
        {
          label: 'Objectives & Decisions',
          description:
            'Structured engagement intent and consequential choices. These are reusable records, not page sections.',
          fields: [
            {
              name: 'objectives',
              type: 'array',
              admin: { description: 'What success looked like at the start.' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
              ],
            },
            {
              name: 'keyDecisions',
              type: 'array',
              admin: {
                description:
                  'Major decisions worth reusing. Keys must be unique; do not rename after publish.',
              },
              fields: [
                {
                  name: 'key',
                  type: 'text',
                  required: true,
                  admin: {
                    description:
                      'Stable id (e.g. organize-around-user-intent). Do not rename later.',
                  },
                },
                { name: 'title', type: 'text', required: true },
                {
                  name: 'problem',
                  type: 'textarea',
                  admin: { description: 'What made this decision necessary.' },
                },
                {
                  name: 'decision',
                  type: 'textarea',
                  admin: { description: 'What was decided.' },
                },
                {
                  name: 'rationale',
                  type: 'textarea',
                  admin: { description: 'Why this path was chosen.' },
                },
                {
                  name: 'impact',
                  type: 'textarea',
                  admin: { description: 'What changed because of the decision.' },
                },
                {
                  name: 'featured',
                  type: 'checkbox',
                  admin: { description: 'Mark for prominence in presentations.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Evidence',
          fields: [
            {
              name: 'qualitativeOutcomes',
              type: 'array',
              admin: { description: 'Non-numeric outcomes worth citing.' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
                {
                  name: 'featured',
                  type: 'checkbox',
                  admin: { description: 'Mark for prominence in presentations.' },
                },
              ],
            },
            {
              name: 'metrics',
              type: 'array',
              admin: {
                description:
                  'Structured results — never pre-formatted sentences. Public only when Approved for public is checked.',
              },
              fields: [
                {
                  name: 'key',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Stable id for this metric. Must be unique; do not rename later.',
                  },
                },
                {
                  name: 'label',
                  type: 'text',
                  admin: { description: 'Display label (required if approved for public).' },
                },
                {
                  name: 'value',
                  type: 'text',
                  admin: { description: 'Measured value (required if approved for public).' },
                },
                {
                  name: 'unit',
                  type: 'text',
                  admin: { description: 'Unit if applicable (%, users, weeks).' },
                },
                {
                  name: 'direction',
                  type: 'select',
                  options: ['increase', 'decrease', 'neutral', 'not-applicable'],
                  admin: { description: 'Whether the change went up, down, or stayed flat.' },
                },
                {
                  name: 'qualifier',
                  type: 'text',
                  admin: {
                    description:
                      'Caveat (e.g. estimated). Needed with or instead of source when public.',
                  },
                },
                {
                  name: 'comparisonBaseline',
                  type: 'text',
                  admin: { description: 'What the value is compared against.' },
                },
                {
                  name: 'timeframe',
                  type: 'text',
                  admin: { description: 'Period the metric covers.' },
                },
                {
                  name: 'source',
                  type: 'text',
                  access: { read: authenticatedField },
                  admin: {
                    description: 'Internal provenance. Never public.',
                  },
                },
                {
                  name: 'approvedForPublic',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description:
                      'Must be checked to appear publicly. Needs label, value, and source or qualifier.',
                  },
                },
                {
                  name: 'featured',
                  type: 'checkbox',
                  admin: { description: 'Mark for prominence in presentations.' },
                },
              ],
            },
            {
              name: 'testimonials',
              type: 'relationship',
              relationTo: 'testimonials',
              hasMany: true,
              admin: {
                description: 'Related quotes. Only approved-public ones appear publicly.',
              },
            },
            {
              name: 'approvedClaims',
              type: 'array',
              access: { read: authenticatedField },
              admin: {
                description: 'Internal claim log. Never returned by the public API.',
              },
              fields: [
                { name: 'claim', type: 'textarea', required: true },
                {
                  name: 'source',
                  type: 'text',
                  admin: { description: 'Where the claim came from.' },
                },
                {
                  name: 'approved',
                  type: 'checkbox',
                  admin: { description: 'Cleared for internal reuse in pitches and proposals.' },
                },
              ],
            },
            {
              name: 'reviewDate',
              type: 'date',
              admin: { description: 'Last time evidence and claims were reviewed.' },
            },
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
                description: 'Website Work Pages that present this case study content.',
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
    beforeValidate: [validateCaseStudy],
    beforeChange: [populatePublishedAt],
    afterChange: [revalidateCaseStudyConsumers],
    beforeDelete: [preventDeletingUsedCaseStudy],
  },
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
