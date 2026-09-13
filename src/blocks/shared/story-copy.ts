import {
  resolveStoryBeatHeading,
  resolveStoryBody,
  resolveStoryHeading,
  type StoryBody,
  type StoryRecord,
  type StoryScope,
  type StorySource,
} from '@/collections/story/narrative'
import { hasRichTextContent } from '@/utilities/hasRichTextContent'

/**
 * How a story-capable block's copy resolves against the canonical story
 * record its page presents (a Case Study on Work Pages, a Lab Project on Lab
 * Pages). Both renderers read copy through here, so the precedence rules
 * below exist once:
 *
 * - **Written copy wins.** An empty editor (a touched-then-cleared field saves
 *   an empty paragraph) is not written copy, so it never shadows the story.
 * - **Headings** fall back to the selected Story Beat's heading, and for
 *   heading-led blocks (Standard, Heading offset, Statement grid, Tabs, Story
 *   section) then to the canonical section's name. Media blocks let the beat
 *   speak for itself and never print a bare section name.
 * - **`custom`** resolves no story. Media blocks keep their own body verbatim
 *   under `custom`, exactly as they render on surfaces with no story record.
 */

/** The story picker a block row carries (`withStoryBeatSource`). */
type StoryRef = {
  source?: StorySource | null
  storyBeatKey?: string | null
  storyScope?: StoryScope | null
}

type HeadedCopy = StoryRef & { body?: StoryBody | null; heading?: string | null }

const HEADED_BLOCK_TYPES = [
  'caseStudyTransition',
  'featureHeadingOffset',
  'richTransition',
] as const
const MEDIA_BLOCK_TYPES = [
  'fullMedia',
  'imagePair',
  'mediaContentSplit',
  'splitContentNarrow',
  'splitImageOffset',
] as const

export type StoryCopyBlock =
  | (HeadedCopy & { blockType: (typeof HEADED_BLOCK_TYPES)[number] })
  | (HeadedCopy & { blockType: (typeof MEDIA_BLOCK_TYPES)[number] })
  | (StoryRef & {
      blockType: 'featureStatementGrid'
      heading?: string | null
      statement?: StoryBody | null
    })
  | (StoryRef & { blockType: 'featureImageStatement'; caption?: StoryBody | null })
  | {
      blockType: 'featureTabs'
      tabs?: Array<StoryRef & { description?: StoryBody | null; heading?: string | null }> | null
    }

const STORY_COPY_BLOCK_TYPES: ReadonlySet<string> = new Set<StoryCopyBlock['blockType']>([
  ...HEADED_BLOCK_TYPES,
  ...MEDIA_BLOCK_TYPES,
  'featureImageStatement',
  'featureStatementGrid',
  'featureTabs',
])

/** True for a block whose copy can come from the page's story record. */
export const isStoryCopyBlock = <B extends { blockType?: string | null }>(
  block: B,
): block is Extract<B, { blockType: StoryCopyBlock['blockType'] }> =>
  Boolean(block.blockType && STORY_COPY_BLOCK_TYPES.has(block.blockType))

const storyBody = (record: StoryRecord, ref: StoryRef, written: StoryBody | null | undefined) =>
  hasRichTextContent(written)
    ? written
    : resolveStoryBody(record, ref.source, ref.storyBeatKey, ref.storyScope)

const storyHeading = (record: StoryRecord, ref: StoryRef, written: string | null | undefined) =>
  written || resolveStoryHeading(record, ref.source, ref.storyBeatKey, ref.storyScope) || ''

const resolveCopy = (block: StoryCopyBlock, record: StoryRecord): StoryCopyBlock => {
  switch (block.blockType) {
    case 'caseStudyTransition':
    case 'featureHeadingOffset':
    case 'richTransition':
      return {
        ...block,
        body: storyBody(record, block, block.body),
        heading: storyHeading(record, block, block.heading),
      }
    case 'featureStatementGrid':
      return {
        ...block,
        heading: storyHeading(record, block, block.heading),
        statement: storyBody(record, block, block.statement),
      }
    case 'featureImageStatement':
      return { ...block, caption: storyBody(record, block, block.caption) }
    case 'featureTabs':
      return {
        ...block,
        tabs: (block.tabs || []).map((tab) => ({
          ...tab,
          description: storyBody(record, tab, tab.description),
          heading: storyHeading(record, tab, tab.heading),
        })),
      }
    default:
      return {
        ...block,
        body: block.source === 'custom' ? block.body : storyBody(record, block, block.body),
        heading:
          block.heading ||
          resolveStoryBeatHeading(record, block.source, block.storyBeatKey, block.storyScope),
      }
  }
}

/**
 * A block after resolution. Heading-led blocks always come back with a heading
 * string: a canonical source may leave the editor's heading empty, but the
 * resolved block never does.
 */
export type ResolvedStoryCopy<T> = T extends {
  blockType: (typeof HEADED_BLOCK_TYPES)[number] | 'featureStatementGrid'
}
  ? T & { heading: string }
  : T extends { blockType: 'featureTabs'; tabs?: Array<infer Row> | null }
    ? T & { tabs: Array<Row & { heading: string }> }
    : T

/**
 * The block with its copy fields filled from the story record, ready for the
 * same component that renders it on any other surface. Only copy fields
 * change, each within its own type, so the cast only restores what the switch
 * cannot express generically.
 */
export const resolveStoryBlockCopy = <T extends StoryCopyBlock>(
  block: T,
  record: StoryRecord,
): ResolvedStoryCopy<T> => resolveCopy(block, record) as ResolvedStoryCopy<T>

/** The legacy Narrative "Story section" block: custom copy, an override, or the story. */
export const resolveStorySectionCopy = (
  block: StoryRef & {
    bodyOverride?: StoryBody | null
    customBody?: StoryBody | null
    headingOverride?: string | null
  },
  record: StoryRecord,
) => ({
  content:
    block.source === 'custom' ? block.customBody : storyBody(record, block, block.bodyOverride),
  heading: storyHeading(record, block, block.headingOverride),
})
