import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { extractDocMarkdown, extractGlobalMarkdown } from './extract'
import type { ContentSurface, GlobalSurface } from './surfaces'

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', text }] }],
  },
})

/**
 * A Local API stand-in: `find` answers from a fixture table keyed by
 * collection and records every call, so the tests can assert that hydration
 * runs as the anonymous public (access on, published only) and batches by
 * collection.
 */
function stubPayload(tables: Record<string, Record<string, unknown>[]>) {
  const find = vi.fn(
    async ({ collection, where }: { collection: string; where: { id: { in: number[] } } }) => {
      const ids = new Set(where.id.in)
      const docs = (tables[collection] ?? []).filter((doc) => ids.has(doc.id as number))
      return { docs }
    },
  )
  const findGlobal = vi.fn(async ({ slug }: { slug: string }) => tables[slug]?.[0] ?? {})
  return { payload: { find, findGlobal } as unknown as Payload, find, findGlobal }
}

const walkSurface: ContentSurface = {
  collection: 'pages',
  title: 'Pages',
  urlPrefix: '',
  body: { kind: 'walk' },
}

describe('extractDocMarkdown', () => {
  it('walks allowlisted copy, skips enums, links, and internal fields', async () => {
    const { payload, find } = stubPayload({})
    const markdown = await extractDocMarkdown(payload, walkSurface, {
      title: 'Services',
      meta: { description: 'What we do.' },
      hero: { type: 'highImpact', eyebrow: 'Studio', lead: 'We design and build.' },
      layout: [
        {
          blockType: 'content',
          theme: 'dark',
          richText: paragraph('Body copy.'),
          link: { url: 'https://example.com', label: 'Nope' },
          internalNotes: 'never',
        },
      ],
    } as never)

    expect(markdown).toBe(
      ['# Services', 'What we do.', 'Studio', 'We design and build.', 'Body copy.'].join('\n\n'),
    )
    expect(find).not.toHaveBeenCalled()
  })

  it('hydrates relationships as the public and renders their substance in walk order', async () => {
    const { payload, find } = stubPayload({
      testimonials: [
        {
          id: 7,
          quote: paragraph('They shipped fast.'),
          speakerName: 'Ada',
          speakerRole: 'CTO',
          speakerOrganization: 'Acme',
        },
      ],
      projects: [
        {
          id: 3,
          publicTitle: 'Acme replatform',
          organization: 9,
          industries: [1],
          capabilities: [2],
          publicSummary: paragraph('A storefront rebuild.'),
          deliverables: [{ title: 'Design system', description: 'Tokens and components' }],
        },
      ],
      organizations: [{ id: 9, name: 'Acme Inc' }],
      industries: [{ id: 1, name: 'Retail' }],
      capabilities: [{ id: 2, name: 'Web design' }],
    })

    const markdown = await extractDocMarkdown(payload, walkSurface, {
      title: 'Case',
      project: 3,
      featuredCapabilities: [2],
      layout: [{ blockType: 'testimonialsMarquee', testimonials: [7, 7] }],
    } as never)

    expect(markdown).toBe(
      [
        '# Case',
        [
          'Client: Acme Inc',
          'Project: Acme replatform',
          'Industries: Retail',
          'Capabilities: Web design',
          'A storefront rebuild.',
          'Deliverables:\n- Design system: Tokens and components',
        ].join('\n'),
        'Capabilities: Web design',
        'Ada, CTO, Acme said:\n> They shipped fast.',
      ].join('\n\n'),
    )

    // Every hydration is an anonymous, published-only read, batched per
    // collection (five here: no platform ids, so no platforms query).
    expect(find).toHaveBeenCalledTimes(5)
    for (const call of find.mock.calls) {
      expect(call[0]).toMatchObject({ depth: 0, draft: false, overrideAccess: false })
    }
    const testimonialCall = find.mock.calls.find((call) => call[0].collection === 'testimonials')
    expect(testimonialCall?.[0].where).toEqual({ id: { in: [7] } })
  })

  it('drops relationships the public cannot read', async () => {
    const { payload } = stubPayload({ testimonials: [] })
    const markdown = await extractDocMarkdown(payload, walkSurface, {
      title: 'Case',
      layout: [{ blockType: 'testimonialsMarquee', testimonials: [7] }],
    } as never)
    expect(markdown).toBe('# Case')
  })

  it('renders only publicly approved metrics and contact details as compact lines', async () => {
    const { payload } = stubPayload({})
    const markdown = await extractDocMarkdown(payload, walkSurface, {
      title: 'Evidence',
      metrics: [
        {
          label: 'Conversion',
          value: '40',
          unit: '%',
          qualifier: 'lift',
          timeframe: '90 days',
          approvedForPublic: true,
        },
        { label: 'Revenue', value: '2x', approvedForPublic: false },
      ],
      details: [{ term: 'Hours', value: '9 to 5 ET' }],
    } as never)

    expect(markdown).toBe(
      ['# Evidence', 'Results:\n- Conversion: 40 % (lift; 90 days)', '- Hours: 9 to 5 ET'].join(
        '\n\n',
      ),
    )
  })

  it('hydrates the canonical record with access applied', async () => {
    const { payload, find } = stubPayload({
      'case-studies': [{ id: 5, title: 'Study', thesis: 'Big idea.' }],
    })
    const surface: ContentSurface = {
      ...walkSurface,
      collection: 'work-pages',
      body: { kind: 'walk', canonicalField: { name: 'caseStudy', collection: 'case-studies' } },
    }
    const markdown = await extractDocMarkdown(payload, surface, {
      title: 'Work',
      caseStudy: 5,
    } as never)

    expect(markdown).toBe(['# Work', '## Study', 'Big idea.'].join('\n\n'))
    expect(find.mock.calls[0][0]).toMatchObject({
      collection: 'case-studies',
      overrideAccess: false,
      draft: false,
    })
  })

  it('walks a richText surface whole, so standfirsts and layout blocks are kept', async () => {
    const { payload } = stubPayload({})
    const surface: ContentSurface = {
      collection: 'posts',
      title: 'Insights',
      urlPrefix: '/posts',
      body: { kind: 'richText', field: 'content' },
    }
    const markdown = await extractDocMarkdown(payload, surface, {
      title: 'Post',
      standfirst: 'The short version.',
      content: paragraph('The long version.'),
    } as never)
    expect(markdown).toBe(['# Post', 'The short version.', 'The long version.'].join('\n\n'))
  })
})

describe('extractGlobalMarkdown', () => {
  it('writes site info as quotable company facts', async () => {
    const { payload } = stubPayload({})
    const surface: GlobalSurface = {
      global: 'site-info',
      title: 'About',
      path: '/contact',
      drafts: false,
    }
    const markdown = await extractGlobalMarkdown(payload, surface, {
      name: 'Suits & Sandals',
      tagline: 'Strategy and craft.',
      foundingYear: 2012,
      contactEmail: 'hello@example.com',
      inquiries: { responseTime: 'two business days' },
      address: {
        streetAddress: '240 Kent Ave',
        city: 'Brooklyn',
        state: 'NY',
        postalCode: '11249',
        country: 'US',
      },
      socialProfiles: [{ label: 'LinkedIn', url: 'https://linkedin.com/company/x' }],
    })

    expect(markdown).toBe(
      [
        '# Suits & Sandals',
        'Strategy and craft.',
        'Founded in 2012.',
        '## Where we are\nStudio address: 240 Kent Ave, Brooklyn, NY 11249, US.',
        '## Contact\nEmail: hello@example.com\nInquiry response time: two business days',
        '## Find us online\n- LinkedIn: https://linkedin.com/company/x',
      ].join('\n\n'),
    )
  })

  it('walks a page global like a surface document', async () => {
    const { payload } = stubPayload({})
    const surface: GlobalSurface = { global: 'home', title: 'Home', path: '/', drafts: true }
    const markdown = await extractGlobalMarkdown(payload, surface, {
      title: 'Home',
      _status: 'published',
      hero: { title: 'We build brands.', description: 'Strategy first.' },
      statement: { hidden: false, body: paragraph('Our stance.') },
    })
    expect(markdown).toBe(
      ['# Home', '## We build brands.', 'Strategy first.', 'Our stance.'].join('\n\n'),
    )
  })
})
