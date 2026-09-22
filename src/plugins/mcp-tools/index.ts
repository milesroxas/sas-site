import type { MCPPluginConfig } from '@payloadcms/plugin-mcp'
import type { CollectionSlug, GlobalSlug, PayloadRequest } from 'payload'
// The plugin and the MCP SDK under it were built against zod 3; the project
// is on zod 4. A `zod/v3` schema is what the SDK's converter expects.
import { z } from 'zod/v3'
import { type Doc, findBlock, outline, rootField, withBlock } from './blocks'
import { locateClient, locateInOutline } from './locate'

/**
 * Block-level MCP tools: outline a document, locate the block an instruction
 * means, read one block, patch one block.
 *
 * The generated tools move whole documents. A `find*` call returns the whole
 * page (100 to 250KB on a long one) and an `update*` call resends the whole
 * `layout`, so a one-line edit costs the client's model the page twice, the
 * second time as output tokens. These three tools move one block instead.
 * They are custom tools of `@payloadcms/plugin-mcp`, so every client gets
 * them from the server and no client needs a change.
 *
 * Two gates, like the generated tools. Each tool is a checkbox on the key
 * (`payload-mcp-tool` group, off by default; `mcp.ts` sets that), and a call
 * also needs the key's `find` (outline, get) or `update` (patch) on the
 * collection or global it names, read from the key document `mcp.ts` puts on
 * `req.context.mcpApiKey`. The Local API then runs as the linked team member
 * with `overrideAccess: false`, so collection access rules apply as well.
 */

type McpTool = NonNullable<NonNullable<MCPPluginConfig['mcp']>['tools']>[number]

/**
 * The plugin types `parameters` with its own zod 3 copy; comparing a
 * `zod/v3` shape against it makes tsc give up ("excessively deep"). Tools are
 * typed here with the shape kept simple and cast once at the export.
 */
type BlockTool = Omit<McpTool, 'parameters'> & { parameters: Record<string, z.ZodTypeAny> }

/** Collections and globals with blocks in them. A slug not listed has no block to reach. */
export const BLOCK_COLLECTIONS = [
  'pages',
  'expertise-pages',
  'audience-pages',
  'work-pages',
  'lab-pages',
  'posts',
  'newsletters',
] as const satisfies readonly CollectionSlug[]

export const BLOCK_GLOBALS = ['home'] as const satisfies readonly GlobalSlug[]

const collectionEnum = z.enum([...BLOCK_COLLECTIONS, ...BLOCK_GLOBALS])

type Target = z.infer<typeof collectionEnum>

const isGlobal = (target: Target): target is (typeof BLOCK_GLOBALS)[number] =>
  (BLOCK_GLOBALS as readonly string[]).includes(target)

/** The plugin's rule for a capability group name: `work-pages` is `workPages`. */
const toCamelCase = (slug: string): string =>
  slug.replace(/[-_\s]+(.)?/g, (_, chr: string | undefined) => (chr ? chr.toUpperCase() : ''))

type KeyCapabilities = Record<
  string,
  { find?: boolean | null; update?: boolean | null } | undefined
>

const keyAllows = (req: PayloadRequest, target: Target, op: 'find' | 'update'): boolean => {
  const key = req.context.mcpApiKey as KeyCapabilities | undefined
  return Boolean(key?.[toCamelCase(target)]?.[op])
}

const text = (body: string) => ({ content: [{ type: 'text' as const, text: body }] })

const json = (value: unknown) => text(JSON.stringify(value))

/** A refused save names each problem by path; surface those, not just the headline. */
const errorText = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error)
  const errors = (error as { data?: { errors?: unknown } })?.data?.errors
  return errors ? `Error: ${message}\n${JSON.stringify(errors)}` : `Error: ${message}`
}

const targetParams = {
  collection: collectionEnum.describe(
    'The collection the document is in, or the global (`home`), by slug.',
  ),
  id: z.union([z.string(), z.number()]).optional().describe('The document id. Omit for a global.'),
}

/** The latest version of the document, draft or published, as the team member may see it. */
async function readTarget(req: PayloadRequest, target: Target, id: string | number | undefined) {
  const shared = { depth: 0, draft: true, overrideAccess: false, req, user: req.user } as const
  if (isGlobal(target)) {
    const doc = await req.payload.findGlobal({ slug: target, ...shared })
    return doc as unknown as Doc
  }
  if (id === undefined || id === '') throw new Error(`\`id\` is required for ${target}`)
  const doc = await req.payload.findByID({ collection: target, id, ...shared })
  return doc as unknown as Doc
}

const outlineDocument: BlockTool = {
  name: 'outlineDocument',
  description:
    'One row per block of a document, nested blocks included: path, id, blockType, blockName, a child count, and the first 200 characters of its copy. Read this instead of the whole document to find the block an edit concerns, then getBlock or patchBlock it by id. Returns the latest draft.',
  parameters: targetParams,
  handler: async (args, req) => {
    const { collection, id } = args as { collection: Target; id?: string | number }
    if (!keyAllows(req, collection, 'find')) {
      return text(`Error: this key cannot find ${collection}. Ask an admin to grant it.`)
    }
    try {
      const doc = await readTarget(req, collection, id)
      return json({
        collection,
        id: doc.id,
        title: doc.title,
        _status: doc._status,
        blocks: outline(doc),
      })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const getBlock: BlockTool = {
  name: 'getBlock',
  description:
    'One block of a document by its id (from outlineDocument), with its path. The block comes back exactly as stored, nested blocks included, so it can be edited and sent to patchBlock. Returns the latest draft.',
  parameters: {
    ...targetParams,
    blockId: z.string().describe('The block id from outlineDocument.'),
  },
  handler: async (args, req) => {
    const { collection, id, blockId } = args as {
      collection: Target
      id?: string | number
      blockId: string
    }
    if (!keyAllows(req, collection, 'find')) {
      return text(`Error: this key cannot find ${collection}. Ask an admin to grant it.`)
    }
    try {
      const doc = await readTarget(req, collection, id)
      const row = findBlock(doc, blockId)
      if (!row) return text(`Error: no block with id "${blockId}" in ${collection} ${doc.id ?? ''}`)
      return json({ path: row.path, block: row.block })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const patchBlock: BlockTool = {
  name: 'patchBlock',
  description:
    'Change one block of a document by its id and save. `patch` holds only the fields to change; each replaces the stored field whole, so send a complete array (rows with their ids) when changing one row of it. `id` and `blockType` cannot change. Saves a draft unless `draft` is false, which publishes. Returns the saved block. A refused save names each problem by path: fix those and resend the same patch.',
  parameters: {
    ...targetParams,
    blockId: z.string().describe('The block id from outlineDocument.'),
    patch: z
      .record(z.string(), z.unknown())
      .describe('The fields to change, as they appear in getBlock.'),
    draft: z
      .boolean()
      .optional()
      .default(true)
      .describe('true saves a draft (the default); false publishes the document.'),
  },
  handler: async (args, req) => {
    const {
      collection,
      id,
      blockId,
      patch,
      draft = true,
    } = args as {
      collection: Target
      id?: string | number
      blockId: string
      patch: Doc
      draft?: boolean
    }
    if (!keyAllows(req, collection, 'update')) {
      return text(`Error: this key cannot update ${collection}. Ask an admin to grant it.`)
    }
    try {
      const doc = await readTarget(req, collection, id)
      const row = findBlock(doc, blockId)
      if (!row) return text(`Error: no block with id "${blockId}" in ${collection} ${doc.id ?? ''}`)
      const next = { ...row.block, ...patch, id: row.id, blockType: row.blockType }
      const field = rootField(row.path)
      const data = { [field]: withBlock(doc, row.path, next)[field] }
      const shared = {
        data,
        depth: 0,
        draft,
        overrideAccess: false,
        overrideLock: true,
        req,
        user: req.user,
      } as const
      const saved = (isGlobal(collection)
        ? await req.payload.updateGlobal({ slug: collection, ...shared })
        : await req.payload.update({
            collection,
            id: doc.id as string | number,
            ...shared,
          })) as unknown as Doc
      const savedRow = findBlock(saved, blockId)
      return json({
        path: savedRow?.path ?? row.path,
        _status: saved._status,
        block: savedRow?.block ?? next,
      })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const locateBlock: BlockTool = {
  name: 'locateBlock',
  description:
    "Which block of a document an editing instruction is about, judged on the server from the outline (one Jev request, no client tokens for the page). Answers with a verdict (`found`, `unsure`, `none`), the most likely blocks best first with a probability each (path, id, blockType, blockName, the start of the copy), and what the judgment cost. On `found`, getBlock or patchBlock the first candidate by id; on `unsure`, pick from the candidates or read outlineDocument; on `none`, the document has no such block. Send the instruction in the user's words.",
  parameters: {
    ...targetParams,
    instruction: z
      .string()
      .min(1)
      .describe(
        "The edit in words, as the user put it, such as 'reword the first feature image statement'.",
      ),
  },
  handler: async (args, req) => {
    const { collection, id, instruction } = args as {
      collection: Target
      id?: string | number
      instruction: string
    }
    if (!keyAllows(req, collection, 'find')) {
      return text(`Error: this key cannot find ${collection}. Ask an admin to grant it.`)
    }
    const jev = locateClient()
    if (!jev) {
      return text('Error: locateBlock is not configured on this server. Use outlineDocument.')
    }
    try {
      const doc = await readTarget(req, collection, id)
      const located = await locateInOutline(jev, outline(doc), instruction)
      return json({ collection, id: doc.id, title: doc.title, ...located })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const blockTools: BlockTool[] = [outlineDocument, locateBlock, getBlock, patchBlock]

export const mcpBlockTools = blockTools as unknown as McpTool[]
