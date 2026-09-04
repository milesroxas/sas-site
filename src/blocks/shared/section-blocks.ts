import type { Block } from 'payload'

import { Carousel } from '@/blocks/Carousel/config'
import { Content } from '@/blocks/Content/config'
import { Faq } from '@/blocks/faq/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { FullMedia } from '@/blocks/full-media/config'
import { ImagePair } from '@/blocks/image-pair/config'
import { InsightList } from '@/blocks/insight-list/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { MediaContentSplit } from '@/blocks/media-content-split/config'
import { RichTextBlock } from '@/blocks/rich-text/config'
import { RichTransition } from '@/blocks/rich-transition/config'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { SplitImageOffset } from '@/blocks/split-image-offset/config'

/**
 * The reorganized Section-nestable run (docs/blocks-reorg-roadmap.md), stated
 * once so every composition surface offers the same blocks under the same
 * group labels. Each collection nests this run inside its own Section
 * instance and spreads it into its top-level drawer list while the Section
 * transition is underway.
 *
 * Ordered by `admin.group`: the blocks drawer renders groups in
 * first-appearance order.
 *
 * Work Pages swap the Standard heading for their own story-resolving variant
 * (`caseStudyTransition`), so they build their run by hand instead of
 * spreading this one.
 */
export const sectionNestableBlocks: Block[] = [
  // Section heading
  RichTransition,
  FeatureHeadingOffset,
  // Media and content
  FullMedia,
  MediaContentSplit,
  SplitContentNarrow,
  ImagePair,
  SplitImageOffset,
  // Media
  FeatureImageStatement,
  MediaBlock,
  // Text
  RichTextBlock,
  // Interactive
  Faq,
  Carousel,
  FeatureTabs,
  // Lists
  InsightList,
]

/**
 * Everything a Section can nest: the run plus the legacy multi-column
 * `content` block (Custom group). Content stays out of the run itself because
 * the run is spread into every top-level drawer list, and Custom must close
 * that list rather than land mid-order; Sections built by hand (Work Pages)
 * append Content the same way.
 */
export const sectionChildBlocks: Block[] = [
  ...sectionNestableBlocks,
  // Custom
  Content,
]
