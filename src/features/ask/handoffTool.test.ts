import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import type { SiteInfo } from '@/payload-types'
import { resolveAskHandoff } from './handoffTool'

const siteInfo = {
  inquiries: { responseTime: 'within 3 business days', scheduleUrl: 'https://cal.example/s' },
} as SiteInfo

/** A Local API stub whose contact pages answer `find` by the form's inquiry type. */
const payloadWith = (slugs: Record<string, string>) => {
  const find = vi.fn(async ({ where }: { where: { 'form.inquiryType': { equals: string } } }) => ({
    docs: slugs[where['form.inquiryType'].equals]
      ? [{ slug: slugs[where['form.inquiryType'].equals] }]
      : [],
  }))
  return { payload: { find, logger: { error: vi.fn() } } as unknown as Payload, find }
}

describe('resolveAskHandoff', () => {
  it('sends an estimate to the page whose form files project inquiries', async () => {
    const { payload, find } = payloadWith({ project: 'project-inquiry', general: 'contact' })
    const handoff = await resolveAskHandoff(payload, siteInfo, 'estimate')
    expect(handoff).toEqual({
      reason: 'estimate',
      href: '/contact/project-inquiry',
      responseTime: 'within 3 business days',
      scheduleUrl: 'https://cal.example/s',
    })
    // Read as a visitor would: published pages only.
    expect(find.mock.calls[0]?.[0]).toMatchObject({ overrideAccess: false })
  })

  it('sends a person to the general form, which is the contact index', async () => {
    const { payload } = payloadWith({ project: 'project-inquiry', general: 'contact' })
    expect((await resolveAskHandoff(payload, siteInfo, 'person')).href).toBe('/contact')
  })

  it('falls back to the general contact page when no form matches or the read fails', async () => {
    const { payload } = payloadWith({})
    expect((await resolveAskHandoff(payload, siteInfo, 'estimate')).href).toBe('/contact')

    const failing = {
      find: vi.fn().mockRejectedValue(new Error('db down')),
      logger: { error: vi.fn() },
    } as unknown as Payload
    expect((await resolveAskHandoff(failing, siteInfo, 'project')).href).toBe('/contact')
  })

  it('leaves the booking link out and keeps a reply promise when Site Info is empty', async () => {
    const { payload } = payloadWith({ general: 'contact' })
    const handoff = await resolveAskHandoff(
      payload,
      { inquiries: { responseTime: '', scheduleUrl: '' } } as SiteInfo,
      'no_answer',
    )
    expect(handoff.scheduleUrl).toBeNull()
    expect(handoff.responseTime).toBe('shortly')
  })
})
