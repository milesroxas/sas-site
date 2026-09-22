import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { mcpBlockTools } from './index'

const page = {
  id: 6,
  title: 'About Us',
  _status: 'published',
  layout: [
    {
      blockType: 'section',
      id: 's1',
      blocks: [{ blockType: 'content', id: 'c1', blockName: 'Story', heading: 'Who we are' }],
    },
  ],
}

const home = {
  id: 1,
  title: 'Home',
  _status: 'draft',
  layout: [{ blockType: 'audienceTabs', id: 'a1', heading: 'Who we help' }],
}

type Capabilities = Record<string, { find?: boolean; update?: boolean }>

const request = (capabilities: Capabilities) => {
  const payload = {
    findByID: vi.fn().mockResolvedValue(page),
    findGlobal: vi.fn().mockResolvedValue(home),
    update: vi
      .fn()
      .mockImplementation(({ data }: { data: { layout: unknown } }) =>
        Promise.resolve({ ...page, _status: 'draft', layout: data.layout }),
      ),
    updateGlobal: vi
      .fn()
      .mockImplementation(({ data }: { data: { layout: unknown } }) =>
        Promise.resolve({ ...home, layout: data.layout }),
      ),
  }
  const req = {
    context: { mcpApiKey: capabilities },
    payload,
    user: { id: 1, collection: 'users' },
  } as unknown as PayloadRequest
  return { payload, req }
}

const tool = (name: string) => {
  const found = mcpBlockTools.find((t) => t.name === name)
  if (!found) throw new Error(`no tool ${name}`)
  return found
}

const call = async (name: string, args: Record<string, unknown>, req: PayloadRequest) => {
  const result = await tool(name).handler(args, req, {})
  return result.content[0]?.text ?? ''
}

const full: Capabilities = {
  pages: { find: true, update: true },
  home: { find: true, update: true },
}

describe('outlineDocument', () => {
  it('refuses a key without find on the collection', async () => {
    const { req, payload } = request({ pages: { update: true } })
    await expect(call('outlineDocument', { collection: 'pages', id: 6 }, req)).resolves.toMatch(
      /cannot find pages/,
    )
    expect(payload.findByID).not.toHaveBeenCalled()
  })

  it('reads the latest draft as the team member and outlines it', async () => {
    const { req, payload } = request(full)
    const out = JSON.parse(await call('outlineDocument', { collection: 'pages', id: 6 }, req))
    expect(payload.findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'pages', id: 6, draft: true, overrideAccess: false }),
    )
    expect(out).toEqual({
      collection: 'pages',
      id: 6,
      title: 'About Us',
      _status: 'published',
      blocks: [
        { path: 'layout.0', id: 's1', blockType: 'section', children: 1 },
        {
          path: 'layout.0.blocks.0',
          id: 'c1',
          blockType: 'content',
          blockName: 'Story',
          text: 'Who we are',
        },
      ],
    })
  })

  it('needs an id for a collection and none for a global', async () => {
    const { req, payload } = request(full)
    await expect(call('outlineDocument', { collection: 'pages' }, req)).resolves.toMatch(
      /`id` is required/,
    )
    const out = JSON.parse(await call('outlineDocument', { collection: 'home' }, req))
    expect(payload.findGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: 'home' }))
    expect(out.blocks).toHaveLength(1)
  })
})

describe('getBlock', () => {
  it('returns one block with its path', async () => {
    const { req } = request(full)
    const out = JSON.parse(
      await call('getBlock', { collection: 'pages', id: 6, blockId: 'c1' }, req),
    )
    expect(out).toEqual({ path: 'layout.0.blocks.0', block: page.layout[0]?.blocks?.[0] })
  })

  it('names a block that is not there', async () => {
    const { req } = request(full)
    await expect(
      call('getBlock', { collection: 'pages', id: 6, blockId: 'zz' }, req),
    ).resolves.toMatch(/no block with id "zz" in pages 6/)
  })
})

describe('patchBlock', () => {
  it('refuses a key without update on the collection', async () => {
    const { req, payload } = request({ pages: { find: true } })
    await expect(
      call(
        'patchBlock',
        { collection: 'pages', id: 6, blockId: 'c1', patch: { heading: 'x' } },
        req,
      ),
    ).resolves.toMatch(/cannot update pages/)
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('merges the patch into the block, keeps id and blockType, and saves a draft of the one field', async () => {
    const { req, payload } = request(full)
    const out = JSON.parse(
      await call(
        'patchBlock',
        {
          collection: 'pages',
          id: 6,
          blockId: 'c1',
          patch: { heading: 'What we do', id: 'hijack', blockType: 'cta' },
        },
        req,
      ),
    )
    expect(payload.update).toHaveBeenCalledTimes(1)
    const sent = payload.update.mock.calls[0]?.[0] as {
      data: Record<string, unknown>
      draft: boolean
      overrideAccess: boolean
    }
    expect(Object.keys(sent.data)).toEqual(['layout'])
    expect(sent.draft).toBe(true)
    expect(sent.overrideAccess).toBe(false)
    expect(out).toEqual({
      path: 'layout.0.blocks.0',
      _status: 'draft',
      block: { blockType: 'content', id: 'c1', blockName: 'Story', heading: 'What we do' },
    })
  })

  it('publishes only when draft is false', async () => {
    const { req, payload } = request(full)
    await call(
      'patchBlock',
      { collection: 'pages', id: 6, blockId: 'c1', patch: { heading: 'x' }, draft: false },
      req,
    )
    expect(payload.update.mock.calls[0]?.[0]).toMatchObject({ draft: false })
  })

  it('updates a global through updateGlobal', async () => {
    const { req, payload } = request(full)
    const out = JSON.parse(
      await call('patchBlock', { collection: 'home', blockId: 'a1', patch: { heading: 'y' } }, req),
    )
    expect(payload.updateGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: 'home' }))
    expect(payload.update).not.toHaveBeenCalled()
    expect(out.block.heading).toBe('y')
  })

  it('surfaces a refused save with its field errors', async () => {
    const { req, payload } = request(full)
    const refused = Object.assign(new Error('The following field is invalid: heading'), {
      data: { errors: [{ path: 'layout.0.blocks.0.heading', message: 'Required' }] },
    })
    payload.update.mockRejectedValueOnce(refused)
    await expect(
      call(
        'patchBlock',
        { collection: 'pages', id: 6, blockId: 'c1', patch: { heading: '' } },
        req,
      ),
    ).resolves.toMatch(
      /Error: The following field is invalid: heading\n.*layout\.0\.blocks\.0\.heading/,
    )
  })
})
