import type { Block } from 'payload'
import { Carousel } from '@/blocks/interactive/carousel/config'
import { Tabs } from '@/blocks/interactive/tabs/config'
import { FeaturedWork } from '@/blocks/lists/featured-work/config'
import { Caption } from '@/blocks/media/caption/config'
import { MediaShowcase } from '@/blocks/media/media-showcase/config'
import { Statement } from '@/blocks/media/statement/config'
import { Pair } from '@/blocks/media-and-content/pair/config'
import { PairOffset } from '@/blocks/media-and-content/pair-offset/config'
import { Split } from '@/blocks/media-and-content/split/config'
import { SplitNarrow } from '@/blocks/media-and-content/split-narrow/config'
import { Stacked } from '@/blocks/media-and-content/stacked/config'
import { StorySection } from '@/blocks/narrative/story-section/config'
import { Offset } from '@/blocks/section-heading/offset/config'
import { WorkStandard } from '@/blocks/section-heading/standard/work-config'
import { sectionBlock } from '@/blocks/structure/section/config'
import { sectionNestableBlocks } from '@/blocks/surfaces/run'
import { RichText } from '@/blocks/text/rich-text/config'
import { StoryBeats } from '@/blocks/text/story-beats/config'
import { withCaseStudyScopedMedia } from '@/fields/caseStudyScopedMedia'
import { withStoryBeatSource } from '@/fields/storyBeatSource'

/**
 * Work variants of the shared blocks. Every media picker is scoped to the
 * related case study's asset libraries (`withCaseStudyScopedMedia`), and the
 * blocks that pull canonical story copy also take `withStoryBeatSource`.
 * Same slug and table as the shared block; only the interface differs, named
 * `Work` plus the shared interface (as Lab's are `Lab` plus it), so renaming a
 * shared block renames its Work variant with it.
 */
const workInterfaceName = (shared: Block): string => {
  if (!shared.interfaceName) {
    throw new Error(`Work variant of "${shared.slug}" needs a shared interfaceName.`)
  }
  return `Work${shared.interfaceName}`
}
const workStoryBlock = (block: Block) =>
  withStoryBeatSource(block, workInterfaceName(block), 'work-pages')
const workStoryMediaBlock = (block: Block) =>
  withCaseStudyScopedMedia(workStoryBlock(block), workInterfaceName(block))
const workMediaBlock = (block: Block) => withCaseStudyScopedMedia(block, workInterfaceName(block))

const WorkStorySection = workStoryMediaBlock(StorySection)
const WorkMediaShowcase = workMediaBlock(MediaShowcase)
const WorkSplitNarrow = workStoryMediaBlock(SplitNarrow)
const WorkStacked = workStoryMediaBlock(Stacked)
const WorkPair = workStoryMediaBlock(Pair)
const WorkPairOffset = workStoryMediaBlock(PairOffset)
const WorkOffset = workStoryBlock(Offset)
const WorkStatement = workStoryMediaBlock(Statement)
const WorkTabs = workStoryMediaBlock(Tabs)
const WorkStandardVariant = workStoryBlock(WorkStandard)
const WorkStoryBeats = workStoryBlock(StoryBeats)
const WorkSplit = workStoryMediaBlock(Split)
// Media-only variants: no story copy, so only the picker scope changes.
const WorkCaption = workMediaBlock(Caption)
const WorkCarousel = workMediaBlock(Carousel)

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
  richTransition: WorkStandardVariant,
  featureHeadingOffset: WorkOffset,
  fullMedia: WorkStacked,
  mediaContentSplit: WorkSplit,
  splitContentNarrow: WorkSplitNarrow,
  imagePair: WorkPair,
  splitImageOffset: WorkPairOffset,
  featureImageStatement: WorkStatement,
  // Caption and Carousel carry no story copy: picker scope only.
  mediaBlock: WorkCaption,
  carousel: WorkCarousel,
  // Tabs pull story copy per tab, so they keep both.
  featureTabs: WorkTabs,
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
  return block.slug === RichText.slug ? [variant, WorkStoryBeats] : [variant]
})

export const WorkSection = sectionBlock({
  blocks: workSectionBlocks,
  interfaceName: 'WorkSectionBlock',
})

/**
 * Work Pages: Sections plus the three shells. The run is also listed at the
 * top level until adacore, vault and eclinical move into Sections
 * (docs/blocks-reorg-roadmap.md section 0, step 3); `LEGACY_TOP_LEVEL` names it.
 */
export const workBlocks = [
  // Structure
  WorkSection,
  // The run, legacy at the top level (hidden from the drawer)
  ...workSectionBlocks,
  // Shells
  WorkMediaShowcase,
  WorkStorySection,
  FeaturedWork,
]
