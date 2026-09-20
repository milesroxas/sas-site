import crypto from 'node:crypto'
import { APIError, type CollectionBeforeDeleteHook, type Config } from 'payload'

/**
 * No document is deleted over MCP in one call (docs/mcp.md, "Deleting").
 *
 * The first `delete*` call deletes nothing. It answers with the document it
 * would delete and a token; the agent shows that to the user and, after an
 * explicit yes, calls again with the token in `confirm`. The token is an HMAC
 * of the collection, the id and the document's `updatedAt`, so it names one
 * document in one state: it cannot be guessed, reused for another document, or
 * spent after the document has changed. It is stateless, so it holds across
 * serverless instances.
 *
 * What this does and does not guarantee: a delete is always two deliberate
 * calls, the agent has always seen what it is about to remove, and a `where`
 * delete can never pass, because no single token fits several documents. It
 * cannot prove a person said yes; nothing on the server can. That part is the
 * server instruction and the client's own prompt, which the tool's
 * `destructiveHint` annotation asks for.
 *
 * The `confirm` input reaches this hook through `req.context`, set by the
 * vendored plugin patch (`patches/@payloadcms__plugin-mcp.patch`). Deletes from
 * the admin, REST and the Local API never pass through here.
 */

/** Set by the MCP endpoint on every request it serves. */
const MCP_API = 'MCP'

export const deleteConfirmationToken = ({
  collection,
  id,
  secret,
  updatedAt,
}: {
  collection: string
  id: number | string
  secret: string
  updatedAt: string
}): string =>
  crypto
    .createHmac('sha256', secret)
    .update(['mcp-delete', collection, String(id), updatedAt].join(':'))
    .digest('hex')
    .slice(0, 12)

const sameToken = (sent: unknown, expected: string): boolean =>
  typeof sent === 'string' &&
  sent.length === expected.length &&
  crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(expected))

export const confirmMcpDelete: CollectionBeforeDeleteHook = async ({
  collection,
  context,
  id,
  req,
}) => {
  if (req.payloadAPI !== MCP_API) return

  const doc = (await req.payload.findByID({
    collection: collection.slug,
    depth: 0,
    disableErrors: true,
    draft: true,
    id,
    overrideAccess: false,
    req,
  })) as Record<string, unknown> | null
  // Nothing the key's user can see: let the delete answer for itself.
  if (!doc) return

  const expected = deleteConfirmationToken({
    collection: collection.slug,
    id,
    secret: req.payload.secret,
    updatedAt: typeof doc.updatedAt === 'string' ? doc.updatedAt : '',
  })
  if (sameToken(context.mcpDeleteConfirm, expected)) return

  const title = doc[collection.admin?.useAsTitle ?? 'id']
  const named = typeof title === 'string' && title ? `"${title}" ` : ''
  const status = typeof doc._status === 'string' ? `, ${doc._status}` : ''
  throw new APIError(
    `Nothing was deleted. This would permanently delete ${named}(${collection.slug} id ${id}${status}). Show the user exactly that and ask. Only after their explicit yes in this conversation, call again with the same id and confirm: "${expected}". The token stops working if the document changes.`,
    409,
    undefined,
    true,
  )
}

/** Appends the confirmation after a collection's own guards, so an in-use refusal answers first. */
export const withMcpDeleteConfirmation = (config: Config, slugs: ReadonlySet<string>): Config => ({
  ...config,
  collections: config.collections?.map((collection) =>
    slugs.has(collection.slug)
      ? {
          ...collection,
          hooks: {
            ...collection.hooks,
            beforeDelete: [...(collection.hooks?.beforeDelete ?? []), confirmMcpDelete],
          },
        }
      : collection,
  ),
})
