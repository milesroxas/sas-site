import type { Block } from 'payload'
import { AudienceTabs } from '@/blocks/AudienceTabs/config'
import { Carousel } from '@/blocks/Carousel/config'
import { Content } from '@/blocks/Content/config'
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
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { MediaContentSplit } from '@/blocks/media-content-split/config'
import { RichTextBlock } from '@/blocks/rich-text/config'
import { sectionBlock } from '@/blocks/section/config'
import { storySectionFields, themeField, transitionFields } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { sectionNestableBlocks } from '@/blocks/shared/section-blocks'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { SplitImageOffset } from '@/blocks/split-image-offset/config'
import { StoryBeats } from '@/blocks/story-beats/config'
import { publicApprovedMediaWhere, withCaseStudyScopedMedia } from '@/fields/caseStudyScopedMedia'
import { withStoryBeatSource } from '@/fields/storyBeatSource'

export const CaseStudyStorySection: Block = {
  slug: 'caseStudyStorySection',
  admin: { group: BLOCK_GROUPS.narrative },
  dbName: 'wp_story',
  interfaceName: 'CaseStudyStorySectionBlock',
  labels: { singular: 'Story section', plural: 'Story sections' },
  fields: storySectionFields(),
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

/**
 * Work variants of the shared blocks. Every media picker is scoped to the
 * related case study's asset libraries (`withCaseStudyScopedMedia`), and the
 * blocks that pull canonical story copy also take `withStoryBeatSource`.
 * Same slug and table as the shared block; only the interface differs.
 */
const workStoryBlock = (block: Block, interfaceName: string) =>
  withStoryBeatSource(block, interfaceName, 'work-pages')
const workStoryMediaBlock = (block: Block, interfaceName: string) =>
  withCaseStudyScopedMedia(workStoryBlock(block, interfaceName), interfaceName)

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
const WorkFeatureHeadingOffset = workStoryBlock(
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
const WorkCaseStudyTransition = workStoryBlock(CaseStudyTransition, 'WorkCaseStudyTransitionBlock')
const WorkStoryBeats = workStoryBlock(StoryBeats, 'WorkStoryBeatsBlock')
const WorkMediaContentSplit = workStoryMediaBlock(MediaContentSplit, 'WorkMediaContentSplitBlock')
// Media-only variants: no story copy, so only the picker scope changes.
const WorkMediaBlock = withCaseStudyScopedMedia(MediaBlock, 'WorkMediaBlock')
const WorkCarousel = withCaseStudyScopedMedia(Carousel, 'WorkCarouselBlock')
const WorkAudienceTabs = withCaseStudyScopedMedia(AudienceTabs, 'WorkAudienceTabsBlock')

/**
 * The Work variant of each shared run block that needs one, by slug. Blocks
 * that pull canonical story copy take the story picker; blocks with media
 * also take the picker scope. Everything not named here is offered plain:
 * its copy and data are the block's own (Rich text, Code, figures, FAQ,
 * Insight list, Poster list, Quote banner, CTA band, YouTube).
 *
 * The Standard heading is the one swap: Work offers the story-resolving
 * `caseStudyTransition` in place of the generic `richTransition`
 * (docs/blocks-reorg-roadmap.md, collection coverage).
 */
const workVariants: Record<string, Block> = {
  richTransition: WorkCaseStudyTransition,
  featureHeadingOffset: WorkFeatureHeadingOffset,
  fullMedia: WorkFullMedia,
  mediaContentSplit: WorkMediaContentSplit,
  splitContentNarrow: WorkSplitContentNarrow,
  imagePair: WorkImagePair,
  splitImageOffset: WorkSplitImageOffset,
  featureImageStatement: WorkFeatureImageStatement,
  // Caption and Carousel carry no story copy: picker scope only.
  mediaBlock: WorkMediaBlock,
  carousel: WorkCarousel,
  // Tabs pull story copy per tab, so they keep both.
  featureTabs: WorkFeatureTabs,
}

/**
 * Blocks a Work Page Section can nest: the shared Section-nestable run
 * (`sectionNestableBlocks`) through `workVariants`, so a block that joins the
 * run reaches Work Pages too. Story beats joins under Text, beside Rich text:
 * the study's own prose in a reading column, which only a story surface has
 * anything to resolve for (Lab adds it the same way).
 */
const workSectionBlocks: Block[] = sectionNestableBlocks.flatMap((block) => {
  const variant = workVariants[block.slug] ?? block
  return block.slug === RichTextBlock.slug ? [variant, WorkStoryBeats] : [variant]
})

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
  // Narrative
  WorkCaseStudyStorySection,
  // Statements
  WorkFeatureStatementGrid,
  FeatureStatementLinks,
  // Lists (legacy, top-level only)
  CaseStudyMetrics,
  FeaturedWork,
]
