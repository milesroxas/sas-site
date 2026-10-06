import { describe, expect, it, vi } from 'vitest'
import { insightsSettings, loadSummary } from './client'
import {
  dailyQuery,
  pagesQuery,
  parseDaily,
  parseRanked,
  parseTotals,
  sourcesQuery,
  totalsQuery,
} from './queries'
import { change, formatRate, leadRate, METRICS, metricOf, windowOf } from './summary'

describe('windowOf', () => {
  it('keeps a window the card offers', () => {
    expect(windowOf('30')).toBe(30)
    expect(windowOf(7)).toBe(7)
  })

  it('falls back to the default for anything else', () => {
    expect(windowOf('90')).toBe(7)
    expect(windowOf(undefined)).toBe(7)
    expect(windowOf('7 day; drop')).toBe(7)
  })
})

describe('queries', () => {
  it('read production only, over the window', () => {
    for (const query of [totalsQuery(7), pagesQuery(7), sourcesQuery(7)]) {
      expect(query).toContain("properties.environment = 'production'")
      expect(query).toContain('interval 7 day')
    }
  })

  it('reach back two windows for the comparison', () => {
    expect(totalsQuery(30)).toContain('interval 60 day')
  })

  it('count days from midnight, so both windows are whole calendar days', () => {
    expect(dailyQuery(7)).toContain('toStartOfDay(now()) - interval 13 day')
    expect(dailyQuery(7)).toContain("properties.environment = 'production'")
  })
})

describe('parseDaily', () => {
  // Days ago, visitors, pageviews, leads, today.
  const rows = [
    [0, 4, 9, 1, '2026-10-06'],
    [2, 3, 5, 0, '2026-10-06'],
    [13, 6, 11, 2, '2026-10-06'],
  ]

  it('lines each day up with the same day of the window before, oldest first', () => {
    const trend = parseDaily(rows, 7, '2000-01-01')
    expect(trend).toHaveLength(7)
    expect(trend[0]).toEqual({
      date: '2026-09-30',
      previousDate: '2026-09-23',
      current: { visitors: 0, pageviews: 0, leads: 0 },
      previous: { visitors: 6, pageviews: 11, leads: 2 },
    })
    expect(trend[4]?.current).toEqual({ visitors: 3, pageviews: 5, leads: 0 })
    expect(trend[6]?.date).toBe('2026-10-06')
    expect(trend[6]?.current).toEqual({ visitors: 4, pageviews: 9, leads: 1 })
  })

  it('crosses a month end in calendar arithmetic', () => {
    expect(parseDaily([[0, 1, 1, 0, '2026-03-01']], 7, '2000-01-01')[5]?.date).toBe('2026-02-28')
  })

  it('dates an empty answer from the fallback, as zeros', () => {
    const trend = parseDaily([], 7, '2026-10-06')
    expect(trend.at(-1)?.date).toBe('2026-10-06')
    expect(trend.every((day) => day.current.visitors === 0)).toBe(true)
  })
})

describe('parseTotals', () => {
  it('splits the row into the window and the one before', () => {
    expect(parseTotals([[72, 1195, 11, 40, 800, 5]])).toEqual({
      current: { visitors: 72, pageviews: 1195, leads: 11 },
      previous: { visitors: 40, pageviews: 800, leads: 5 },
    })
  })

  it('reads an empty or malformed result as zeros', () => {
    const zeros = { visitors: 0, pageviews: 0, leads: 0 }
    expect(parseTotals([])).toEqual({ current: zeros, previous: zeros })
    expect(parseTotals(null)).toEqual({ current: zeros, previous: zeros })
    expect(parseTotals([['x', null]]).current).toEqual(zeros)
  })
})

describe('parseRanked', () => {
  it('names direct traffic and drops rows with no label', () => {
    expect(
      parseRanked([
        ['$direct', 30],
        ['google.com', 12],
        [null, 4],
        ['', 2],
      ]),
    ).toEqual([
      { label: 'Direct', count: 30 },
      { label: 'google.com', count: 12 },
    ])
  })
})

describe('change and leadRate', () => {
  it('has nothing to say against an empty window', () => {
    expect(change(10, 0)).toBeNull()
    expect(leadRate({ visitors: 0, pageviews: 0, leads: 0 })).toBeNull()
  })

  it('rounds to a whole percent', () => {
    expect(change(15, 10)).toBe(50)
    expect(change(5, 10)).toBe(-50)
  })
})

describe('metrics', () => {
  const current = { visitors: 100, pageviews: 12_900, leads: 3 }
  const previous = { visitors: 50, pageviews: 12_900, leads: 0 }

  it('compare counts in percent, and from zero in words', () => {
    expect(metricOf('visitors').delta(current, previous).text).toBe('+100%')
    expect(metricOf('pageviews').delta(current, previous)).toEqual({ value: 0, text: '0%' })
    expect(metricOf('leads').delta(current, previous)).toEqual({ value: 1, text: 'from 0' })
    expect(metricOf('leads').delta(previous, previous).value).toBe(0)
  })

  it('format a tile value so it never wraps', () => {
    expect(metricOf('pageviews').format(12_900)).toBe('12.9K')
    expect(metricOf('visitors').format(1284)).toBe('1,284')
  })

  it('count a day with its noun', () => {
    expect(metricOf('leads').counted(1)).toBe('1 lead')
    expect(metricOf('visitors').counted(6)).toBe('6 visitors')
  })

  it('format the lead rate', () => {
    expect(formatRate(0.03)).toBe('3.0%')
    expect(formatRate(0.25)).toBe('25%')
  })

  it('chart the three counts, each a tab', () => {
    expect(METRICS.map((metric) => metric.key)).toEqual(['visitors', 'pageviews', 'leads'])
  })
})

describe('insightsSettings', () => {
  it('is off without the key', () => {
    expect(insightsSettings({} as NodeJS.ProcessEnv)).toBeNull()
  })

  it('queries the app host, not the ingestion host', () => {
    const settings = insightsSettings({
      POSTHOG_PERSONAL_API_KEY: 'phx_test',
      NEXT_PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com',
    } as unknown as NodeJS.ProcessEnv)
    expect(settings).toEqual({
      key: 'phx_test',
      projectId: '512227',
      appHost: 'https://eu.posthog.com',
    })
  })
})

describe('loadSummary', () => {
  const settings = { key: 'phx_test', projectId: '1', appHost: 'https://us.posthog.com' }

  it('asks four questions with the key and filters internal users', async () => {
    const fetcher = vi.fn(async (_url: unknown, init?: RequestInit) => {
      const { query } = JSON.parse(String(init?.body)) as { query: { query: string } }
      const results = query.query.includes('$pathname')
        ? [['/work', 9]]
        : query.query.includes('$referring_domain')
          ? [['$direct', 4]]
          : query.query.includes('dateDiff')
            ? [[0, 3, 9, 1, '2026-10-06']]
            : [[3, 9, 1, 2, 6, 0]]
      return Response.json({ results })
    })
    const summary = await loadSummary(settings, 7, fetcher as unknown as typeof fetch)

    expect(fetcher).toHaveBeenCalledTimes(4)
    const [url, init] = fetcher.mock.calls[0] ?? []
    expect(url).toBe('https://us.posthog.com/api/projects/1/query/')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer phx_test')
    expect(JSON.parse(String(init?.body)).query.filters).toEqual({ filterTestAccounts: true })
    expect(summary.trend.at(-1)).toMatchObject({
      date: '2026-10-06',
      current: { visitors: 3, pageviews: 9, leads: 1 },
    })
    expect({ ...summary, trend: undefined }).toEqual({
      days: 7,
      current: { visitors: 3, pageviews: 9, leads: 1 },
      previous: { visitors: 2, pageviews: 6, leads: 0 },
      trend: undefined,
      pages: [{ label: '/work', count: 9 }],
      sources: [{ label: 'Direct', count: 4 }],
      url: 'https://us.posthog.com/project/1/web',
    })
  })

  it('throws when PostHog refuses, so the failure is not cached', async () => {
    const fetcher = vi.fn(async () => new Response('no', { status: 429 }))
    await expect(loadSummary(settings, 7, fetcher as unknown as typeof fetch)).rejects.toThrow(
      '429',
    )
  })
})
