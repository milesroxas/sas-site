import { CONTENT_SKIP_KEYS, CONTENT_TEXT_KEYS, normalizeKey } from '@/shared/content/content-keys'
import { lexicalToMarkdownString } from '@/shared/content/lexicalToMarkdown'

/**
 * Pure helpers over a document's stored shape for the block tools: list every
 * block with its path, find one by id, and put an edited one back. No Payload
 * import, so the MCP bench script can run the same walk over a document it
 * fetched over the wire.
 *
 * A block is any array element with a string `blockType`: a Section in
 * `layout`, a content block nested in a Section's `blocks`, a newsletter's
 * `content` block. Paths are dotted, array indexes included
 * (`layout.2.blocks.1`), and the first segment names the field an update
 * has to send back.
 */

export type Doc = Record<string, unknown>

export type BlockRow = {
  path: string
  id: string
  blockType: string
  blockName: string | null
  block: Doc
}

/** One row of an outline: a block's identity plus what it says, never its data. */
export type OutlineRow = {
  path: string
  id: string
  blockType: string
  blockName?: string
  /** Blocks nested inside this one (a Section's `blocks`). */
  children?: number
  /** The first characters of the block's own copy, nested blocks left out. */
  text?: string
}

export const SNIPPET_CHARS = 200

const isRecord = (value: unknown): value is Doc => typeof value === 'object' && value !== null

const isBlock = (value: unknown): value is Doc & { blockType: string } =>
  isRecord(value) && typeof value.blockType === 'string'

const isLexicalState = (value: unknown): boolean =>
  isRecord(value) && isRecord(value.root) && Array.isArray(value.root.children)

/** Every block in document order, nested blocks after their parent. */
export function listBlocks(doc: Doc): BlockRow[] {
  const rows: BlockRow[] = []
  const walk = (value: unknown, path: string): void => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const itemPath = path ? `${path}.${index}` : String(index)
        if (isBlock(item)) {
          rows.push({
            path: itemPath,
            id: String(item.id ?? ''),
            blockType: item.blockType,
            blockName: typeof item.blockName === 'string' && item.blockName ? item.blockName : null,
            block: item,
          })
        }
        walk(item, itemPath)
      })
      return
    }
    if (!isRecord(value) || isLexicalState(value)) return
    for (const [key, child] of Object.entries(value)) {
      if (key === 'meta') continue
      walk(child, path ? `${path}.${key}` : key)
    }
  }
  walk(doc, '')
  return rows
}

export const findBlock = (doc: Doc, blockId: string): BlockRow | null =>
  listBlocks(doc).find((row) => row.id === blockId) ?? null

/** The field an update sends back for a block at `path` (`layout.2.blocks.1` is `layout`). */
export const rootField = (path: string): string => path.split('.')[0] ?? path

/**
 * A copy of the document with the block at `path` replaced. Only the objects
 * and arrays along the path are cloned; everything else is shared.
 */
export function withBlock(doc: Doc, path: string, next: Doc): Doc {
  const segments = path.split('.')
  const set = (node: unknown, depth: number): unknown => {
    if (depth === segments.length) return next
    const segment = segments[depth] as string
    if (Array.isArray(node)) {
      const copy = [...node]
      copy[Number(segment)] = set(node[Number(segment)], depth + 1)
      return copy
    }
    if (!isRecord(node)) throw new Error(`No block at ${path}`)
    return { ...node, [segment]: set(node[segment], depth + 1) }
  }
  return set(doc, 0) as Doc
}

/**
 * The block's own copy, in reading order: string values under the content
 * keys, rich text as markdown. Nested blocks are skipped, so a Section's
 * snippet is empty and its children are counted instead.
 */
export function blockText(block: Doc): string {
  const parts: string[] = []
  const walk = (value: unknown, key: string): void => {
    if (isLexicalState(value)) {
      parts.push(lexicalToMarkdownString(value))
      return
    }
    if (Array.isArray(value)) {
      for (const item of value) if (!isBlock(item)) walk(item, key)
      return
    }
    if (isRecord(value)) {
      for (const [childKey, child] of Object.entries(value)) {
        const normalized = normalizeKey(childKey)
        if (CONTENT_SKIP_KEYS.has(normalized)) continue
        walk(child, normalized)
      }
      return
    }
    if (typeof value === 'string' && CONTENT_TEXT_KEYS.has(key)) parts.push(value)
  }
  walk(block, '')
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export const outlineRow = (row: BlockRow): OutlineRow => {
  const children = listBlocks(row.block).length
  const text = blockText(row.block).slice(0, SNIPPET_CHARS)
  return {
    path: row.path,
    id: row.id,
    blockType: row.blockType,
    ...(row.blockName ? { blockName: row.blockName } : {}),
    ...(children ? { children } : {}),
    ...(text ? { text } : {}),
  }
}

export const outline = (doc: Doc): OutlineRow[] => listBlocks(doc).map(outlineRow)
