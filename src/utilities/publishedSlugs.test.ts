import { beforeEach, describe, expect, it, vi } from 'vitest'

const { find, cacheOptions } = vi.hoisted(() => ({
  find: vi.fn(),
  cacheOptions: [] as { keys: string[]; tags?: string[] }[],
}))

vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))
vi.mock('next/cache.js', () => ({
  unstable_cache: (fn: () => unknown, keys: string[], options?: { tags?: string[] }) => {
    cacheOptions.push({ keys, tags: options?.tags })
    return fn
  },
}))

import { isPublishedSlug, SLUG_SET_TAGS } from './publishedSlugs'

describe('isPublishedSlug', () => {
  beforeEach(() => {
    find.mockReset()
    cacheOptions.length = 0
    find.mockResolvedValue({ docs: [{ slug: 'about' }, { slug: null }, { slug: 'team' }] })
  })

  it('answers from the published slugs, with access enforced and drafts excluded', async () => {
    expect(await isPublishedSlug('pages', 'about')).toBe(true)
    expect(await isPublishedSlug('pages', 'wp-login.php')).toBe(false)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        draft: false,
        overrideAccess: false,
        select: { slug: true },
      }),
    )
  })

  it('caches each collection under its sitemap tag, which the publish hooks purge', async () => {
    await isPublishedSlug('work-pages', 'anything')
    expect(cacheOptions.at(-1)).toEqual({
      keys: ['published-slugs', 'work-pages'],
      tags: [SLUG_SET_TAGS['work-pages']],
    })
  })
})
