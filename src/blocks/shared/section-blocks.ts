import type { Block } from 'payload'

import { Carousel } from '@/blocks/Carousel/config'
import { Code } from '@/blocks/Code/config'
import { CtaBand } from '@/blocks/cta-band/config'
import { Faq } from '@/blocks/faq/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { BespokeFigure } from '@/blocks/figures/bespoke/config'
import { Chart } from '@/blocks/figures/chart/config'
import { Diagram } from '@/blocks/figures/diagram/config'
import { FullMedia } from '@/blocks/full-media/config'
import { ImagePair } from '@/blocks/image-pair/config'
import { InsightList } from '@/blocks/insight-list/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { MediaContentSplit } from '@/blocks/media-content-split/config'
import { PosterList } from '@/blocks/poster-list/config'
import { QuoteBanner } from '@/blocks/quote-banner/config'
import { RichTextBlock } from '@/blocks/rich-text/config'
import { RichTransition } from '@/blocks/rich-transition/config'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { SplitImageOffset } from '@/blocks/split-image-offset/config'
import { YouTube } from '@/blocks/youtube/config'

/**
 * The figure blocks (docs/figures.md), named so the surfaces that build their
 * run by hand (Work Pages) or hold blocks back (Home) take the same three.
 */
export const figureBlocks: Block[] = [Chart, Diagram, BespokeFigure]

/**
 * The reorganized Section-nestable run (docs/blocks-reorg-roadmap.md), stated
 * once so every composition surface offers the same blocks under the same
 * group labels. Each collection nests this run inside its own Section
 * instance; only Home, which has no Section yet, offers it at the top level.
 *
 * Ordered by `admin.group`: the blocks drawer renders groups in
 * first-appearance order.
 *
 * Lab Pages map this run into story-aware variants (`labBlock` in
 * `blocks/lab/config.ts`). Work Pages map it through `workVariants` in
 * `blocks/case-study/config.ts`, which swaps in their own story-resolving
 * Standard heading (`caseStudyTransition`).
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
  YouTube,
  // Text
  RichTextBlock,
  Code,
  // Figures
  ...figureBlocks,
  // Interactive
  Faq,
  Carousel,
  FeatureTabs,
  // Lists
  InsightList,
  PosterList,
  // Statements: after Lists and before Forms & CTAs, the order the drawer
  // already had on every surface (blocks-reorg-roadmap.md).
  QuoteBanner,
  // Forms & CTAs
  CtaBand,
]
