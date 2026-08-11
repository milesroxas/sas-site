import type { Payload } from 'payload'
import { lexicalToMarkdownString, type SerializedLexicalState } from './lexicalToMarkdown'
import type { ContentSurface } from './surfaces'

/**
 * Extracts a surface document's reader-facing substance as markdown, for the
 * RAG corpus (embedding + keyword hydration). Two strategies, per
 * `surface.body`:
 *
 * - `richText`: one Lexical field carries the body (Posts).
 * - `walk`: substance is spread across hero groups, layout blocks, and nested
 *   arrays. A generic walker collects Lexical states plus strings under a
 *   fixed allowlist of content-bearing keys, in document order. If the surface
 *   names a canonical Content Hub record (work-pages → case-studies), it is
 *   hydrated and walked too — its narrative is what the page renders.
 *
 * The walker is deliberately allowlist-based: enum/select values ('dark',
 * 'editorial-split'), link URLs, and admin-only fields (anything starting
 * with `internal`) must never reach a public answer.
 */

/** String fields whose values are reader-facing content. Compared lowercase, with a trailing 'override' stripped. */
const TEXT_KEYS = new Set([
  'answer',
  'body',
  'caption',
  'claim',
  'decision',
  'description',
  'excerpt',
  'eyebrow',
  'footnote',
  'heading',
  'impact',
  'intro',
  'medium',
  'oneline',
  'problem',
  'question',
  'quote',
  'rationale',
  'secondline',
  'short',
  'statement',
  'subheading',
  'subtitle',
  'summary',
  'tagline',
  'text',
  'thesis',
  'title',
])

/** Keys emitted as markdown headings — natural chunk boundaries. */
const HEADING_KEYS = new Set(['title', 'heading'])

/** Subtrees that never carry body content (system, SEO, navigation, media). */
const SKIP_KEYS = new Set([
  '_status',
  'breadcrumbs',
  'createdat',
  'id',
  'blockname',
  'link',
  'links',
  'media',
  'meta',
  'parent',
  'publishedat',
  'slug',
  'sluglock',
  'updatedat',
])

const MAX_DOC_CHARS = 30_000

const normalizeKey = (key: string): string => key.toLowerCase().replace(/override$/, '')

const isLexicalState = (value: unknown): value is SerializedLexicalState =>
  typeof value === 'object' &&
  value !== null &&
  'root' in value &&
  typeof (value as SerializedLexicalState).root === 'object'

function walkValue(value: unknown, key: string, out: string[]): void {
  if (value === null || value === undefined) return

  const normalized = normalizeKey(key)
  if (SKIP_KEYS.has(normalized) || normalized.startsWith('internal')) return

  if (typeof value === 'string') {
    const text = value.trim()
    if (!text || !TEXT_KEYS.has(normalized)) return
    out.push(HEADING_KEYS.has(normalized) ? `## ${text}` : text)
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) walkValue(item, key, out)
    return
  }

  if (typeof value !== 'object') return

  if (isLexicalState(value)) {
    const markdown = lexicalToMarkdownString(value)
    if (markdown) out.push(markdown)
    return
  }

  for (const [childKey, childValue] of Object.entries(value)) {
    walkValue(childValue, childKey, out)
  }
}

type SurfaceDoc = {
  title?: string | null
  meta?: { description?: string | null } | null
}

export async function extractDocMarkdown(
  payload: Payload,
  surface: ContentSurface,
  doc: SurfaceDoc,
): Promise<string> {
  const record = doc as Record<string, unknown>
  const parts: string[] = []

  if (doc.title) parts.push(`# ${doc.title}`)
  const description = doc.meta?.description?.trim()
  if (description) parts.push(description)

  if (surface.body.kind === 'richText') {
    const markdown = lexicalToMarkdownString(record[surface.body.field])
    if (markdown) parts.push(markdown)
  } else {
    const walked: string[] = []
    const { title: _title, ...rest } = record
    walkValue(rest, '', walked)
    parts.push(...walked)

    const canonical = surface.body.canonicalField
    const relationValue = canonical ? record[canonical.name] : undefined
    if (canonical && relationValue) {
      const id =
        typeof relationValue === 'object'
          ? (relationValue as { id: number | string }).id
          : (relationValue as number | string)
      const canonicalDoc = await payload.findByID({
        collection: canonical.collection,
        id,
        depth: 0,
        draft: false,
        disableErrors: true,
      })
      if (canonicalDoc) {
        const canonicalParts: string[] = []
        walkValue(canonicalDoc, '', canonicalParts)
        parts.push(...canonicalParts)
      }
    }
  }

  return parts.join('\n\n').slice(0, MAX_DOC_CHARS)
}
