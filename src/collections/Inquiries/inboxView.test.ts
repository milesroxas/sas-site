import { describe, expect, it } from 'vitest'
import { inboxRedirect } from './inboxView'

const at = (path: string) => new URL(path, 'https://www.suits-sandals.com')

describe('inboxRedirect', () => {
  it('opens the bare list on the inbox, keeping the other params', () => {
    const next = inboxRedirect(at('/admin/collections/inquiries?limit=25&search=acme'))
    expect(next?.pathname).toBe('/admin/collections/inquiries')
    expect(next?.searchParams.get('where[status][not_equals]')).toBe('spam')
    expect(next?.searchParams.get('limit')).toBe('25')
    expect(next?.searchParams.get('search')).toBe('acme')
  })

  it('accepts a trailing slash', () => {
    expect(inboxRedirect(at('/admin/collections/inquiries/'))).not.toBeNull()
  })

  it('lets any chosen filter through, including the spam view', () => {
    expect(inboxRedirect(at('/admin/collections/inquiries?where[status][equals]=spam'))).toBeNull()
    expect(
      inboxRedirect(at('/admin/collections/inquiries?where%5Bor%5D%5B0%5D%5Band%5D=x')),
    ).toBeNull()
  })

  it('leaves documents and other collections alone', () => {
    expect(inboxRedirect(at('/admin/collections/inquiries/12'))).toBeNull()
    expect(inboxRedirect(at('/admin/collections/inquiries/create'))).toBeNull()
    expect(inboxRedirect(at('/admin/collections/blocked-senders'))).toBeNull()
  })
})
