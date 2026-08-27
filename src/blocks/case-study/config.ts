import type { Block } from 'payload'
import { AudienceTabs } from '@/blocks/AudienceTabs/config'
import { Carousel } from '@/blocks/Carousel/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureStatementGrid } from '@/blocks/feature/StatementGrid/config'
import { FeatureStatementLinks } from '@/blocks/feature/StatementLinks/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { FullMedia } from '@/blocks/full-media/config'
import { IndustryWork } from '@/blocks/IndustryWork/config'
import { ImagePair } from '@/blocks/image-pair/config'
import {
  relatedSelectionFields,
  storySectionCopyFields,
  themeField,
  transitionFields,
} from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { SplitImageOffset } from '@/blocks/split-image-offset/config'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'
import { withStoryBeatSource } from '@/fields/storyBeatSource'
import { HomeFeaturedWork } from '@/Home/featured-work/config'

export const CaseStudyStorySection: Block = {
  slug: 'caseStudyStorySection',
  admin: { group: BLOCK_GROUPS.narrative },
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
    ...storySectionCopyFields(),
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
  admin: { group: BLOCK_GROUPS.media },
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
  admin: { group: BLOCK_GROUPS.lists },
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
  admin: { group: BLOCK_GROUPS.lists },
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
  admin: { group: BLOCK_GROUPS.statements },
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
  admin: { group: BLOCK_GROUPS.narrative },
  dbName: 'wp_transition',
  interfaceName: 'CaseStudyTransitionBlock',
  labels: { singular: 'Rich transition', plural: 'Rich transitions' },
  fields: [...transitionFields()],
}

export const CaseStudyRelatedWork: Block = {
  slug: 'caseStudyRelatedWork',
  admin: { group: BLOCK_GROUPS.lists },
  dbName: 'wp_related',
  interfaceName: 'CaseStudyRelatedWorkBlock',
  labels: { singular: 'Related work', plural: 'Related work' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Related work' },
    ...relatedSelectionFields(),
  ],
}

const WorkCaseStudyStorySection = withStoryBeatSource(
  CaseStudyStorySection,
  'WorkCaseStudyStorySectionBlock',
)
const WorkSplitContentNarrow = withStoryBeatSource(
  SplitContentNarrow,
  'WorkSplitContentNarrowBlock',
)
const WorkFullMedia = withStoryBeatSource(FullMedia, 'WorkFullMediaBlock')
const WorkImagePair = withStoryBeatSource(ImagePair, 'WorkImagePairBlock')
const WorkSplitImageOffset = withStoryBeatSource(SplitImageOffset, 'WorkSplitImageOffsetBlock')
const WorkFeatureHeadingOffset = withStoryBeatSource(
  FeatureHeadingOffset,
  'WorkFeatureHeadingOffsetBlock',
)
const WorkFeatureStatementGrid = withStoryBeatSource(
  FeatureStatementGrid,
  'WorkFeatureStatementGridBlock',
)
const WorkFeatureImageStatement = withStoryBeatSource(
  FeatureImageStatement,
  'WorkFeatureImageStatementBlock',
)
const WorkFeatureTabs = withStoryBeatSource(FeatureTabs, 'WorkFeatureTabsBlock')

// Ordered by `admin.group` — the blocks drawer renders groups in first-appearance order.
export const caseStudyBlocks = [
  // Narrative
  WorkCaseStudyStorySection,
  CaseStudyTransition,
  // Media
  WorkFullMedia,
  WorkImagePair,
  WorkSplitImageOffset,
  CaseStudyMediaShowcase,
  // Split layouts
  WorkSplitContentNarrow,
  // Statements
  WorkFeatureStatementGrid,
  FeatureStatementLinks,
  WorkFeatureHeadingOffset,
  WorkFeatureImageStatement,
  CaseStudyTestimonial,
  // Interactive
  WorkFeatureTabs,
  AudienceTabs,
  IndustryWork,
  Carousel,
  // Lists & grids
  CaseStudyKeyDecisions,
  CaseStudyMetrics,
  HomeFeaturedWork,
  CaseStudyRelatedWork,
]
