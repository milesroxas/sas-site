import { lexicalToMarkdownString } from './lexicalToMarkdown'

/**
 * Words a reader gets through per minute. The usual 200–250 band for prose;
 * the low end because this site's posts carry diagrams and code the reader
 * stops on.
 */
export const READING_WORDS_PER_MINUTE = 200

/**
 * Estimated minutes to read a Lexical body, floored at 1 so a short post
 * never advertises "0 min".
 *
 * Counts the markdown serialization rather than walking the tree a second
 * time — that walker is already the site's one Lexical reader (and the only
 * one safe in a Next server bundle; see `lexicalToMarkdown`). Syntax markers
 * it emits are punctuation glued to their word, so they never split one word
 * into two.
 */
export const readingTimeMinutes = (data: unknown): number => {
  const words = lexicalToMarkdownString(data).trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / READING_WORDS_PER_MINUTE))
}
