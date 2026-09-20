import { readingMinutes, readingWords } from '@/shared/content/reading-time'
import { STORY_SECTION_DEFINITIONS, type StoryRecord } from './sections'

/**
 * Minutes to read a Content Hub record's whole story: every section body,
 * counted as one piece and rounded once. Rounding each section on its own
 * would inflate a six-part story by up to three minutes.
 *
 * This is the canonical narrative, which is what a hero's "read" figure
 * promises. A website page composes from the same record, so the two never
 * disagree about how long the piece runs.
 */
export const storyReadingMinutes = (record: StoryRecord | null | undefined): number =>
  readingMinutes(
    STORY_SECTION_DEFINITIONS.reduce(
      (words, { field }) => words + readingWords(record?.[field]?.body),
      0,
    ),
  )
