import { beforeEach, describe, expect, it, vi } from 'vitest'
import { slugPageRevalidation } from './revalidateSlugPage'

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('next/cache.js', () => ({ revalidatePath, revalidateTag }))

type Doc = { id: number; slug?: string | null; _status?: 'draft' | 'published' | null }

const hooks = slugPageRevalidation<Doc>({
  basePath: '/posts',
  consumerPaths: ['/posts/[slug]', '/[slug]', '/'],
  label: 'Post',
  revalidateIndex: true,
  sitemapTag: 'posts-sitemap',
})

const req = {
  context: {},
  payload: { logger: { info: vi.fn() } },
} as unknown as Parameters<typeof hooks.afterChange>[0]['req']

const runAfterChange = (doc: Doc, previousDoc?: Doc) =>
  hooks.afterChange({
    doc,
    previousDoc: previousDoc as Doc,
    req,
    collection: {} as never,
    context: {},
    data: {},
    operation: 'update',
  })

describe('slugPageRevalidation consumer paths', () => {
  beforeEach(() => {
    revalidatePath.mockReset()
    revalidateTag.mockReset()
  })

  it('purges the consumer routes alongside the document when it is unpublished', () => {
    runAfterChange(
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

  it('purges the consumer routes when a document publishes', () => {
    runAfterChange(
      { id: 1, slug: 'hello', _status: 'published' },
      { id: 1, slug: 'hello', _status: 'draft' },
    )

    expect(revalidatePath).toHaveBeenCalledWith('/posts/[slug]', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('leaves the cache alone for a draft save on a never-published document', () => {
    runAfterChange(
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

  it('skips every purge when revalidation is disabled for the request', () => {
    const quiet = { ...req, context: { disableRevalidate: true } } as typeof req
    hooks.afterChange({
      doc: { id: 1, slug: 'hello', _status: 'draft' },
      previousDoc: { id: 1, slug: 'hello', _status: 'published' },
      req: quiet,
      collection: {} as never,
      context: quiet.context,
      data: {},
      operation: 'update',
    })

    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
