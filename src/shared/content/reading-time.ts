import { lexicalToMarkdownString } from './lexicalToMarkdown'

/**
 * Words a reader gets through per minute. The usual 200–250 band for prose;
 * the low end because this site's posts carry diagrams and code the reader
 * stops on.
 */
export const READING_WORDS_PER_MINUTE = 200

/**
 * Words in a Lexical body.
 *
 * Counts the markdown serialization rather than walking the tree a second
 * time. That walker is already the site's one Lexical reader (and the only
 * one safe in a Next server bundle; see `lexicalToMarkdown`). Syntax markers
 * it emits are punctuation glued to their word, so they never split one word
 * into two.
 */
export const readingWords = (data: unknown): number =>
  lexicalToMarkdownString(data).trim().split(/\s+/).filter(Boolean).length

/**
 * Minutes for a word count, floored at 1 so a short piece never advertises
 * "0 min". Separate from `readingWords` so a body split across several fields
 * (a record's story sections) is counted whole and rounded once.
 */
export const readingMinutes = (words: number): number =>
  Math.max(1, Math.round(words / READING_WORDS_PER_MINUTE))

/** Estimated minutes to read a single Lexical body. */
export const readingTimeMinutes = (data: unknown): number => readingMinutes(readingWords(data))
