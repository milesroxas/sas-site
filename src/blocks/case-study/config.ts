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
import { publicApprovedMediaWhere, withCaseStudyScopedMedia } from '@/fields/caseStudyScopedMedia'
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
      filterOptions: publicApprovedMediaWhere,
    },
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
      filterOptions: publicApprovedMediaWhere,
    },
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

/**
 * Work variants of the shared blocks. Every media picker is scoped to the
 * related case study's asset libraries (`withCaseStudyScopedMedia`), and the
 * blocks that pull canonical story copy also take `withStoryBeatSource`.
 * Same slug and table as the shared block; only the interface differs.
 */
const workStoryMediaBlock = (block: Block, interfaceName: string) =>
  withCaseStudyScopedMedia(withStoryBeatSource(block, interfaceName), interfaceName)

const WorkCaseStudyStorySection = workStoryMediaBlock(
  CaseStudyStorySection,
  'WorkCaseStudyStorySectionBlock',
)
const WorkCaseStudyMediaShowcase = withCaseStudyScopedMedia(
  CaseStudyMediaShowcase,
  'CaseStudyMediaShowcaseBlock',
)
const WorkSplitContentNarrow = workStoryMediaBlock(
  SplitContentNarrow,
  'WorkSplitContentNarrowBlock',
)
const WorkFullMedia = workStoryMediaBlock(FullMedia, 'WorkFullMediaBlock')
const WorkImagePair = workStoryMediaBlock(ImagePair, 'WorkImagePairBlock')
const WorkSplitImageOffset = workStoryMediaBlock(SplitImageOffset, 'WorkSplitImageOffsetBlock')
const WorkFeatureHeadingOffset = withStoryBeatSource(
  FeatureHeadingOffset,
  'WorkFeatureHeadingOffsetBlock',
)
const WorkFeatureStatementGrid = workStoryMediaBlock(
  FeatureStatementGrid,
  'WorkFeatureStatementGridBlock',
)
const WorkFeatureImageStatement = workStoryMediaBlock(
  FeatureImageStatement,
  'WorkFeatureImageStatementBlock',
)
const WorkFeatureTabs = workStoryMediaBlock(FeatureTabs, 'WorkFeatureTabsBlock')
const WorkCaseStudyTransition = withStoryBeatSource(
  CaseStudyTransition,
  'WorkCaseStudyTransitionBlock',
)
const WorkMediaContentSplit = workStoryMediaBlock(MediaContentSplit, 'WorkMediaContentSplitBlock')
// Media-only variants: no story copy, so only the picker scope changes.
const WorkMediaBlock = withCaseStudyScopedMedia(MediaBlock, 'WorkMediaBlock')
const WorkCarousel = withCaseStudyScopedMedia(Carousel, 'WorkCarouselBlock')
const WorkAudienceTabs = withCaseStudyScopedMedia(AudienceTabs, 'WorkAudienceTabsBlock')
const WorkScrollGallery = withCaseStudyScopedMedia(ScrollGallery, 'WorkScrollGalleryBlock')

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
  // Caption carries no story copy, so it takes the picker scope only.
  WorkMediaBlock,
  // Interactive: FAQ copy is the block's own (questions, not story beats) and
  // it has no media, so it is offered plain. Carousel carries no story copy
  // either, so it takes the picker scope only. Tabs pull story copy per tab,
  // so they keep both.
  Faq,
  WorkCarousel,
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
  WorkAudienceTabs,
  IndustryWork,
  // Media
  WorkCaseStudyMediaShowcase,
  WorkScrollGallery,
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
