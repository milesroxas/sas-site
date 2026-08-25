import { describe, expect, it } from 'vitest'
import type { Page, Post } from '@/payload-types'
import { type CmsLinkField, toSiteLink } from './site-link'

const doc = (slug: string) => ({ slug }) as unknown as Page & Post

describe('toSiteLink', () => {
  it('returns null without a link', () => {
    expect(toSiteLink(null)).toBeNull()
    expect(toSiteLink(undefined)).toBeNull()
  })

  it('resolves a pages reference to a root-level href', () => {
    const link: CmsLinkField = {
      type: 'reference',
      label: 'About',
      reference: { relationTo: 'pages', value: doc('about') },
    }
    expect(toSiteLink(link)).toEqual({ label: 'About', href: '/about', newTab: false })
  })

  it('prefixes non-page references with their collection', () => {
    const link: CmsLinkField = {
      type: 'reference',
      label: 'Post',
      reference: { relationTo: 'posts', value: doc('hello') },
    }
    expect(toSiteLink(link)?.href).toBe('/posts/hello')
  })

  it('resolves site pages to their singleton paths', () => {
    expect(toSiteLink({ type: 'site', label: 'Home', sitePage: 'home' })?.href).toBe('/')
    expect(toSiteLink({ type: 'site', label: 'Work', sitePage: 'works-index' })?.href).toBe(
      '/works',
    )
    expect(toSiteLink({ type: 'site', label: 'Insights', sitePage: 'insights-index' })?.href).toBe(
      '/insights',
    )
  })

  it('falls back to the raw url for custom links and unpopulated references', () => {
    expect(toSiteLink({ type: 'custom', label: 'Contact', url: '/contact', newTab: true })).toEqual(
      { label: 'Contact', href: '/contact', newTab: true },
    )
    expect(
      toSiteLink({
        type: 'reference',
        label: 'Draft',
        reference: { relationTo: 'pages', value: 7 },
        url: '/fallback',
      })?.href,
    ).toBe('/fallback')
  })

  it('returns null when no href resolves', () => {
    expect(toSiteLink({ type: 'custom', label: 'Broken' })).toBeNull()
  })
})
