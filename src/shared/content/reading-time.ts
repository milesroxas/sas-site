import { lexicalToMarkdownString } from './lexicalToMarkdown'

/**
 * Words of prose a reader gets through per minute. The usual 200–250 band;
 * the low end because this site's pieces carry diagrams and figures the
 * reader stops on.
 */
export const READING_WORDS_PER_MINUTE = 200

/**
 * Line-leading furniture: list bullets and numbers, task boxes, heading
 * hashes, quote carets. They are separate tokens once the line is split on
 * whitespace, so a 20-item list would otherwise read as 20 extra words.
 */
const LINE_MARKERS = /^\s*(?:[-*+]\s+(?:\[[ xX]\]\s+)?|\d+\.\s+|#{1,6}\s+|>\s*)+/

/** A link reads as its label; the destination is never read aloud. */
const LINK = /\[([^\]]*)\]\([^)]*\)/g

/** Emphasis and code markers hug their word, so they are removed, not split on. */
const INLINE_MARKERS = /[*_~`]/g

/** A token is a word only if it carries a letter or a digit: `---` and `|` do not. */
const IS_WORD = /[\p{L}\p{N}]/u

/**
 * Words of prose in a markdown string. A fenced listing is not prose: a code
 * listing is a figure the reader studies or skips, like a diagram, so it adds
 * depth to a piece and no minutes to it. Splitting on the fence lines rather
 * than by regex keeps an unterminated fence from swallowing the rest of the
 * document.
 */
export const markdownWords = (markdown: string): number => {
  const prose: string[] = []
  let inFence = false

  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (!inFence) prose.push(line.replace(LINE_MARKERS, ''))
  }

  return prose
    .join(' ')
    .replace(LINK, '$1')
    .replace(INLINE_MARKERS, '')
    .split(/\s+/)
    .filter((token) => IS_WORD.test(token)).length
}

/**
 * Words of prose in a Lexical body. The markdown serialization is walked
 * rather than the tree a second time: that walker is already the site's one
 * Lexical reader (and the only one safe in a Next server bundle; see
 * `lexicalToMarkdown`), and it fences inline code blocks, which is how a
 * listing inside a body is left out.
 */
export const lexicalWords = (data: unknown): number => markdownWords(lexicalToMarkdownString(data))

/**
 * Minutes for a count of words, floored at 1 so a short piece never
 * advertises "0 min". Rounded once, at the end: rounding each body of a page
 * on its own would inflate a twenty-block piece by minutes.
 */
export const readingMinutes = (words: number): number =>
  Math.max(1, Math.round(words / READING_WORDS_PER_MINUTE))

/** Estimated minutes to read a single Lexical body. */
export const readingTimeMinutes = (data: unknown): number => readingMinutes(lexicalWords(data))
