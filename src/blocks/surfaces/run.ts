import type { Block } from 'payload'
import { BespokeFigure } from '@/blocks/figures/bespoke-figure/config'
import { Chart } from '@/blocks/figures/chart/config'
import { Diagram } from '@/blocks/figures/diagram/config'
import { CtaBand } from '@/blocks/forms-and-ctas/cta-band/config'
import { Carousel } from '@/blocks/interactive/carousel/config'
import { Faq } from '@/blocks/interactive/faq/config'
import { Tabs } from '@/blocks/interactive/tabs/config'
import { InsightList } from '@/blocks/lists/insight-list/config'
import { PosterList } from '@/blocks/lists/poster-list/config'
import { Caption } from '@/blocks/media/caption/config'
import { Statement } from '@/blocks/media/statement/config'
import { YouTube } from '@/blocks/media/youtube/config'
import { Pair } from '@/blocks/media-and-content/pair/config'
import { PairOffset } from '@/blocks/media-and-content/pair-offset/config'
import { Split } from '@/blocks/media-and-content/split/config'
import { SplitNarrow } from '@/blocks/media-and-content/split-narrow/config'
import { Stacked } from '@/blocks/media-and-content/stacked/config'
import { Offset } from '@/blocks/section-heading/offset/config'
import { Standard } from '@/blocks/section-heading/standard/config'
import { QuoteBanner } from '@/blocks/statements/quote-banner/config'
import { Code } from '@/blocks/text/code/config'
import { RichText } from '@/blocks/text/rich-text/config'

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
 * `blocks/surfaces/lab.ts`). Work Pages map it through `workVariants` in
 * `blocks/surfaces/work.ts`, which swaps in their own story-resolving
 * Standard heading (`caseStudyTransition`).
 */
export const sectionNestableBlocks: Block[] = [
  // Section heading
  Standard,
  Offset,
  // Media and content
  Stacked,
  Split,
  SplitNarrow,
  Pair,
  PairOffset,
  // Media
  Statement,
  Caption,
  YouTube,
  // Text
  RichText,
  Code,
  // Figures
  ...figureBlocks,
  // Interactive
  Faq,
  Carousel,
  Tabs,
  // Lists
  InsightList,
  PosterList,
  // Statements: after Lists and before Forms & CTAs, the order the drawer
  // already had on every surface (blocks-reorg-roadmap.md).
  QuoteBanner,
  // Forms & CTAs
  CtaBand,
]
