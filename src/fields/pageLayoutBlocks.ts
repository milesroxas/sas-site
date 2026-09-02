import type { Block } from 'payload'

import { Archive } from '@/blocks/ArchiveBlock/config'
import { AudienceTabs } from '@/blocks/AudienceTabs/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Carousel } from '@/blocks/Carousel/config'
import { Content } from '@/blocks/Content/config'
import { DynamicAudience } from '@/blocks/DynamicAudience/config'
import { FormBlock } from '@/blocks/Form/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureStatementGrid } from '@/blocks/feature/StatementGrid/config'
import { FeatureStatementLinks } from '@/blocks/feature/StatementLinks/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { FeaturedWork } from '@/blocks/featured-work/config'
import { FullMedia } from '@/blocks/full-media/config'
import { IndustryWork } from '@/blocks/IndustryWork/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { MediaContentSplit } from '@/blocks/media-content-split/config'
import { NewsletterSignup } from '@/blocks/NewsletterSignup/config'
import { sectionBlock } from '@/blocks/section/config'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { TestimonialsMarquee } from '@/blocks/TestimonialsMarquee/config'

/**
 * Blocks a Pages Section can nest, and the same run offered at the top level
 * while the Section transition is underway (docs/blocks-reorg-roadmap.md).
 * Ordered by `admin.group` like every drawer list below.
 */
const pageSectionBlocks: Block[] = [
  // Section heading
  FeatureHeadingOffset,
  // Media and content
  FullMedia,
  MediaContentSplit,
  SplitContentNarrow,
  // Media
  FeatureImageStatement,
  MediaBlock,
]

export const PageSection = sectionBlock({
  blocks: pageSectionBlocks,
  interfaceName: 'PageSectionBlock',
})

/**
 * Layout blocks offered by Pages.
 * Ordered by `admin.group` — the blocks drawer renders groups in first-appearance order.
 */
export const pageLayoutBlocks: Block[] = [
  // Structure
  PageSection,
  // Text
  Content,
  // Section heading / Media and content / Media: the Section-nestable run
  ...pageSectionBlocks,
  // Statements
  FeatureStatementGrid,
  FeatureStatementLinks,
  // Interactive
  FeatureTabs,
  DynamicAudience,
  AudienceTabs,
  IndustryWork,
  TestimonialsMarquee,
  Carousel,
  // Lists & grids
  Archive,
  FeaturedWork,
  // Forms & CTAs
  CallToAction,
  FormBlock,
  NewsletterSignup,
]

/**
 * Home composition: everything Pages offers except the curated work list (the
 * homepage tells that story through its own hero and industry blocks) and the
 * Section wrapper, which Home does not adopt yet (docs/blocks-reorg-roadmap.md).
 */
export const homeLayoutBlocks: Block[] = pageLayoutBlocks.filter(
  (block) => block !== FeaturedWork && block !== PageSection,
)

/**
 * Blocks a segment-page Section can nest: the segment slice of the Pages run.
 */
const segmentSectionBlocks: Block[] = [
  // Section heading
  FeatureHeadingOffset,
  // Media and content
  SplitContentNarrow,
  // Media
  FeatureImageStatement,
  MediaBlock,
]

export const SegmentSection = sectionBlock({
  blocks: segmentSectionBlocks,
  interfaceName: 'SegmentSectionBlock',
})

/**
 * Layout blocks shared by the segment pages (Audience, Expertise). A narrower
 * set than `pageLayoutBlocks`: these pages are argument-and-proof surfaces, so
 * the marketing-only blocks (marquee, newsletter) are left out.
 */
export const segmentPageBlocks: Block[] = [
  // Structure
  SegmentSection,
  // Text
  Content,
  // Section heading / Media and content / Media: the Section-nestable run
  ...segmentSectionBlocks,
  // Statements
  FeatureStatementGrid,
  // Interactive
  FeatureTabs,
  AudienceTabs,
  Carousel,
  // Lists & grids
  Archive,
  FeaturedWork,
  // Forms & CTAs
  CallToAction,
  FormBlock,
]
