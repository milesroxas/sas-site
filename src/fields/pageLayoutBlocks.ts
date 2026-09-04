import type { Block } from 'payload'

import { Archive } from '@/blocks/ArchiveBlock/config'
import { AudienceTabs } from '@/blocks/AudienceTabs/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { DynamicAudience } from '@/blocks/DynamicAudience/config'
import { FormBlock } from '@/blocks/Form/config'
import { FeatureStatementGrid } from '@/blocks/feature/StatementGrid/config'
import { FeatureStatementLinks } from '@/blocks/feature/StatementLinks/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { FeaturedWork } from '@/blocks/featured-work/config'
import { IndustryWork } from '@/blocks/IndustryWork/config'
import { ImagePair } from '@/blocks/image-pair/config'
import { NewsletterSignup } from '@/blocks/NewsletterSignup/config'
import { RichTransition } from '@/blocks/rich-transition/config'
import { sectionBlock } from '@/blocks/section/config'
import { sectionChildBlocks, sectionNestableBlocks } from '@/blocks/shared/section-blocks'
import { SplitImageOffset } from '@/blocks/split-image-offset/config'
import { TestimonialsMarquee } from '@/blocks/TestimonialsMarquee/config'

export const PageSection = sectionBlock({
  blocks: sectionChildBlocks,
  interfaceName: 'PageSectionBlock',
})

/**
 * Layout blocks offered by Pages.
 * Ordered by `admin.group`: the blocks drawer renders groups in
 * first-appearance order, and the reorganized groups lead
 * (docs/blocks-reorg-roadmap.md) ahead of the legacy ones.
 */
export const pageLayoutBlocks: Block[] = [
  // Structure
  PageSection,
  // Section heading / Media and content / Media / Text / Interactive / Lists: the Section-nestable run
  ...sectionNestableBlocks,
  // Interactive (legacy, top-level only): kept beside the run's FAQ and Carousel
  FeatureTabs,
  DynamicAudience,
  AudienceTabs,
  IndustryWork,
  TestimonialsMarquee,
  // Statements
  FeatureStatementGrid,
  FeatureStatementLinks,
  // Lists (legacy, top-level only)
  Archive,
  FeaturedWork,
  // Forms & CTAs
  CallToAction,
  FormBlock,
  NewsletterSignup,
  // Custom
  Content,
]

/**
 * Posts compose optional full-width sections after the article body, so they
 * get the same Section-nestable run as Pages plus the curated work list. The
 * article itself stays in the Content tab.
 */
export const postLayoutBlocks: Block[] = [
  // Structure
  PageSection,
  // Section heading / Media and content / Media / Text / Interactive / Lists: the Section-nestable run
  ...sectionNestableBlocks,
  // Lists (legacy, top-level only)
  FeaturedWork,
]

/**
 * Home composition: everything Pages offers except the curated work list (the
 * homepage tells that story through its own hero and industry blocks) and the
 * Section wrapper, which Home does not adopt yet (docs/blocks-reorg-roadmap.md).
 * The two pair blocks and the Standard heading are held back with it: they
 * are case-study grammar that Home has never offered, and adding them here
 * would grow the global's schema for no editorial need.
 */
const homeExcludedBlocks = new Set<Block>([
  FeaturedWork,
  PageSection,
  ImagePair,
  SplitImageOffset,
  RichTransition,
])

export const homeLayoutBlocks: Block[] = pageLayoutBlocks.filter(
  (block) => !homeExcludedBlocks.has(block),
)

export const SegmentSection = sectionBlock({
  blocks: sectionChildBlocks,
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
  // Section heading / Media and content / Media / Text / Interactive / Lists: the Section-nestable run
  ...sectionNestableBlocks,
  // Interactive (legacy, top-level only): kept beside the run's FAQ and Carousel
  FeatureTabs,
  AudienceTabs,
  // Statements
  FeatureStatementGrid,
  // Lists (legacy, top-level only)
  Archive,
  FeaturedWork,
  // Forms & CTAs
  CallToAction,
  FormBlock,
  // Custom
  Content,
]
