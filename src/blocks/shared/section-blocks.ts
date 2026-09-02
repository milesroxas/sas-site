import type { Block } from 'payload'

import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FullMedia } from '@/blocks/full-media/config'
import { ImagePair } from '@/blocks/image-pair/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { MediaContentSplit } from '@/blocks/media-content-split/config'
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
 * Collection-specific section headings (the work and lab Standard
 * transitions, which resolve canonical story copy) are prepended by the
 * collection that owns them, never here.
 */
export const sectionNestableBlocks: Block[] = [
  // Section heading
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
]
