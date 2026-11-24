import type React from 'react'
import { BespokeFigureBlock } from '@/blocks/figures/bespoke-figure/Component'
import { ChartBlock } from '@/blocks/figures/chart/Component'
import { DiagramBlock } from '@/blocks/figures/diagram/Component'
import { CtaBandBlock } from '@/blocks/forms-and-ctas/cta-band/Component'
import { CarouselBlock } from '@/blocks/interactive/carousel/Component'
import { FaqBlock } from '@/blocks/interactive/faq/Component'
import { TabsBlock } from '@/blocks/interactive/tabs/Component'
import { InsightListBlock } from '@/blocks/lists/insight-list/Component'
import { PosterListBlock } from '@/blocks/lists/poster-list/Component'
import { CaptionBlock } from '@/blocks/media/caption/Component'
import { StatementBlock } from '@/blocks/media/statement/Component'
import { YouTubeBlock } from '@/blocks/media/youtube/Component'
import { PairBlock } from '@/blocks/media-and-content/pair/Component'
import { PairOffsetBlock } from '@/blocks/media-and-content/pair-offset/Component'
import { SplitBlock } from '@/blocks/media-and-content/split/Component'
import { SplitNarrowBlock } from '@/blocks/media-and-content/split-narrow/Component'
import { StackedBlock } from '@/blocks/media-and-content/stacked/Component'
import { OffsetBlock } from '@/blocks/section-heading/offset/Component'
import { StandardBlock } from '@/blocks/section-heading/standard/Component'
import { blockRevealVariants, type RevealMappedBlockSlug } from '@/blocks/shared/reveal-variants'
import { QuoteBannerBlock } from '@/blocks/statements/quote-banner/Component'
import { CodeBlock } from '@/blocks/text/code/Component'
import { RichTextBlock } from '@/blocks/text/rich-text/Component'
import { RevealSection } from '@/shared/ui/reveal-section'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'

/**
 * Components for everything a Section can nest, keyed by block slug: the
 * render mirror of `sectionNestableBlocks` in `surfaces/run.ts`. Every collection
 * that offers the run renders it through this map (Pages, Posts, segment
 * pages, lab pages), so the same CMS block paints and moves identically
 * wherever an editor places it. Lab pages resolve canonical story copy into
 * the block first (`story-copy.ts`); Work pages resolve it the same way and
 * render their own variants (`RenderWorkBlocks`).
 */
export const sectionChildComponents = {
  bespokeFigure: BespokeFigureBlock,
  carousel: CarouselBlock,
  chart: ChartBlock,
  code: CodeBlock,
  ctaBand: CtaBandBlock,
  diagram: DiagramBlock,
  faq: FaqBlock,
  featureHeadingOffset: OffsetBlock,
  featureImageStatement: StatementBlock,
  featureTabs: TabsBlock,
  fullMedia: StackedBlock,
  imagePair: PairBlock,
  insightList: InsightListBlock,
  mediaBlock: CaptionBlock,
  mediaContentSplit: SplitBlock,
  posterList: PosterListBlock,
  quoteBanner: QuoteBannerBlock,
  richText: RichTextBlock,
  richTransition: StandardBlock,
  splitContentNarrow: SplitNarrowBlock,
  splitImageOffset: PairOffsetBlock,
  youtube: YouTubeBlock,
}

/**
 * A slug-keyed component map. Each component takes its own block's props, so
 * the map is only ever indexed by slug and spread into, never called with a
 * statically known prop type.
 */
export type ContentBlockComponents = Record<string, React.ComponentType<never>>

/** GSAP variant for marker-carrying blocks (`'self'` = block owns its shell). */
const gsapReveal = (blockType: string) =>
  blockType in blockRevealVariants
    ? blockRevealVariants[blockType as RevealMappedBlockSlug]
    : undefined

/**
 * One flat content block with its entrance. `bare` is set for blocks nested
 * inside a Section block: the block skips its own band (the Section painted
 * it) but keeps the same reveal wrapper it has at the top level, so a block
 * moves identically inside and outside a Section.
 */
export const renderContentBlock = (
  block: { blockType?: string | null },
  key: React.Key,
  bare: boolean,
  components: ContentBlockComponents,
) => {
  const { blockType } = block

  if (!blockType) return null
  const Block = components[blockType]
  if (!Block) return null

  const reveal = gsapReveal(blockType)

  // Blocks with their own GSAP shell — never add a second entrance.
  if (reveal === 'self') {
    return (
      // @ts-expect-error there may be some mismatch between the expected types here
      <Block key={key} {...block} disableInnerContainer />
    )
  }

  // Blocks carrying `data-reveal` markers play the shared GSAP
  // reveal here too, so the same CMS block moves identically on
  // Pages/Home and work pages. Spacing is the block's own band —
  // the wrapper never adds margin.
  if (reveal) {
    return (
      <ScrollReveal as="div" key={key} variant={reveal}>
        {/* @ts-expect-error there may be some mismatch between the expected types here */}
        <Block {...block} bare={bare || undefined} disableInnerContainer />
      </ScrollReveal>
    )
  }

  return (
    <RevealSection key={key}>
      {/* @ts-expect-error there may be some mismatch between the expected types here */}
      <Block {...block} bare={bare || undefined} disableInnerContainer />
    </RevealSection>
  )
}
