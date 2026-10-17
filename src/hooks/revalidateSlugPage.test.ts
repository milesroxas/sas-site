import { beforeEach, describe, expect, it, vi } from 'vitest'

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))
vi.mock('next/cache.js', () => ({ revalidatePath, revalidateTag }))

import { slugPageRevalidation } from './revalidateSlugPage'

type Doc = { id: number; slug?: string | null; _status?: 'draft' | 'published' | null }

const { afterChange } = slugPageRevalidation<Doc>({
  basePath: '/posts',
  label: 'Post',
  revalidateIndex: true,
  sitemapTag: 'posts-sitemap',
})

/** Runs the hook with a stored slug the fallback read would return. */
const run = (doc: Doc, previousDoc: Doc | undefined, storedSlug: string | null = null) => {
  const findByID = vi.fn().mockResolvedValue(storedSlug ? { id: doc.id, slug: storedSlug } : null)
  const req = {
    context: {},
    payload: { findByID, logger: { info: vi.fn(), warn: vi.fn() } },
  }
  // biome-ignore lint/suspicious/noExplicitAny: a minimal stand-in for the hook args
  const args = { collection: { slug: 'posts' }, doc, previousDoc, req } as any
  return { result: afterChange(args), findByID }
}

const purgedPaths = () => revalidatePath.mock.calls.map(([path]) => path)

describe('slugPageRevalidation afterChange', () => {
  beforeEach(() => {
    revalidatePath.mockClear()
    revalidateTag.mockClear()
  })

  it('purges the published page by its slug', async () => {
    await run({ id: 1, slug: 'a-post', _status: 'published' }, undefined).result
    expect(purgedPaths()).toContain('/posts/a-post')
  })

  it('reads the slug when a selected write returns neither doc with one', async () => {
    const { result, findByID } = run(
      { id: 18, _status: 'published' },
      { id: 18, _status: 'published' },
      'top-30-agencies',
    )
    await result
    expect(findByID).toHaveBeenCalledOnce()
    expect(purgedPaths()).toContain('/posts/top-30-agencies')
    expect(purgedPaths()).not.toContain('/posts/undefined')
  })

  it('uses the previous slug before reading the database', async () => {
    const { result, findByID } = run(
      { id: 3, _status: 'published' },
      { id: 3, slug: 'kept', _status: 'published' },
    )
    await result
    expect(findByID).not.toHaveBeenCalled()
    expect(purgedPaths()).toContain('/posts/kept')
  })

  it('never purges an undefined path when no slug can be found', async () => {
    await run({ id: 9, _status: 'published' }, undefined, null).result
    expect(purgedPaths()).not.toContain('/posts/undefined')
    expect(purgedPaths()).toContain('/posts')
  })

  it('still purges the old path when a published slug moves', async () => {
    await run(
      { id: 4, slug: 'new', _status: 'published' },
      { id: 4, slug: 'old', _status: 'published' },
    ).result
    expect(purgedPaths()).toEqual(expect.arrayContaining(['/posts/new', '/posts/old']))
  })
})

describe('slugPageRevalidation consumer paths', () => {
  const hooks = slugPageRevalidation<Doc>({
    basePath: '/posts',
    consumerPaths: ['/posts/[slug]', '/[slug]', '/'],
    label: 'Post',
    revalidateIndex: true,
    sitemapTag: 'posts-sitemap',
  })

  const req = {
    context: {},
    payload: { findByID: vi.fn(), logger: { info: vi.fn(), warn: vi.fn() } },
  } as unknown as Parameters<typeof hooks.afterChange>[0]['req']

  const runAfterChange = (doc: Doc, previousDoc?: Doc, request = req) =>
    hooks.afterChange({
      doc,
      previousDoc: previousDoc as Doc,
      req: request,
      collection: { slug: 'posts' } as never,
      context: request.context,
      data: {},
      operation: 'update',
    })

  beforeEach(() => {
    revalidatePath.mockReset()
    revalidateTag.mockReset()
  })

  it('purges the consumer routes alongside the document when it is unpublished', async () => {
    await runAfterChange(
      { id: 1, slug: 'hello', _status: 'draft' },
      { id: 1, slug: 'hello', _status: 'published' },
    )

    expect(revalidatePath).toHaveBeenCalledWith('/posts/hello')
    expect(revalidatePath).toHaveBeenCalledWith('/posts')
    expect(revalidatePath).toHaveBeenCalledWith('/posts/[slug]', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/[slug]', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidateTag).toHaveBeenCalledWith('posts-sitemap', 'max')
  })

  it('purges the consumer routes when a document publishes', async () => {
    await runAfterChange(
      { id: 1, slug: 'hello', _status: 'published' },
      { id: 1, slug: 'hello', _status: 'draft' },
    )

    expect(revalidatePath).toHaveBeenCalledWith('/posts/[slug]', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('leaves the cache alone for a draft save on a never-published document', async () => {
    await runAfterChange(
      { id: 1, slug: 'hello', _status: 'draft' },
      { id: 1, slug: 'hello', _status: 'draft' },
    )

    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('purges the consumer routes on delete', () => {
    hooks.afterDelete({
      doc: { id: 1, slug: 'hello', _status: 'published' },
      req,
      id: 1,
      collection: {} as never,
      context: {},
    })

    expect(revalidatePath).toHaveBeenCalledWith('/posts/hello')
    expect(revalidatePath).toHaveBeenCalledWith('/[slug]', 'page')
  })

  it('skips every purge when revalidation is disabled for the request', async () => {
    const quiet = { ...req, context: { disableRevalidate: true } } as typeof req
    await runAfterChange(
      { id: 1, slug: 'hello', _status: 'draft' },
      { id: 1, slug: 'hello', _status: 'published' },
      quiet,
    )

    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
