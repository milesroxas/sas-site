import { describe, expect, it } from 'vitest'
import { buildUsageReport, windowStart } from './usage'

const DAY = 86_400_000
/** 2026-09-08T15:00Z: the 8th, so month-to-date is shorter than 30 days. */
const NOW = Date.UTC(2026, 8, 8, 15)
const day = (offset: number) => Math.floor((Date.UTC(2026, 8, 8) + offset * DAY) / 1000)

const cost = (start: number, results: { amount: number; lineItem?: string | null }[]) => ({
  start_time: start,
  end_time: start + DAY / 1000,
  results: results.map((r) => ({
    amount: { value: r.amount, currency: 'usd' },
    line_item: r.lineItem ?? null,
  })),
})

describe('windowStart', () => {
  it('reaches back 30 days when that covers the month start', () => {
    expect(new Date(windowStart(NOW)).toISOString().slice(0, 10)).toBe('2026-08-10')
  })

  it('reaches back to the 1st when the month is longer than 30 days so far', () => {
    const jan31 = Date.UTC(2026, 0, 31, 9)
    expect(new Date(windowStart(jan31)).toISOString().slice(0, 10)).toBe('2026-01-01')
  })
})

describe('buildUsageReport', () => {
  it('splits spend into month-to-date and last 30 days and ranks line items', () => {
    const report = buildUsageReport({
      nowMs: NOW,
      projectId: null,
      costs: [
        cost(day(-20), [{ amount: 1.5, lineItem: 'gpt-5-mini, input' }]),
        cost(day(-7), [{ amount: 0.5, lineItem: 'gpt-5-mini, input' }]),
        cost(day(0), [
          { amount: 0.25, lineItem: 'text-embedding-3-small' },
          { amount: 2, lineItem: 'gpt-5-mini, output' },
        ]),
      ],
      completions: [],
      embeddings: [],
    })

    expect(report.window).toEqual({ start: '2026-08-10', end: '2026-09-08' })
    expect(report.spend.last30Days).toBeCloseTo(4.25)
    expect(report.spend.monthToDate).toBeCloseTo(2.75)
    expect(report.spend.byLineItem).toEqual([
      { lineItem: 'gpt-5-mini, input', amount: 2 },
      { lineItem: 'gpt-5-mini, output', amount: 2 },
      { lineItem: 'text-embedding-3-small', amount: 0.25 },
    ])
    expect(report.spend.byDay.map((d) => d.date)).toEqual([
      '2026-08-19',
      '2026-09-01',
      '2026-09-08',
    ])
  })

  it('sums tokens per model across days and labels missing models', () => {
    const report = buildUsageReport({
      nowMs: NOW,
      projectId: 'proj_1',
      costs: [],
      completions: [
        {
          start_time: day(-1),
          end_time: day(0),
          results: [
            {
              model: 'gpt-5-mini',
              input_tokens: 100,
              input_cached_tokens: 20,
              output_tokens: 40,
              num_model_requests: 2,
            },
          ],
        },
        {
          start_time: day(0),
          end_time: day(1),
          results: [
            { model: 'gpt-5-mini', input_tokens: 50, output_tokens: 10, num_model_requests: 1 },
            { model: null, input_tokens: 5, output_tokens: 1, num_model_requests: 1 },
          ],
        },
      ],
      embeddings: [
        {
          start_time: day(0),
          end_time: day(1),
          results: [{ model: 'text-embedding-3-small', input_tokens: 900, num_model_requests: 3 }],
        },
      ],
    })

    expect(report.projectId).toBe('proj_1')
    expect(report.completions).toMatchObject({
      inputTokens: 155,
      cachedInputTokens: 20,
      outputTokens: 51,
      requests: 4,
    })
    expect(report.completions.byModel).toEqual([
      {
        model: 'gpt-5-mini',
        inputTokens: 150,
        cachedInputTokens: 20,
        outputTokens: 50,
        requests: 3,
      },
      { model: 'unknown', inputTokens: 5, cachedInputTokens: 0, outputTokens: 1, requests: 1 },
    ])
    expect(report.embeddings).toEqual({
      inputTokens: 900,
      requests: 3,
      byModel: [{ model: 'text-embedding-3-small', inputTokens: 900, requests: 3 }],
    })
  })
})
