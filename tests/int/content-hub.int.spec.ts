import { getPayload, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Media } from '@/collections/Media'
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

describe.sequential('content hub and website surfaces', () => {
  let payload: Payload
  let user: User
  let organizationId: number
  let projectId: number
  let libraryId: number
  let publishedStudyId: number
  const suffix = Date.now().toString()

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    user = await payload.create({
      collection: 'users',
      data: { email: `content-hub-${suffix}@example.com`, password: 'testing123' },
    })
  })

  afterAll(async () => {
    if (!payload || !user) return
    await payload.delete({
      collection: 'work-pages',
      where: { slug: { contains: suffix } },
      context: { disableRevalidate: true },
    })
    await payload.delete({
      collection: 'case-studies',
      where: { key: { contains: suffix } },
      context: { disableRevalidate: true },
    })
    await payload.delete({
      collection: 'testimonials',
      where: { internalTitle: { contains: suffix } },
    })
    await payload.delete({ collection: 'asset-libraries', where: { slug: { contains: suffix } } })
    await payload.delete({ collection: 'projects', where: { internalTitle: { contains: suffix } } })
    await payload.delete({ collection: 'organizations', where: { name: { contains: suffix } } })
    await payload.delete({ collection: 'users', id: user.id })
  })

  it('creates the canonical client, project, and project asset library', async () => {
    const organization = await payload.create({
      collection: 'organizations',
      user,
      overrideAccess: false,
      data: { name: `Client ${suffix}`, slug: `client-${suffix}`, _status: 'published' },
    })
    organizationId = organization.id
    const project = await payload.create({
      collection: 'projects',
      user,
      overrideAccess: false,
      data: {
        internalTitle: `Project ${suffix}`,
        organization: organization.id,
        status: 'completed',
        _status: 'published',
      },
    })
    projectId = project.id
    const library = await payload.create({
      collection: 'asset-libraries',
      user,
      overrideAccess: false,
      data: {
        name: `Project Library ${suffix}`,
        slug: `project-library-${suffix}`,
        organization: organization.id,
        project: project.id,
        libraryStatus: 'active',
      },
    })
    libraryId = library.id
    expect(library.project).toBeDefined()
    expect(library.rootFolder).toBeDefined()
  })

  it('keeps canonical publishing separate from website publishing', async () => {
    const draft = await payload.create({
      collection: 'case-studies',
      user,
      overrideAccess: false,
      draft: true,
      data: { title: `Draft ${suffix}`, key: `draft-${suffix}`, project: projectId },
    })
    const anonymousDraft = await payload.find({
      collection: 'case-studies',
      overrideAccess: false,
      where: { id: { equals: draft.id } },
    })
    expect(anonymousDraft.totalDocs).toBe(0)

    const published = await payload.create({
      collection: 'case-studies',
      user,
      overrideAccess: false,
      context: { disableRevalidate: true },
      data: {
        title: `Published ${suffix}`,
        key: `published-${suffix}`,
        project: projectId,
        summaries: { short: 'A public canonical summary' },
        challenge: richText('Challenge'),
        outcomeSummary: richText('Outcome'),
        approvedClaims: [{ claim: 'Internal evidence', source: 'Private source', approved: false }],
        assetLibraries: [libraryId],
        _status: 'published',
      },
    })
    publishedStudyId = published.id
    const anonymousCanonical = await payload.find({
      collection: 'case-studies',
      overrideAccess: false,
      where: { id: { equals: published.id } },
    })
    expect(anonymousCanonical.totalDocs).toBe(1)
    expect(anonymousCanonical.docs[0]?.approvedClaims).toEqual([])

    const draftPage = await payload.create({
      collection: 'work-pages',
      user,
      overrideAccess: false,
      draft: true,
      data: {
        title: `Draft Work ${suffix}`,
        slug: `draft-work-${suffix}`,
        caseStudy: published.id,
      },
    })
    const anonymousDraftPage = await payload.find({
      collection: 'work-pages',
      overrideAccess: false,
      where: { id: { equals: draftPage.id } },
    })
    expect(anonymousDraftPage.totalDocs).toBe(0)

    const publicPage = await payload.update({
      collection: 'work-pages',
      id: draftPage.id,
      user,
      overrideAccess: false,
      context: { disableRevalidate: true },
      data: {
        title: `Published Work ${suffix}`,
        slug: `published-work-${suffix}`,
        caseStudy: published.id,
        _status: 'published',
        layout: [
          {
            blockType: 'caseStudyTransition',
            heading: 'Website transition',
            theme: 'light',
            layout: 'centered',
          },
        ],
        editorialNotes: 'website secret',
      },
    })
    const anonymousPage = await payload.find({
      collection: 'work-pages',
      overrideAccess: false,
      where: { id: { equals: publicPage.id } },
    })
    expect(anonymousPage.totalDocs).toBe(1)
    expect(anonymousPage.docs[0]?.editorialNotes).toBeUndefined()
  })

  it('requires a published canonical source with an Asset Library before publishing a Work Page', async () => {
    const noLibrary = await payload.create({
      collection: 'case-studies',
      user,
      overrideAccess: false,
      data: {
        title: `No Library ${suffix}`,
        key: `no-library-${suffix}`,
        project: projectId,
        summaries: { short: 'Summary' },
        challenge: richText('Challenge'),
        outcomeSummary: richText('Outcome'),
        _status: 'published',
      },
      context: { disableRevalidate: true },
    })
    await expect(
      payload.create({
        collection: 'work-pages',
        user,
        overrideAccess: false,
        context: { disableRevalidate: true },
        data: {
          title: `Invalid Work ${suffix}`,
          slug: `invalid-work-${suffix}`,
          caseStudy: noLibrary.id,
          _status: 'published',
          intro: { title: 'Intro title' },
          layout: [{ blockType: 'caseStudyTransition', heading: 'Transition' }],
        },
      }),
    ).rejects.toThrow('needs at least one Asset Library')
  })

  it('exposes only approved public testimonials', async () => {
    const approved = await payload.create({
      collection: 'testimonials',
      user,
      overrideAccess: false,
      data: {
        internalTitle: `Approved ${suffix}`,
        organization: organizationId,
        speakerName: 'Jane',
        quote: richText('Approved quote'),
        approvalStatus: 'approved-public',
        _status: 'published',
      },
    })
    await payload.create({
      collection: 'testimonials',
      user,
      overrideAccess: false,
      data: {
        internalTitle: `Internal ${suffix}`,
        organization: organizationId,
        speakerName: 'John',
        quote: richText('Internal quote'),
        approvalStatus: 'internal-only',
        _status: 'published',
      },
    })
    const result = await payload.find({
      collection: 'testimonials',
      overrideAccess: false,
      where: { internalTitle: { contains: suffix } },
    })
    expect(result.docs.map((doc) => doc.id)).toEqual([approved.id])
  })

  it('rejects duplicate stable keys in canonical content', async () => {
    await expect(
      payload.create({
        collection: 'case-studies',
        user,
        overrideAccess: false,
        draft: true,
        data: {
          title: `Duplicates ${suffix}`,
          key: `duplicates-${suffix}`,
          project: projectId,
          keyDecisions: [
            { key: 'same', title: 'One' },
            { key: 'same', title: 'Two' },
          ],
        },
      }),
    ).rejects.toThrow('Key decision key must be unique')
  })

  it('defines Media library ownership, public filtering, and Work Page preview paths', async () => {
    expect(publishedStudyId).toBeDefined()
    const access = Media.access?.read
    expect(typeof access).toBe('function')
    if (typeof access === 'function')
      expect(access({ req: { user: null } as PayloadRequest } as never)).toEqual({
        usageStatus: { equals: 'public-approved' },
      })
    const preview = generatePreviewPath({
      collection: 'work-pages',
      slug: 'northstar',
      req: {} as PayloadRequest,
    })
    expect(preview).toContain('path=%2Fworks%2Fnorthstar')
  })
})
