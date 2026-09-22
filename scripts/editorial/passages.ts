/**
 * The copy in a CMS document, as the passages a reader meets: one per
 * paragraph or heading of a rich text field, one per plain text field. Each
 * carries the data path Payload reports on, so a finding says where to fix it.
 *
 * What is skipped is what is not copy: ids, keys, slugs, urls, a `code`
 * block's body, a figure's `spec`. The same list the save-time gate uses
 * (`src/plugins/house-style`), kept here in the shape a script needs.
 */

export type PassageKind = 'heading' | 'paragraph' | 'label'

export type Passage = {
  /** The data path, `context.storyBeats.0.body` or `layout.2.blocks.0.caption`. */
  path: string
  kind: PassageKind
  text: string
}

const SKIPPED_KEYS: ReadonlySet<string> = new Set([
  'id',
  '_status',
  'blockType',
  'blockName',
  'type',
  'mode',
  'format',
  'direction',
  'style',
  'tag',
  'listType',
  'key',
  'slug',
  'url',
  'href',
  'src',
  'filename',
  'mimeType',
  'language',
  'figure',
  'spec',
  'geometry',
  'props',
  'code',
  'markdown',
  'email',
  'password',
  'apiKey',
  'internalNotes',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'storyBeatKey',
  'source',
  'storyScope',
  'layout',
  'headingLevel',
  'variant',
  'theme',
  'spacing',
  'width',
])

/** Skipped whatever they hold: a figure's spec and layout, a bespoke figure's props. */
const NEVER_COPY: ReadonlySet<string> = new Set(['spec', 'geometry', 'props'])

/** Plain text fields whose value is a heading, not a passage. */
const HEADING_KEYS: ReadonlySet<string> = new Set(['title', 'heading', 'eyebrow', 'headline'])

/** Below this many characters a plain text field is a label: linted, never judged. */
const LABEL_CHARS = 40

type Lexical = { type?: string; text?: unknown; children?: unknown; tag?: string }

const textOf = (node: Lexical): string =>
  typeof node.text === 'string'
    ? node.text
    : Array.isArray(node.children)
      ? node.children.map((child) => textOf(child as Lexical)).join('')
      : ''

const TEXT_BLOCKS = new Set(['paragraph', 'heading', 'quote', 'listitem'])

/** The paragraphs and headings of a Lexical tree, in order. */
function lexicalPassages(node: Lexical, path: string, found: Passage[]): void {
  const { type, children } = node
  if (type && TEXT_BLOCKS.has(type)) {
    const text = textOf(node).trim()
    if (text) found.push({ path, kind: type === 'heading' ? 'heading' : 'paragraph', text })
    return
  }
  if (Array.isArray(children))
    for (const child of children) lexicalPassages(child as Lexical, path, found)
}

const isLexical = (value: unknown): value is { root: Lexical } =>
  Boolean(value) &&
  typeof value === 'object' &&
  'root' in (value as object) &&
  typeof (value as { root: unknown }).root === 'object'

export function passagesOf(value: unknown, path = '', found: Passage[] = []): Passage[] {
  if (typeof value === 'string') {
    const text = value.trim()
    if (!text || !path) return found
    const key = path.split('.').pop() ?? ''
    const kind: PassageKind = HEADING_KEYS.has(key)
      ? 'heading'
      : text.length < LABEL_CHARS
        ? 'label'
        : 'paragraph'
    found.push({ path, kind, text })
    return found
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      passagesOf(item, path ? `${path}.${index}` : String(index), found)
    })
    return found
  }
  if (!value || typeof value !== 'object') return found
  if (isLexical(value)) {
    lexicalPassages(value.root, path, found)
    return found
  }
  const { blockType } = value as { blockType?: unknown }
  if (blockType === 'code') return found
  for (const [key, child] of Object.entries(value)) {
    // A skipped key is skipped as a value, never as a container: `layout` is the Prose
    // heading's `layout: 'prose'` and also the page's list of blocks.
    if (SKIPPED_KEYS.has(key) && (typeof child === 'string' || NEVER_COPY.has(key))) continue
    // A populated relationship is another document: its copy is its own to check.
    if (
      child &&
      typeof child === 'object' &&
      !Array.isArray(child) &&
      'id' in child &&
      'createdAt' in child
    )
      continue
    passagesOf(child, path ? `${path}.${key}` : key, found)
  }
  return found
}
