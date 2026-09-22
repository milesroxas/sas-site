import {
  APIError,
  type CollectionBeforeChangeHook,
  type Config,
  type GlobalBeforeChangeHook,
  type PayloadRequest,
} from 'payload'

/**
 * House rules on copy, enforced on every write that arrives over MCP.
 *
 * Until now the rules reached an agent as server instructions only. Claude
 * Code keeps them, but nothing on the server checked the result, and for a
 * Codex or Cursor session the instructions are the only guardrail there is.
 * This hook checks the copy itself, whichever client sent it, and refuses the
 * save with each problem named by path and quoted, so the agent fixes the
 * text without reading the document again.
 *
 * Two rules, both plain code:
 *
 * - No em dash in copy. Titles, captions, labels and rich text included.
 *   The house style's one exception, a numeric range ("50—100K"), passes.
 * - No visitor contact detail in copy. An email address in the copy is
 *   looked up in the visitor records (inquiries, form submissions,
 *   subscribers); a match is refused. An exact lookup, so the studio's own
 *   addresses and a partner's pass, and nothing is guessed.
 *
 * Only what the write changes is checked: a string, or a rich text node,
 * that is identical to the stored document at the same path is skipped, so
 * an edit to one block is never blocked by an older em dash in another.
 * Saves from the admin, REST and the Local API pass through untouched.
 */

/** Set by the MCP endpoint on every request it serves. */
const MCP_API = 'MCP'

/** Keys whose values are never copy: identifiers, code, data, addresses. */
const SKIP_KEYS = new Set([
  'apiKey',
  'blockType',
  'code',
  'geometry',
  'href',
  'id',
  'key',
  'recipe',
  'slug',
  'spec',
  'storyBeatKey',
  'url',
])

/** Lexical text node format bit for inline code (`lexicalToMarkdown.ts`). */
const LEXICAL_CODE = 1 << 4

/** The em dash the house style refuses, except between the ends of a range. */
const EM_DASH = /—/
const RANGE_EM_DASH = /(?<=[\d%$€£K])—(?=[\d$€£])/g

/** The email shape `features/ask/redact.ts` strips from visitor text. */
const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu

const EXCERPT = 24

export type CopyProblem = { path: string; message: string }

type Doc = Record<string, unknown>

const isRecord = (value: unknown): value is Doc => typeof value === 'object' && value !== null

/** The value at a dotted path, or undefined. */
function at(doc: unknown, path: string): unknown {
  let node: unknown = doc
  for (const segment of path.split('.')) {
    if (!isRecord(node) && !Array.isArray(node)) return undefined
    node = (node as Doc)[segment]
  }
  return node
}

/** `layout.0.blocks.1.body.root.children.2.children.0.text` names the field `layout.0.blocks.1.body`. */
const fieldPath = (path: string): string => path.replace(/\.root\..*$/, '')

const excerpt = (text: string, index: number, length: number): string => {
  const start = Math.max(0, index - EXCERPT)
  const end = Math.min(text.length, index + length + EXCERPT)
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`
}

type Found = { path: string; text: string }

/**
 * Every string of copy in `data` that differs from `original` at the same
 * path: plain string fields and Lexical text nodes, skipping identifiers,
 * code and data.
 */
function changedCopy(data: unknown, original: unknown): Found[] {
  const found: Found[] = []
  const walk = (value: unknown, path: string, key: string, inCode: boolean): void => {
    if (typeof value === 'string') {
      if (inCode || SKIP_KEYS.has(key) || key.startsWith('_')) return
      if (value === at(original, path)) return
      found.push({ path, text: value })
      return
    }
    if (Array.isArray(value)) {
      for (const [index, item] of value.entries()) {
        walk(item, path ? `${path}.${index}` : String(index), key, inCode)
      }
      return
    }
    if (!isRecord(value)) return
    // A Lexical node: its `text` is copy unless the node is code.
    if (typeof value.type === 'string') {
      const format = typeof value.format === 'number' ? value.format : 0
      const code = inCode || value.type === 'code' || Boolean(format & LEXICAL_CODE)
      for (const [childKey, child] of Object.entries(value)) {
        if (childKey === 'type' || childKey === 'format') continue
        walk(child, path ? `${path}.${childKey}` : childKey, childKey, code)
      }
      return
    }
    for (const [childKey, child] of Object.entries(value)) {
      if (SKIP_KEYS.has(childKey) || childKey.startsWith('_')) continue
      walk(child, path ? `${path}.${childKey}` : childKey, childKey, inCode)
    }
  }
  walk(data, '', '', false)
  return found
}

/** Em dash problems, one per offending string. */
export function emDashProblems(data: unknown, original: unknown): CopyProblem[] {
  return changedCopy(data, original).flatMap(({ path, text }) => {
    const stripped = text.replace(RANGE_EM_DASH, '-')
    const index = stripped.search(EM_DASH)
    if (index === -1) return []
    return [
      {
        path: fieldPath(path),
        message: `em dash in "${excerpt(stripped, index, 1)}". House style: recast with a comma, a colon, parentheses or a period.`,
      },
    ]
  })
}

/** Email addresses in the changed copy, with the field each sits in. */
export function emailsInCopy(data: unknown, original: unknown): { path: string; email: string }[] {
  const seen = new Set<string>()
  return changedCopy(data, original).flatMap(({ path, text }) =>
    [...text.matchAll(EMAIL)].flatMap((match) => {
      const email = match[0].toLowerCase()
      const id = `${fieldPath(path)}:${email}`
      if (seen.has(id)) return []
      seen.add(id)
      return [{ path: fieldPath(path), email }]
    }),
  )
}

/**
 * Whether an address belongs to a visitor record. Looked up with access
 * overridden: the key's user may not read visitor records, and the answer
 * is one bit that only ever refuses a save.
 */
async function isVisitorEmail(req: PayloadRequest, email: string): Promise<boolean> {
  const lookups = [
    req.payload.count({ collection: 'inquiries', req, where: { email: { equals: email } } }),
    req.payload.count({ collection: 'subscribers', req, where: { email: { equals: email } } }),
    req.payload.count({
      collection: 'form-submissions',
      req,
      where: { 'submissionData.value': { equals: email } },
    }),
  ]
  const counts = await Promise.all(lookups)
  return counts.some((result) => result.totalDocs > 0)
}

export async function visitorEmailProblems(
  req: PayloadRequest,
  data: unknown,
  original: unknown,
): Promise<CopyProblem[]> {
  const problems: CopyProblem[] = []
  for (const { path, email } of emailsInCopy(data, original)) {
    if (await isVisitorEmail(req, email)) {
      problems.push({
        path,
        message: `"${email}" is a visitor's contact detail. Copy never carries visitor details: remove it.`,
      })
    }
  }
  return problems
}

async function refuseBadCopy(
  req: PayloadRequest,
  slug: string,
  data: unknown,
  original: unknown,
): Promise<void> {
  if (req.payloadAPI !== MCP_API) return
  const problems = [
    ...emDashProblems(data, original),
    ...(await visitorEmailProblems(req, data, original)),
  ]
  if (problems.length === 0) return
  const lines = problems.map((problem) => `${problem.path}: ${problem.message}`)
  throw new APIError(
    `Not saved: ${problems.length} problem${problems.length === 1 ? '' : 's'} in the copy of ${slug}. Fix each and resend.\n${lines.join('\n')}`,
    400,
    { errors: problems },
    true,
  )
}

export const checkMcpCollectionWrite: CollectionBeforeChangeHook = async ({
  collection,
  data,
  originalDoc,
  req,
}) => {
  await refuseBadCopy(req, collection.slug, data, originalDoc)
  return data
}

export const checkMcpGlobalWrite: GlobalBeforeChangeHook = async ({
  data,
  global,
  originalDoc,
  req,
}) => {
  await refuseBadCopy(req, global.slug, data, originalDoc)
  return data
}

/** Adds the checks to every collection and global an MCP key can write. */
export const withMcpWriteChecks = (
  config: Config,
  collections: ReadonlySet<string>,
  globals: ReadonlySet<string>,
): Config => ({
  ...config,
  collections: config.collections?.map((collection) =>
    collections.has(collection.slug)
      ? {
          ...collection,
          hooks: {
            ...collection.hooks,
            beforeChange: [...(collection.hooks?.beforeChange ?? []), checkMcpCollectionWrite],
          },
        }
      : collection,
  ),
  globals: config.globals?.map((global) =>
    globals.has(global.slug)
      ? {
          ...global,
          hooks: {
            ...global.hooks,
            beforeChange: [...(global.hooks?.beforeChange ?? []), checkMcpGlobalWrite],
          },
        }
      : global,
  ),
})
