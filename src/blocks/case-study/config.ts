import type { Block } from 'payload'
import { AudienceTabs } from '@/blocks/AudienceTabs/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureStatementGrid } from '@/blocks/feature/StatementGrid/config'
import { FeatureStatementLinks } from '@/blocks/feature/StatementLinks/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { FullMedia } from '@/blocks/full-media/config'
import { IndustryWork } from '@/blocks/IndustryWork/config'
import { ImagePair } from '@/blocks/image-pair/config'
import { themeField } from '@/blocks/shared/fields'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { SplitImageOffset } from '@/blocks/split-image-offset/config'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'

export const CaseStudyStorySection: Block = {
  slug: 'caseStudyStorySection',
  dbName: 'wp_story',
  interfaceName: 'CaseStudyStorySectionBlock',
  labels: { singular: 'Story section', plural: 'Story sections' },
  fields: [
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'context',
      options: [
        'context',
        'challenge',
        'strategy',
        'approach',
        'outcome-summary',
        'learnings',
        'custom',
      ],
      admin: { description: 'Uses canonical story content unless a website override is supplied.' },
    },
    { name: 'eyebrow', type: 'text' },
    { name: 'headingOverride', type: 'text' },
    {
      name: 'bodyOverride',
      type: 'richText',
      admin: { description: 'Website-only override; canonical content is unchanged.' },
    },
    {
      name: 'customBody',
      type: 'richText',
      admin: { condition: (_, siblingData) => siblingData?.source === 'custom' },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      filterOptions: caseStudyScopedMediaFilter,
    },
    browseAllMediaField(),
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'text-only',
      options: ['text-only', 'text-left', 'text-right', 'centered', 'sticky-media'],
    },
    themeField(),
    {
      name: 'width',
      type: 'select',
      defaultValue: 'standard',
      options: ['narrow', 'standard', 'wide'],
    },
  ],
}

export const CaseStudyMediaShowcase: Block = {
  slug: 'caseStudyMediaShowcase',
  dbName: 'wp_media',
  interfaceName: 'CaseStudyMediaShowcaseBlock',
  labels: { singular: 'Media showcase', plural: 'Media showcases' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'introduction', type: 'richText' },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      filterOptions: caseStudyScopedMediaFilter,
    },
    browseAllMediaField(),
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: ['single', 'grid', 'horizontal', 'stacked', 'full-bleed', 'comparison'],
    },
    themeField(),
    { name: 'showCaptions', type: 'checkbox', defaultValue: true },
    { name: 'showCredits', type: 'checkbox', defaultValue: true },
  ],
}

export const CaseStudyKeyDecisions: Block = {
  slug: 'caseStudyKeyDecisions',
  dbName: 'wp_decisions',
  interfaceName: 'CaseStudyKeyDecisionsBlock',
  labels: { singular: 'Key decisions', plural: 'Key decisions' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'introduction', type: 'richText' },
    { name: 'source', type: 'select', defaultValue: 'featured', options: ['featured', 'all'] },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'cards',
      options: ['list', 'cards', 'editorial', 'sticky'],
    },
    themeField(),
  ],
}

export const CaseStudyMetrics: Block = {
  slug: 'caseStudyMetrics',
  dbName: 'wp_metrics',
  interfaceName: 'CaseStudyMetricsBlock',
  labels: { singular: 'Metrics', plural: 'Metrics' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'introduction', type: 'richText' },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'featured-public',
      options: ['featured-public', 'all-public'],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: ['grid', 'row', 'statement', 'editorial'],
    },
    themeField(),
  ],
}

export const CaseStudyTestimonial: Block = {
  slug: 'caseStudyTestimonial',
  dbName: 'wp_quote',
  interfaceName: 'CaseStudyTestimonialBlock',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  fields: [
    {
      name: 'testimonial',
      type: 'relationship',
      relationTo: 'testimonials',
      required: true,
      filterOptions: { approvalStatus: { equals: 'approved-public' } },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'editorial',
      options: ['editorial', 'centered', 'split', 'compact'],
    },
    themeField(),
    { name: 'showPortrait', type: 'checkbox', defaultValue: true },
  ],
}

export const CaseStudyTransition: Block = {
  slug: 'caseStudyTransition',
  dbName: 'wp_transition',
  interfaceName: 'CaseStudyTransitionBlock',
  labels: { singular: 'Rich transition', plural: 'Rich transitions' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'richText' },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'centered',
      options: ['left', 'centered', 'split', 'statement'],
    },
    themeField(),
  ],
}

export const CaseStudyRelatedWork: Block = {
  slug: 'caseStudyRelatedWork',
  dbName: 'wp_related',
  interfaceName: 'CaseStudyRelatedWorkBlock',
  labels: { singular: 'Related work', plural: 'Related work' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Related work' },
    {
      name: 'selectionMode',
      type: 'select',
      defaultValue: 'document-settings',
      options: ['document-settings', 'automatic-capability-match'],
    },
    { name: 'limit', type: 'number', min: 1, max: 12, defaultValue: 3 },
    { name: 'layout', type: 'select', defaultValue: 'grid', options: ['grid', 'list', 'feature'] },
  ],
}

export const caseStudyBlocks = [
  CaseStudyStorySection,
  SplitContentNarrow,
  FullMedia,
  ImagePair,
  SplitImageOffset,
  CaseStudyMediaShowcase,
  CaseStudyKeyDecisions,
  CaseStudyMetrics,
  CaseStudyTestimonial,
  CaseStudyTransition,
  CaseStudyRelatedWork,
  FeatureHeadingOffset,
  FeatureStatementGrid,
  FeatureStatementLinks,
  FeatureImageStatement,
  FeatureTabs,
  AudienceTabs,
  IndustryWork,
]
