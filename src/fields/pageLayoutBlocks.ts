import type { Block } from 'payload'

import { Archive } from '@/blocks/ArchiveBlock/config'
import { AudienceTabs } from '@/blocks/AudienceTabs/config'
import { Code } from '@/blocks/Code/config'
import { IndustryWork } from '@/blocks/IndustryWork/config'
import { ImagePair } from '@/blocks/image-pair/config'
import { RichTransition } from '@/blocks/rich-transition/config'
import { sectionBlock } from '@/blocks/section/config'
import { figureBlocks, sectionNestableBlocks } from '@/blocks/shared/section-blocks'
import { SplitImageOffset } from '@/blocks/split-image-offset/config'
import { TestimonialsMarquee } from '@/blocks/TestimonialsMarquee/config'

/**
 * Each surface's top-level list is Section plus its shell blocks
 * (`SHELL_BLOCKS`, `src/blocks/shared/top-level-blocks.ts`), checked by
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
const homeExcludedBlocks = new Set<Block>([
  ImagePair,
  SplitImageOffset,
  RichTransition,
  Code,
  ...figureBlocks,
])

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
