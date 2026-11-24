import type { Block } from 'payload'
import { AudienceTabs } from '@/blocks/interactive/audience-tabs/config'
import { IndustryWork } from '@/blocks/interactive/industry-work/config'
import { TestimonialsMarquee } from '@/blocks/interactive/testimonials-marquee/config'
import { Archive } from '@/blocks/lists/archive/config'
import { Pair } from '@/blocks/media-and-content/pair/config'
import { PairOffset } from '@/blocks/media-and-content/pair-offset/config'
import { Standard } from '@/blocks/section-heading/standard/config'
import { sectionBlock } from '@/blocks/structure/section/config'
import { figureBlocks, sectionNestableBlocks } from '@/blocks/surfaces/run'
import { Code } from '@/blocks/text/code/config'

/**
 * Each surface's top-level list is Section plus its shell blocks
 * (`SHELL_BLOCKS`, `src/blocks/surfaces/top-level.ts`), checked by
 * `pnpm check:blocks`. A block a page still holds at the top level from
 * before the Section model stays listed until its content moves; those are
 * named in `LEGACY_TOP_LEVEL` beside `SHELL_BLOCKS`.
 */

export const PageSection = sectionBlock({
  blocks: sectionNestableBlocks,
  interfaceName: 'PageSectionBlock',
})

/** Pages: Sections and the post Archive. */
export const pageLayoutBlocks: Block[] = [PageSection, Archive]

/** Posts compose optional Sections after the article body. */
export const postLayoutBlocks: Block[] = [PageSection]

/**
 * Home composition. Home has no Section yet (docs/blocks-reorg-roadmap.md),
 * so its top level takes the run directly, plus its three shells. The two
 * pair blocks, the Standard heading, Code and the figures are held back:
 * case-study and long-form article grammar that Home has never offered.
 */
const homeExcludedBlocks = new Set<Block>([Pair, PairOffset, Standard, Code, ...figureBlocks])

export const homeLayoutBlocks: Block[] = [
  ...sectionNestableBlocks.filter((block) => !homeExcludedBlocks.has(block)),
  // Interactive shells
  IndustryWork,
  TestimonialsMarquee,
  AudienceTabs,
]

export const SegmentSection = sectionBlock({
  blocks: sectionNestableBlocks,
  interfaceName: 'SegmentSectionBlock',
})

/** Segment pages (Audience, Expertise): Sections and the post Archive. */
export const segmentPageBlocks: Block[] = [SegmentSection, Archive]
