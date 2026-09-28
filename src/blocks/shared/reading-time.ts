import type { StoryRecord } from '@/collections/story/narrative'
import {
  CONTENT_SKIP_KEYS,
  CONTENT_TEXT_KEYS,
  NON_RENDERED_TEXT_KEYS,
  normalizeKey,
} from '@/shared/content/content-keys'
import { lexicalWords, markdownWords, readingMinutes } from '@/shared/content/reading-time'
import {
  isStoryCopyBlock,
  resolveStoryBlockCopy,
  resolveStorySectionCopy,
  type StoryCopyBlock,
} from './story-copy'

/**
 * Minutes to read a composed page: every word the page puts on screen, and
 * nothing else.
 *
 * A story surface (a Lab Page, a Work Page) stores almost none of its prose on
 * the page. The page holds an arrangement of blocks, each pointing at a slice
 * of the canonical record — a section, one Story Beat, or copy written on the
 * block itself — and the same resolver the renderer uses decides which. So the
 * count runs over the *resolved* blocks: a beat rendered twice is read twice, a
 * section the arrangement never reaches is not read at all, and copy written on
 * a block is read where it sits. Counting the record's sections instead answers
 * a different question than the one the figure asks.
 *
 * What the walk drops, because a reader never spends time on it: a figure's
 * text alternative, a chart or diagram spec, media, link destinations
 * (`CONTENT_SKIP_KEYS`, `NON_RENDERED_TEXT_KEYS`), and code listings, which
 * are figures the reader studies or skips.
 */

/**
 * How long an article-length page should take to read, in the minutes the
 * hero shows. The ceiling is the rule: a longer piece moves detail out of the
 * prose and into figures, or leaves it out. `pnpm lab:journal:verify` holds a
 * Lab Page draft to it.
 */
export const ARTICLE_READING_BUDGET = { maxMinutes: 10, minMinutes: 5 } as const

/** A stored block. Structural, because the union of every block type is not knowable here. */
type LooseBlock = { blockType: string } & Record<string, unknown>

const isBlock = (value: object): value is LooseBlock =>
  typeof (value as { blockType?: unknown }).blockType === 'string'

const isLexicalState = (value: object): boolean =>
  'root' in value && typeof (value as { root?: unknown }).root === 'object'

/** The legacy Narrative block on each story surface: its own copy precedence. */
const STORY_SECTION_BLOCKS: ReadonlySet<string> = new Set([
  'caseStudyStorySection',
  'labStorySection',
])

/**
 * A block's copy filled in exactly as the renderer fills it, so the count sees
 * the resolved body rather than the null an editor left behind. Both resolvers
 * are typed against the generated block unions, which a structural walk cannot
 * name; the guards above are the same ones the renderers branch on.
 */
const resolveCopy = (block: LooseBlock, record: StoryRecord): object => {
  if (STORY_SECTION_BLOCKS.has(block.blockType)) {
    const { content, heading } = resolveStorySectionCopy(
      block as Parameters<typeof resolveStorySectionCopy>[0],
      record,
    )
    // Back under the key a body is counted by: the layout prints it as copy.
    return { body: content, heading }
  }
  if (!isStoryCopyBlock(block)) return block
  // A Story beats block resolves to its body and to the same copy again as
  // `passages` (the run with its beat headings); the body is the count.
  const { passages: _passages, ...resolved } = resolveStoryBlockCopy(
    block as unknown as StoryCopyBlock,
    record,
  ) as { passages?: unknown }
  return resolved
}

const walkEntries = (value: object, record: StoryRecord): number =>
  Object.entries(value).reduce((words, [key, child]) => words + walk(child, key, record), 0)

function walk(value: unknown, key: string, record: StoryRecord): number {
  if (value === null || value === undefined) return 0

  const normalized = normalizeKey(key)
  if (CONTENT_SKIP_KEYS.has(normalized) || normalized.startsWith('internal')) return 0

  if (typeof value === 'string') {
    const text = value.trim()
    if (!text || !CONTENT_TEXT_KEYS.has(normalized) || NON_RENDERED_TEXT_KEYS.has(normalized)) {
      return 0
    }
    return markdownWords(text)
  }

  if (Array.isArray(value)) {
    return value.reduce((words: number, item) => words + walk(item, key, record), 0)
  }

  if (typeof value !== 'object') return 0
  if (isLexicalState(value)) return lexicalWords(value)
  if (!isBlock(value)) return walkEntries(value, record)
  // A code listing is a figure, and a figure's body is not read as prose.
  if (value.blockType === 'code') return 0

  return walkEntries(resolveCopy(value, record), record)
}

/**
 * Words of prose on the parts of a page a visitor scrolls through (its intro,
 * its layout), with every block's copy resolved against the canonical record
 * the page presents. A surface with no story record passes an empty object.
 */
export const composedWords = (parts: readonly unknown[], record: StoryRecord): number =>
  walk(parts, '', record)

/** Minutes to read those parts: what the page's hero shows. */
export const composedReadingMinutes = (parts: readonly unknown[], record: StoryRecord): number =>
  readingMinutes(composedWords(parts, record))
