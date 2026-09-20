import { lexicalToMarkdownString } from './lexicalToMarkdown'

/**
 * Words of prose a reader gets through per minute. The usual 200–250 band;
 * the low end because this site's pieces carry diagrams and figures the
 * reader stops on.
 */
export const READING_WORDS_PER_MINUTE = 200

/**
 * Lines of a code listing per minute. A listing is read line by line rather
 * than skimmed, so charging its tokens at prose speed both understates a
 * dense line and overstates a long one; roughly three seconds a line is the
 * pace of actually following the code.
 */
export const READING_CODE_LINES_PER_MINUTE = 20

/**
 * What a piece of content costs a reader, kept as prose and code separately
 * because the two are read at different speeds. Costs are summed across every
 * body a page renders and turned into minutes once, at the end.
 */
export type ReadingCost = { codeLines: number; words: number }

export const NO_READING_COST: ReadingCost = { codeLines: 0, words: 0 }

export const addReadingCost = (a: ReadingCost, b: ReadingCost): ReadingCost => ({
  codeLines: a.codeLines + b.codeLines,
  words: a.words + b.words,
})

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

const proseWords = (lines: readonly string[]): number =>
  lines
    .map((line) => line.replace(LINE_MARKERS, ''))
    .join(' ')
    .replace(LINK, '$1')
    .replace(INLINE_MARKERS, '')
    .split(/\s+/)
    .filter((token) => IS_WORD.test(token)).length

const countCodeLines = (code: string): number =>
  code.split('\n').filter((line) => line.trim()).length

/**
 * Reading cost of a markdown string, with fenced listings taken out of the
 * prose and charged by the line. Splitting on the fence lines rather than by
 * regex keeps an unterminated fence from swallowing the rest of the document.
 */
export const markdownReadingCost = (markdown: string): ReadingCost => {
  const prose: string[] = []
  let codeLines = 0
  let inFence = false

  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) {
      if (line.trim()) codeLines += 1
      continue
    }
    prose.push(line)
  }

  return { codeLines, words: proseWords(prose) }
}

/** Reading cost of a code listing held in its own field (a composition Code block). */
export const codeReadingCost = (code: string): ReadingCost => ({
  codeLines: countCodeLines(code),
  words: 0,
})

/**
 * Reading cost of a Lexical body. The markdown serialization is walked rather
 * than the tree a second time: that walker is already the site's one Lexical
 * reader (and the only one safe in a Next server bundle; see
 * `lexicalToMarkdown`), and it fences inline code blocks, which is how a
 * listing inside a body reaches `markdownReadingCost` as code.
 */
export const readingCost = (data: unknown): ReadingCost =>
  markdownReadingCost(lexicalToMarkdownString(data))

/**
 * Minutes for a reading cost, floored at 1 so a short piece never advertises
 * "0 min". Rounded once, at the end: rounding each body of a page on its own
 * would inflate a twenty-block piece by minutes.
 */
export const readingMinutes = ({ codeLines, words }: ReadingCost): number =>
  Math.max(
    1,
    Math.round(words / READING_WORDS_PER_MINUTE + codeLines / READING_CODE_LINES_PER_MINUTE),
  )

/** Estimated minutes to read a single Lexical body. */
export const readingTimeMinutes = (data: unknown): number => readingMinutes(readingCost(data))
