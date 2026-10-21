import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Redirect } from '@/payload-types'
import {
  pushBulkRedirects,
  redirectSyncEnabled,
  syncVercelRedirects,
  toBulkRedirects,
} from './syncVercelRedirects'

const doc = (value: Record<string, unknown>): Redirect => value as unknown as Redirect

const custom = (from: string, url: string) => doc({ from, to: { type: 'custom', url } })

const reference = (from: string, relationTo: string, value: unknown) =>
  doc({ from, to: { type: 'reference', reference: { relationTo, value } } })

const productionEnv = () => {
  vi.stubEnv('VERCEL_ENV', 'production')
  vi.stubEnv('VERCEL_TOKEN', 'tok')
  vi.stubEnv('VERCEL_TEAM_ID', 'team_1')
  vi.stubEnv('VERCEL_PROJECT_ID', 'prj_1')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('toBulkRedirects', () => {
  it('maps custom urls and referenced documents through the content surfaces', () => {
    const warn = vi.fn()
    const rules = toBulkRedirects(
      [
        custom('/blog', '/insights'),
        custom('/old', 'https://example.com/new'),
        reference('/portfolio-work/adacore', 'work-pages', { id: 1, slug: 'adacore' }),
        reference('/nick-dank', 'pages', { id: 2, slug: 'about-us' }),
      ],
      warn,
    )
    const expected = [
      { source: '/blog', destination: '/insights' },
      { source: '/old', destination: 'https://example.com/new' },
      { source: '/portfolio-work/adacore', destination: '/works/adacore' },
      { source: '/nick-dank', destination: '/about-us' },
    ]
    expect(rules).toEqual(
      [...expected, ...expected.map((rule) => ({ ...rule, source: `${rule.source}/` }))].map(
        (rule) => ({ ...rule, permanent: true, preserveQueryParams: true }),
      ),
    )
    expect(warn).not.toHaveBeenCalled()
  })

  it('drops rules it cannot serve and says why', () => {
    const warn = vi.fn()
    const rules = toBulkRedirects(
      [
        custom('blog', '/insights'),
        custom('/services', 'expertise'),
        reference('/portfolio', 'work-pages', 7),
        reference('/lab-old', 'unknown-collection', { id: 1, slug: 'x' }),
        custom('/loop', '/loop'),
        custom('/twice', '/a'),
        custom('/twice', '/b'),
      ],
      warn,
    )
    expect(rules).toEqual([
      { source: '/twice', destination: '/a', permanent: true, preserveQueryParams: true },
      { source: '/twice/', destination: '/a', permanent: true, preserveQueryParams: true },
    ])
    expect(warn.mock.calls.map(([message]) => message)).toEqual([
      'Redirects: skipped "blog", the from path must start with /',
      'Redirects: skipped "/services", its destination does not resolve',
      'Redirects: skipped "/portfolio", its destination does not resolve',
      'Redirects: skipped "/lab-old", its destination does not resolve',
      'Redirects: skipped "/loop", it points at itself',
      'Redirects: skipped a second rule for "/twice"',
    ])
  })

  it('lets a rule written with the trailing slash win over the twin', () => {
    const rules = toBulkRedirects(
      [custom('/blog', '/insights'), custom('/blog/', '/insights/archive'), custom('/', '/home')],
      vi.fn(),
    )
    expect(rules.map((rule) => [rule.source, rule.destination])).toEqual([
      ['/blog', '/insights'],
      ['/blog/', '/insights/archive'],
      ['/', '/home'],
    ])
  })
})

describe('redirectSyncEnabled', () => {
  it('is on only in production with the token and team id set', () => {
    productionEnv()
    expect(redirectSyncEnabled()).toBe(true)

    vi.stubEnv('VERCEL_ENV', 'preview')
    expect(redirectSyncEnabled()).toBe(false)

    productionEnv()
    vi.stubEnv('VERCEL_TOKEN', '')
    expect(redirectSyncEnabled()).toBe(false)
  })
})

describe('pushBulkRedirects', () => {
  const rules = [
    { source: '/blog', destination: '/insights', permanent: true, preserveQueryParams: true },
  ] as const

  beforeEach(productionEnv)

  it('stages the list with overwrite, then promotes the staged version', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ version: { id: 'ver_staged' } })))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ version: { id: 'ver_staged', redirectCount: 1 } })),
      )
    vi.stubGlobal('fetch', fetch)

    await expect(pushBulkRedirects([...rules])).resolves.toEqual({
      id: 'ver_staged',
      redirectCount: 1,
    })

    const [stageUrl, stageInit] = fetch.mock.calls[0] as [URL, RequestInit]
    expect(stageUrl.toString()).toBe('https://api.vercel.com/v1/bulk-redirects?teamId=team_1')
    expect(stageInit.method).toBe('PUT')
    expect((stageInit.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    expect(JSON.parse(stageInit.body as string)).toMatchObject({
      projectId: 'prj_1',
      teamId: 'team_1',
      overwrite: true,
      redirects: rules,
    })

    const [promoteUrl, promoteInit] = fetch.mock.calls[1] as [URL, RequestInit]
    expect(promoteUrl.toString()).toBe(
      'https://api.vercel.com/v1/bulk-redirects/versions?projectId=prj_1&teamId=team_1',
    )
    expect(promoteInit.method).toBe('POST')
    expect(JSON.parse(promoteInit.body as string)).toEqual({ id: 'ver_staged', action: 'promote' })
  })

  it('throws on a refused stage and never promotes', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('slow down', { status: 429 }))
    vi.stubGlobal('fetch', fetch)

    await expect(pushBulkRedirects([...rules])).rejects.toThrow(
      'PUT /v1/bulk-redirects answered 429: slow down',
    )
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('syncVercelRedirects', () => {
  const request = (docs: Redirect[]) => {
    const find = vi.fn().mockResolvedValue({ docs })
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    // biome-ignore lint/suspicious/noExplicitAny: a minimal stand-in for the request
    const req = { payload: { find, logger } } as any
    return { req, find, logger }
  }

  it('does nothing outside production', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    const { req, find, logger } = request([])
    await syncVercelRedirects(req)
    expect(find).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('sync is off'))
  })

  it('reads the list through the request and reports the live version', async () => {
    productionEnv()
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ version: { id: 'ver_1' } })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ version: { id: 'ver_1' } })))
    vi.stubGlobal('fetch', fetch)
    const { req, find, logger } = request([custom('/blog', '/insights')])

    await syncVercelRedirects(req)

    expect(find).toHaveBeenCalledWith({
      collection: 'redirects',
      depth: 1,
      limit: 0,
      pagination: false,
      req,
    })
    expect(logger.info).toHaveBeenCalledWith(
      'Redirects: 1 rules (2 with trailing-slash twins) live on Vercel, version ver_1',
    )
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('keeps the save and logs when Vercel refuses the push', async () => {
    productionEnv()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 403 })))
    const { req, logger } = request([custom('/blog', '/insights')])

    await expect(syncVercelRedirects(req)).resolves.toBeUndefined()
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ msg: expect.stringContaining('Vercel sync failed') }),
    )
  })
})
