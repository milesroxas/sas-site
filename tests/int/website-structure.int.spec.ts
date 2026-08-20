import { getPayload, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  getWorkPageCardsByCapabilities,
  getWorkPageCardsByIndustries,
} from '@/collections/WorkPages/queries'
import config from '@/payload.config'
import type { User } from '@/payload-types'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'

const richText = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

describe.sequential('website IA surfaces', () => {
  let payload: Payload
  let user: User
  let capabilityId: number
  let industryId: number
  let workPageId: number
  const suffix = Date.now().toString()

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    user = await payload.create({
      collection: 'users',
      data: { email: `website-ia-${suffix}@example.com`, password: 'testing123' },
    })
  })

  afterAll(async () => {
    if (!payload || !user) return
    const cleanup = { context: { disableRevalidate: true } }
    await payload.delete({
      collection: 'expertise-pages',
      where: { slug: { contains: suffix } },
      ...cleanup,
    })
    await payload.delete({
      collection: 'audience-pages',
      where: { slug: { contains: suffix } },
      ...cleanup,
    })
    await payload.delete({
      collection: 'work-pages',
      where: { slug: { contains: suffix } },
      ...cleanup,
    })
    await payload.delete({
      collection: 'case-studies',
      where: { key: { contains: suffix } },
      ...cleanup,
    })
    await payload.delete({ collection: 'asset-libraries', where: { slug: { contains: suffix } } })
    await payload.delete({ collection: 'projects', where: { internalTitle: { contains: suffix } } })
    await payload.delete({ collection: 'organizations', where: { name: { contains: suffix } } })
    await payload.delete({ collection: 'capabilities', where: { slug: { contains: suffix } } })
    await payload.delete({ collection: 'industries', where: { slug: { contains: suffix } } })
    await payload.delete({ collection: 'categories', where: { slug: { contains: suffix } } })
    await payload.delete({ collection: 'users', id: user.id })
  })

  it('gates expertise pages by publish status and hides editorial notes', async () => {
    const capability = await payload.create({
      collection: 'capabilities',
      user,
      overrideAccess: false,
      data: { name: `Capability ${suffix}`, slug: `capability-${suffix}` },
    })
    capabilityId = capability.id

    const draft = await payload.create({
      collection: 'expertise-pages',
      user,
      overrideAccess: false,
      draft: true,
      data: {
        title: `Draft Expertise ${suffix}`,
        slug: `expertise-${suffix}`,
        capabilities: [capabilityId],
      },
    })
    const anonymousDraft = await payload.find({
      collection: 'expertise-pages',
      overrideAccess: false,
      where: { id: { equals: draft.id } },
    })
    expect(anonymousDraft.totalDocs).toBe(0)

    await payload.update({
      collection: 'expertise-pages',
      id: draft.id,
      user,
      overrideAccess: false,
      context: { disableRevalidate: true },
      data: {
        _status: 'published',
        layout: [
          {
            blockType: 'content',
            columns: [{ size: 'full', richText: richText('Expertise body') }],
          },
        ],
        editorialNotes: 'internal positioning notes',
      },
    })
    const anonymous = await payload.find({
      collection: 'expertise-pages',
      overrideAccess: false,
      where: { id: { equals: draft.id } },
    })
    expect(anonymous.totalDocs).toBe(1)
    expect(anonymous.docs[0]?.editorialNotes).toBeUndefined()
  })

  it('gates audience pages by publish status', async () => {
    const industry = await payload.create({
      collection: 'industries',
      user,
      overrideAccess: false,
      data: { name: `Industry ${suffix}`, slug: `industry-${suffix}` },
    })
    industryId = industry.id

    const draft = await payload.create({
      collection: 'audience-pages',
      user,
      overrideAccess: false,
      draft: true,
      data: {
        title: `Draft Audience ${suffix}`,
        slug: `audience-${suffix}`,
        industries: [industryId],
      },
    })
    const anonymousDraft = await payload.find({
      collection: 'audience-pages',
      overrideAccess: false,
      where: { id: { equals: draft.id } },
    })
    expect(anonymousDraft.totalDocs).toBe(0)

    await payload.update({
      collection: 'audience-pages',
      id: draft.id,
      user,
      overrideAccess: false,
      context: { disableRevalidate: true },
      data: {
        _status: 'published',
        layout: [
          {
            blockType: 'content',
            columns: [{ size: 'full', richText: richText('Audience body') }],
          },
        ],
      },
    })
    const anonymous = await payload.find({
      collection: 'audience-pages',
      overrideAccess: false,
      where: { id: { equals: draft.id } },
    })
    expect(anonymous.totalDocs).toBe(1)
  })

  it('generates preview paths for the new surfaces', () => {
    const req = {} as PayloadRequest
    expect(
      generatePreviewPath({ slug: `expertise-${suffix}`, collection: 'expertise-pages', req }),
    ).toContain(encodeURIComponent(`/expertise/expertise-${suffix}`))
    expect(
      generatePreviewPath({ slug: `audience-${suffix}`, collection: 'audience-pages', req }),
    ).toContain(encodeURIComponent(`/who-we-help/audience-${suffix}`))
  })

  it('matches published work automatically by capability and industry', async () => {
    const organization = await payload.create({
      collection: 'organizations',
      user,
      overrideAccess: false,
      data: { name: `Client ${suffix}`, slug: `client-${suffix}`, _status: 'published' },
    })
    const project = await payload.create({
      collection: 'projects',
      user,
      overrideAccess: false,
      data: {
        internalTitle: `Project ${suffix}`,
        organization: organization.id,
        status: 'completed',
        industries: [industryId],
        capabilities: [capabilityId],
        _status: 'published',
      },
    })
    const library = await payload.create({
      collection: 'asset-libraries',
      user,
      overrideAccess: false,
      data: {
        name: `Library ${suffix}`,
        slug: `library-${suffix}`,
        organization: organization.id,
        project: project.id,
        libraryStatus: 'active',
      },
    })
    const study = await payload.create({
      collection: 'case-studies',
      user,
      overrideAccess: false,
      context: { disableRevalidate: true },
      data: {
        title: `Study ${suffix}`,
        key: `study-${suffix}`,
        project: project.id,
        featuredCapabilities: [capabilityId],
        summaries: { short: 'Public summary' },
        challenge: { body: richText('Challenge') },
        outcomeSummary: { body: richText('Outcome') },
        assetLibraries: [library.id],
        _status: 'published',
      },
    })
    const workPage = await payload.create({
      collection: 'work-pages',
      user,
      overrideAccess: false,
      context: { disableRevalidate: true },
      data: {
        title: `Work ${suffix}`,
        slug: `work-${suffix}`,
        caseStudy: study.id,
        intro: { title: 'Intro title' },
        layout: [
          {
            blockType: 'caseStudyTransition',
            heading: 'Website transition',
            theme: 'light',
            layout: 'centered',
          },
        ],
        _status: 'published',
      },
    })
    workPageId = workPage.id

    const byCapability = await getWorkPageCardsByCapabilities([capabilityId])
    expect(byCapability.map((doc) => doc.id)).toContain(workPageId)

    const byIndustry = await getWorkPageCardsByIndustries([industryId])
    expect(byIndustry.map((doc) => doc.id)).toContain(workPageId)

    expect(await getWorkPageCardsByCapabilities([])).toEqual([])
    expect(await getWorkPageCardsByIndustries([])).toEqual([])
  })

  it('stores topic hub descriptions on categories', async () => {
    const category = await payload.create({
      collection: 'categories',
      user,
      overrideAccess: false,
      data: {
        title: `Topic ${suffix}`,
        slug: `topic-${suffix}`,
        description: 'Intro copy for the topic hub.',
      },
    })
    expect(category.description).toBe('Intro copy for the topic hub.')
  })
})
