import type { PayloadRequest, SanitizedCollectionConfig } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import {
  checkMcpCollectionWrite,
  emailsInCopy,
  emDashProblems,
  withMcpWriteChecks,
} from './mcp-write-checks'

const rich = (text: string, format = 0) => ({
  root: {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', text, format }] }],
  },
})

describe('emDashProblems', () => {
  it('names the field and quotes the text around the dash', () => {
    const data = {
      title: 'Plain title',
      layout: [{ blockType: 'cta', id: 'c1', heading: 'Talk to us — we listen' }],
    }
    expect(emDashProblems(data, undefined)).toEqual([
      {
        path: 'layout.0.heading',
        message: expect.stringMatching(/^em dash in "Talk to us — we listen"\. House style/),
      },
    ])
  })

  it('finds one inside rich text and reports the field, not the node', () => {
    const data = { body: rich('First — second.') }
    expect(emDashProblems(data, undefined).map((p) => p.path)).toEqual(['body'])
  })

  it('lets a numeric range through', () => {
    expect(emDashProblems({ text: 'Budgets of 50—100K' }, undefined)).toEqual([])
    expect(emDashProblems({ text: '$5—$10 a seat' }, undefined)).toEqual([])
  })

  it('ignores code, specs, identifiers and inline code', () => {
    const data = {
      slug: 'a—b',
      spec: { note: 'x — y' },
      layout: [{ blockType: 'code', id: 'k', code: 'a — b', language: 'ts' }],
      body: rich('a — b', 1 << 4),
      block: { type: 'code', children: [{ type: 'text', text: 'a — b' }] },
    }
    expect(emDashProblems(data, undefined)).toEqual([])
  })

  it('skips copy identical to the stored document at the same path', () => {
    const original = { layout: [{ heading: 'Old — dash' }, { heading: 'Fine' }] }
    const data = { layout: [{ heading: 'Old — dash' }, { heading: 'New — dash' }] }
    expect(emDashProblems(data, original).map((p) => p.path)).toEqual(['layout.1.heading'])
  })
})

describe('emailsInCopy', () => {
  it('collects each address once per field, lowercased', () => {
    const data = {
      body: rich('Write to Ann@Example.com or ann@example.com'),
      meta: { description: 'x' },
    }
    expect(emailsInCopy(data, undefined)).toEqual([{ path: 'body', email: 'ann@example.com' }])
  })
})

describe('checkMcpCollectionWrite', () => {
  const collection = { slug: 'pages' } as SanitizedCollectionConfig
  const request = (payloadAPI: string, visitorEmails: string[] = []) => {
    const count = vi.fn(({ where }: { where: Record<string, { equals: string }> }) => {
      const email = Object.values(where)[0]?.equals ?? ''
      return Promise.resolve({ totalDocs: visitorEmails.includes(email) ? 1 : 0 })
    })
    return { count, req: { payloadAPI, payload: { count } } as unknown as PayloadRequest }
  }
  const run = (
    req: PayloadRequest,
    data: Record<string, unknown>,
    originalDoc?: Record<string, unknown>,
  ) =>
    checkMcpCollectionWrite({
      collection,
      context: {},
      data,
      operation: 'update',
      originalDoc,
      req,
    })

  it('does nothing outside MCP', async () => {
    const { req, count } = request('REST', ['ann@example.com'])
    const data = { title: 'A — B', body: rich('ann@example.com') }
    await expect(run(req, data)).resolves.toBe(data)
    expect(count).not.toHaveBeenCalled()
  })

  it('refuses an em dash over MCP with the problems in the message and the data', async () => {
    const { req } = request('MCP')
    const error = await run(req, { title: 'A — B' }).catch((e: unknown) => e)
    expect(error).toMatchObject({
      status: 400,
      data: { errors: [{ path: 'title' }] },
    })
    expect((error as Error).message).toMatch(/^Not saved: 1 problem in the copy of pages/)
    expect((error as Error).message).toMatch(/\ntitle: em dash in "A — B"/)
  })

  it('refuses a visitor email and passes an unknown one', async () => {
    const { req, count } = request('MCP', ['ann@example.com'])
    await expect(run(req, { body: rich('Thanks, hello@suits-sandals.com') })).resolves.toBeTruthy()
    expect(count).toHaveBeenCalledTimes(3)
    await expect(run(req, { body: rich('Ann wrote from ann@example.com') })).rejects.toThrow(
      /body: "ann@example.com" is a visitor's contact detail/,
    )
  })

  it('passes a save whose only em dash is already stored', async () => {
    const { req } = request('MCP')
    const data = { title: 'Old — title', excerpt: 'New' }
    await expect(run(req, data, { title: 'Old — title', excerpt: 'Old' })).resolves.toBe(data)
  })
})

describe('withMcpWriteChecks', () => {
  it('appends the hook to the named collections and globals only', () => {
    const config = withMcpWriteChecks(
      {
        collections: [
          { slug: 'pages', fields: [] },
          { slug: 'users', fields: [] },
        ],
        globals: [
          { slug: 'home', fields: [] },
          { slug: 'header', fields: [] },
        ],
      } as never,
      new Set(['pages']),
      new Set(['home']),
    )
    expect(config.collections?.[0]?.hooks?.beforeChange).toEqual([checkMcpCollectionWrite])
    expect(config.collections?.[1]?.hooks).toBeUndefined()
    expect(config.globals?.[0]?.hooks?.beforeChange).toHaveLength(1)
    expect(config.globals?.[1]?.hooks).toBeUndefined()
  })
})
