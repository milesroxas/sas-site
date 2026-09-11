import { describe, expect, it } from 'vitest'
import type { SiteInfo } from '@/payload-types'
import { resolveAskHandoff } from './handoffTool'

describe('resolveAskHandoff', () => {
  it("carries Site Info's reply promise and booking link to the card", () => {
    const siteInfo = {
      inquiries: { responseTime: 'within 3 business days', scheduleUrl: 'https://cal.example/s' },
    } as SiteInfo
    expect(resolveAskHandoff(siteInfo, 'estimate')).toEqual({
      reason: 'estimate',
      responseTime: 'within 3 business days',
      scheduleUrl: 'https://cal.example/s',
    })
  })

  it('leaves the booking link out and keeps a reply promise when Site Info is empty', () => {
    const handoff = resolveAskHandoff(
      { inquiries: { responseTime: '', scheduleUrl: '' } } as SiteInfo,
      'no_answer',
    )
    expect(handoff.scheduleUrl).toBeNull()
    expect(handoff.responseTime).toBe('shortly')
  })
})
