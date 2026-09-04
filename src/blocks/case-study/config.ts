import type { Block } from 'payload'
import { AudienceTabs } from '@/blocks/AudienceTabs/config'
import { Carousel } from '@/blocks/Carousel/config'
import { Content } from '@/blocks/Content/config'
import { Faq } from '@/blocks/faq/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureStatementGrid } from '@/blocks/feature/StatementGrid/config'
import { FeatureStatementLinks } from '@/blocks/feature/StatementLinks/config'
import { featureSourceField } from '@/blocks/feature/shared'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { FeaturedWork } from '@/blocks/featured-work/config'
import { FullMedia } from '@/blocks/full-media/config'
import { IndustryWork } from '@/blocks/IndustryWork/config'
import { ImagePair } from '@/blocks/image-pair/config'
import { InsightList } from '@/blocks/insight-list/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { MediaContentSplit } from '@/blocks/media-content-split/config'
import { ScrollGallery } from '@/blocks/scroll-gallery/config'
import { sectionBlock } from '@/blocks/section/config'
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
  admin: { group: BLOCK_GROUPS.sectionHeading },
  dbName: 'wp_transition',
  interfaceName: 'CaseStudyTransitionBlock',
  labels: { singular: 'Standard', plural: 'Standard' },
  // The content picker leads: an interstitial either restates a canonical
  // story beat or writes its own copy, and that choice decides which copy
  // fields the editor ever sees.
  fields: [featureSourceField(), ...transitionFields()],
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
const WorkCaseStudyTransition = withStoryBeatSource(
  CaseStudyTransition,
  'WorkCaseStudyTransitionBlock',
)
const WorkMediaContentSplit = withStoryBeatSource(MediaContentSplit, 'WorkMediaContentSplitBlock')

/**
 * Blocks a Work Page Section can nest, and the same run offered at the top
 * level while the Section transition is underway (docs/blocks-reorg-roadmap.md).
 * Ordered by `admin.group` like the drawer list below.
 */
const workSectionBlocks: Block[] = [
  // Section heading
  WorkCaseStudyTransition,
  WorkFeatureHeadingOffset,
  // Media and content
  WorkFullMedia,
  WorkMediaContentSplit,
  WorkSplitContentNarrow,
  WorkImagePair,
  WorkSplitImageOffset,
  // Media
  WorkFeatureImageStatement,
  // Caption carries no story copy, so it needs no story-beat wrapper.
  MediaBlock,
  // Interactive: FAQ copy is the block's own (questions, not story beats) and
  // Carousel carries none, so neither takes the wrapper. Tabs pull story copy
  // per tab, so they keep it.
  Faq,
  Carousel,
  WorkFeatureTabs,
  // Lists: insight copy is the block's own too.
  InsightList,
]

export const WorkSection = sectionBlock({
  // Content carries no story copy either; it closes the nested list under
  // Custom exactly as `sectionChildBlocks` does on every other surface.
  blocks: [...workSectionBlocks, Content],
  interfaceName: 'WorkSectionBlock',
})

/**
 * Ordered by `admin.group`: the blocks drawer renders groups in
 * first-appearance order, and the reorganized groups lead
 * (docs/blocks-reorg-roadmap.md) ahead of the legacy ones.
 */
export const caseStudyBlocks = [
  // Structure
  WorkSection,
  // Section heading / Media and content / Media / Interactive / Lists: the Section-nestable run
  ...workSectionBlocks,
  // Interactive (legacy, top-level only): kept beside the run's FAQ, Carousel and Tabs
  AudienceTabs,
  IndustryWork,
  // Media
  CaseStudyMediaShowcase,
  ScrollGallery,
  // Narrative
  WorkCaseStudyStorySection,
  // Statements
  WorkFeatureStatementGrid,
  FeatureStatementLinks,
  CaseStudyTestimonial,
  // Lists (legacy, top-level only)
  CaseStudyKeyDecisions,
  CaseStudyMetrics,
  FeaturedWork,
  CaseStudyRelatedWork,
]
