// @vitest-environment node
// Node, not jsdom: jsdom's Blob and FormData do not serialize into Node's Request,
// and the upload would arrive as the literal string "undefined".
import { createPayloadRequest, getPayload, type Payload, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { agentMediaEndpoint } from '@/endpoints/agentMedia'
import config from '@/payload.config'
import type { User } from '@/payload-types'

/**
 * POST /api/agent/media against the real config: real multipart parsing, real
 * key lookups, real image cleaning. Only the final media write is intercepted,
 * because media storage is the shared bucket; the test asserts exactly what
 * would have been written and as whom.
 */

const suffix = `agent-media-${Date.now()}`
const KEYS = 'payload-mcp-api-keys'
const allowedKey = crypto.randomUUID()
const readOnlyKey = crypto.randomUUID()

describe.sequential('POST /api/agent/media', () => {
  let payload: Payload
  let user: User
  let jpeg: Buffer
  let libraryId: number
  const keyIds: (number | string)[] = []
  const written = vi.fn()

  const post = async (options: {
    alt?: string
    extra?: Record<string, unknown>
    file?: Buffer | null
    key?: string
  }): Promise<Response> => {
    const form = new FormData()
    const file = options.file === undefined ? jpeg : options.file
    if (file) form.set('file', new Blob([new Uint8Array(file)], { type: 'image/jpeg' }), 'shot.jpg')
    form.set(
      '_payload',
      JSON.stringify({ alt: options.alt, assetLibrary: libraryId, ...options.extra }),
    )
    const request = new Request('http://localhost/api/agent/media', {
      body: form,
      headers: options.key ? { Authorization: `Bearer ${options.key}` } : {},
      method: 'POST',
    })
    const req: PayloadRequest = await createPayloadRequest({ config, request })
    return agentMediaEndpoint.handler(req)
  }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    user = await payload.create({
      collection: 'users',
      data: { email: `${suffix}@example.com`, password: 'testing123' },
    })
    for (const [apiKey, uploadMedia] of [
      [allowedKey, true],
      [readOnlyKey, false],
    ] as const) {
      const key = await payload.create({
        collection: KEYS,
        data: {
          apiKey,
          enableAPIKey: true,
          label: `${suffix}-${uploadMedia}`,
          uploadMedia,
          user: user.id,
        },
      } as never)
      keyIds.push(key.id)
    }
    const { docs } = await payload.find({ collection: 'asset-libraries', depth: 0, limit: 1 })
    if (!docs[0])
      throw new Error('The dev database has no Asset Library to file the test upload under.')
    libraryId = docs[0].id
    // A photo with the kind of metadata a screenshot tool or a phone leaves behind.
    jpeg = await sharp({ create: { background: '#888', channels: 3, height: 40, width: 60 } })
      .jpeg()
      .withExif({ IFD0: { Artist: 'someone@example.com', Copyright: 'internal only' } })
      .toBuffer()

    const create = payload.create.bind(payload)
    vi.spyOn(payload, 'create').mockImplementation(((args: {
      collection: string
      data: { usageStatus?: string }
    }) => {
      if (args.collection !== 'media') return create(args as never)
      written(args)
      return Promise.resolve({ id: 4242, usageStatus: args.data.usageStatus })
    }) as never)
  })

  afterAll(async () => {
    vi.restoreAllMocks()
    if (!payload) return
    for (const id of keyIds) await payload.delete({ collection: KEYS, id })
    if (user) await payload.delete({ collection: 'users', id: user.id })
  })

  it('refuses a request with no key, an unknown key, and a key without the capability', async () => {
    await expect(post({ alt: 'A shot' })).rejects.toMatchObject({ status: 401 })
    await expect(post({ alt: 'A shot', key: crypto.randomUUID() })).rejects.toMatchObject({
      status: 401,
    })
    await expect(post({ alt: 'A shot', key: readOnlyKey })).rejects.toMatchObject({
      message: expect.stringContaining('"Upload media"'),
      status: 403,
    })
    expect(written).not.toHaveBeenCalled()
  })

  it('requires alt text, an Asset Library that exists, and a file', async () => {
    await expect(post({ alt: '   ', key: allowedKey })).rejects.toMatchObject({ status: 400 })
    await expect(
      post({ alt: 'A shot', extra: { assetLibrary: undefined }, key: allowedKey }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('assetLibrary is required'),
      status: 400,
    })
    await expect(
      post({ alt: 'A shot', extra: { assetLibrary: 2_000_000_000 }, key: allowedKey }),
    ).rejects.toMatchObject({ message: 'No Asset Library with id 2000000000.', status: 400 })
    await expect(post({ alt: 'A shot', file: null, key: allowedKey })).rejects.toMatchObject({
      status: 400,
    })
    expect(written).not.toHaveBeenCalled()
  })

  it('decides the type from the bytes, whatever the request claims', async () => {
    const notAnImage = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    )
    await expect(post({ alt: 'A shot', file: notAnImage, key: allowedKey })).rejects.toMatchObject({
      status: 415,
    })
    expect(written).not.toHaveBeenCalled()
  })

  it('writes as the linked team member, internal, with the metadata gone', async () => {
    expect((await sharp(jpeg).metadata()).exif).toBeDefined()

    const response = await post({
      alt: '  The Studio inspector  ',
      // Nothing outside the allowlist is read: a client cannot ask for public.
      extra: { caption: 'Relief group open', usageStatus: 'public-approved', allChannels: true },
      key: allowedKey,
    })
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ id: 4242, usageStatus: 'internal' })

    const [args] = written.mock.calls.at(-1) ?? []
    expect(args).toMatchObject({ collection: 'media', overrideAccess: false })
    expect(Object.keys(args.data).sort()).toEqual(['alt', 'assetLibrary', 'caption', 'usageStatus'])
    expect(args.data).toMatchObject({
      alt: 'The Studio inspector',
      assetLibrary: libraryId,
      usageStatus: 'internal',
    })
    expect(args.req.user).toMatchObject({ collection: 'users', id: user.id })
    expect(args.file).toMatchObject({ mimetype: 'image/jpeg', size: args.file.data.length })
    expect((await sharp(args.file.data).metadata()).exif).toBeUndefined()
  })
})
