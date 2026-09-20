import type { CollectionConfig, PayloadRequest, SanitizedCollectionConfig } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import {
  confirmMcpDelete,
  deleteConfirmationToken,
  withMcpDeleteConfirmation,
} from './mcp-delete-confirmation'

const secret = 'test-secret'
const collection = {
  slug: 'streak-looks',
  admin: { useAsTitle: 'title' },
} as SanitizedCollectionConfig
const doc = { id: 7, title: 'Amber dusk', _status: 'draft', updatedAt: '2026-09-20T10:00:00.000Z' }

const request = (payloadAPI: string, found: typeof doc | null = doc) =>
  ({
    payloadAPI,
    payload: { secret, findByID: vi.fn().mockResolvedValue(found) },
  }) as unknown as PayloadRequest

const run = (req: PayloadRequest, confirm?: unknown) =>
  confirmMcpDelete({ collection, context: { mcpDeleteConfirm: confirm }, id: doc.id, req })

const token = deleteConfirmationToken({
  collection: collection.slug,
  id: doc.id,
  secret,
  updatedAt: doc.updatedAt,
})

describe('confirmMcpDelete', () => {
  it('refuses the first call and names the document and the token', async () => {
    await expect(run(request('MCP'))).rejects.toThrow(
      /Nothing was deleted.*"Amber dusk".*id 7, draft/,
    )
    await expect(run(request('MCP'))).rejects.toThrow(token)
  })

  it('lets the second call through with the token', async () => {
    await expect(run(request('MCP'), token)).resolves.toBeUndefined()
  })

  it('refuses a wrong token, and a right one once the document has changed', async () => {
    await expect(run(request('MCP'), 'not-the-token')).rejects.toThrow(/Nothing was deleted/)
    const changed = { ...doc, updatedAt: '2026-09-20T11:00:00.000Z' }
    await expect(run(request('MCP', changed), token)).rejects.toThrow(/Nothing was deleted/)
  })

  it('binds the token to one document', () => {
    const other = deleteConfirmationToken({
      collection: collection.slug,
      id: 8,
      secret,
      updatedAt: doc.updatedAt,
    })
    expect(other).not.toBe(token)
  })

  it('leaves admin, REST and Local API deletes alone', async () => {
    const req = request('REST')
    await expect(run(req)).resolves.toBeUndefined()
    expect(req.payload.findByID).not.toHaveBeenCalled()
  })
})

describe('withMcpDeleteConfirmation', () => {
  it('appends the hook after a collection’s own guards, only where delete is offered', () => {
    const guard = vi.fn()
    const config = withMcpDeleteConfirmation(
      {
        collections: [
          { slug: 'pages', fields: [], hooks: { beforeDelete: [guard] } },
          { slug: 'media', fields: [] },
        ] as CollectionConfig[],
      } as Parameters<typeof withMcpDeleteConfirmation>[0],
      new Set(['pages']),
    )
    expect(config.collections?.[0]?.hooks?.beforeDelete).toEqual([guard, confirmMcpDelete])
    expect(config.collections?.[1]?.hooks?.beforeDelete).toBeUndefined()
  })
})
