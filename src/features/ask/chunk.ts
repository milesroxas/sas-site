/**
 * Heading-aware markdown chunker for the embedding index.
 *
 * Documents are split on h1–h3 boundaries first (topics stay separate), then
 * oversized sections are split on paragraph boundaries. Tiny sections merge
 * into the following one so fragments like a lone heading don't become their
 * own (noisy) vector. Each chunk keeps the heading trail it sits under —
 * stored alongside the embedding and fed to the model as source context.
 *
 * Sizes are in characters: ~4 chars/token puts TARGET_CHARS near the ~500
 * token chunks the RAG roadmap calls for.
 */

export type MarkdownChunk = {
  index: number
  headingPath: string[]
  text: string
}

const TARGET_CHARS = 2_000
const MAX_CHARS = 3_000
const MIN_CHARS = 200

type Section = { headingPath: string[]; lines: string[] }

const HEADING_RE = /^(#{1,3})\s+(.*)$/

function splitIntoSections(markdown: string): Section[] {
  const sections: Section[] = []
  const headingStack: string[] = []
  let current: Section = { headingPath: [], lines: [] }
  let inCodeFence = false

  for (const line of markdown.split('\n')) {
    if (/^```/.test(line.trim())) inCodeFence = !inCodeFence

    const match = inCodeFence ? null : line.match(HEADING_RE)
    if (!match) {
      current.lines.push(line)
      continue
    }

    const level = match[1].length
    const heading = match[2].trim()
    headingStack.length = level - 1
    headingStack[level - 1] = heading

    if (current.lines.some((l) => l.trim())) sections.push(current)
    current = { headingPath: headingStack.filter(Boolean), lines: [line] }
  }

  if (current.lines.some((l) => l.trim())) sections.push(current)
  return sections
}

/** Split one oversized section body on paragraph boundaries. */
function splitByParagraphs(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/)
  const pieces: string[] = []
  let buffer = ''

  for (const paragraph of paragraphs) {
    const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph
    if (candidate.length > TARGET_CHARS && buffer) {
      pieces.push(buffer)
      buffer = paragraph
    } else {
      buffer = candidate
    }
  }
  if (buffer.trim()) pieces.push(buffer)

  // A single paragraph longer than MAX_CHARS (unlikely outside pasted logs):
  // hard-split so no chunk blows the embedding input budget.
  return pieces.flatMap((piece) => {
    if (piece.length <= MAX_CHARS) return [piece]
    const hard: string[] = []
    for (let i = 0; i < piece.length; i += TARGET_CHARS) {
      hard.push(piece.slice(i, i + TARGET_CHARS))
    }
    return hard
  })
}

export function chunkMarkdown(markdown: string): MarkdownChunk[] {
  const sections = splitIntoSections(markdown)

  // Merge tiny sections forward so a lone heading or one-liner rides with the
  // content that follows it.
  const merged: Section[] = []
  for (const section of sections) {
    const previous = merged.at(-1)
    const text = section.lines.join('\n')
    const previousText = previous?.lines.join('\n') ?? ''
    if (
      previous &&
      (previousText.length < MIN_CHARS || text.length < MIN_CHARS) &&
      previousText.length + text.length <= MAX_CHARS
    ) {
      previous.lines.push(...section.lines)
    } else {
      merged.push({ headingPath: [...section.headingPath], lines: [...section.lines] })
    }
  }

  const chunks: MarkdownChunk[] = []
  for (const section of merged) {
    const text = section.lines.join('\n').trim()
    if (!text) continue

    const pieces = text.length > MAX_CHARS ? splitByParagraphs(text) : [text]
    for (const piece of pieces) {
      const trimmed = piece.trim()
      if (!trimmed) continue
      chunks.push({ index: chunks.length, headingPath: section.headingPath, text: trimmed })
    }
  }

  return chunks
}
