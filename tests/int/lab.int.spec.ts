import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
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

describe.sequential('lab projects and lab pages', () => {
  let payload: Payload
  let user: User
  let publishedProjectId: number
  const suffix = Date.now().toString()

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    user = await payload.create({
      collection: 'users',
      data: { email: `lab-${suffix}@example.com`, password: 'testing123' },
    })
  })

  afterAll(async () => {
    if (!payload || !user) return
    await payload.delete({
      collection: 'lab-pages',
      where: { slug: { contains: suffix } },
      context: { disableRevalidate: true },
    })
    await payload.delete({
      collection: 'lab-projects',
      where: { key: { contains: suffix } },
      context: { disableRevalidate: true },
    })
    await payload.delete({ collection: 'users', id: user.id })
  })

  it('keeps draft lab projects invisible to anonymous readers', async () => {
    const draft = await payload.create({
      collection: 'lab-projects',
      user,
      overrideAccess: false,
      draft: true,
      data: { title: `Draft Experiment ${suffix}`, key: `draft-experiment-${suffix}` },
    })
    const anonymous = await payload.find({
      collection: 'lab-projects',
      overrideAccess: false,
      where: { id: { equals: draft.id } },
    })
    expect(anonymous.totalDocs).toBe(0)
  })

  it('requires a summary before a lab project can publish', async () => {
    await expect(
      payload.create({
        collection: 'lab-projects',
        user,
        overrideAccess: false,
        data: {
          title: `No Summary ${suffix}`,
          key: `no-summary-${suffix}`,
          kind: 'experiment',
          status: 'active',
          _status: 'published',
        },
      }),
    ).rejects.toThrow(/summary/i)

    const published = await payload.create({
      collection: 'lab-projects',
      user,
      overrideAccess: false,
      data: {
        title: `Experiment ${suffix}`,
        key: `experiment-${suffix}`,
        kind: 'experiment',
        status: 'completed',
        summaries: { oneLine: 'A small internal experiment.' },
        outcome: richText('It worked.'),
        _status: 'published',
      },
    })
    publishedProjectId = published.id
    expect(published._status).toBe('published')
  })

  it('blocks publishing a lab page without a layout', async () => {
    await expect(
      payload.create({
        collection: 'lab-pages',
        user,
        overrideAccess: false,
        data: {
          title: `Lab Page ${suffix}`,
          slug: `lab-page-${suffix}`,
          labProject: publishedProjectId,
          _status: 'published',
        },
        context: { disableRevalidate: true },
      }),
    ).rejects.toThrow(/layout/i)
  })

  it('publishes a lab page from a published lab project and serves it anonymously', async () => {
    const page = await payload.create({
      collection: 'lab-pages',
      user,
      overrideAccess: false,
      data: {
        title: `Lab Page ${suffix}`,
        slug: `lab-page-${suffix}`,
        labProject: publishedProjectId,
        layout: [{ blockType: 'labStorySection', source: 'outcome' }],
        _status: 'published',
      },
      context: { disableRevalidate: true },
    })
    expect(page._status).toBe('published')

    const anonymous = await payload.find({
      collection: 'lab-pages',
      overrideAccess: false,
      depth: 2,
      where: { slug: { equals: `lab-page-${suffix}` } },
    })
    expect(anonymous.totalDocs).toBe(1)
  })

  it('refuses to delete a lab project that a lab page still uses', async () => {
    await expect(
      payload.delete({
        collection: 'lab-projects',
        id: publishedProjectId,
        user,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/Lab Page/i)
  })

  it('generates preview paths under /lab', () => {
    const path = generatePreviewPath({
      collection: 'lab-pages',
      slug: `lab-page-${suffix}`,
      req: {} as never,
    })
    expect(path).toContain(`path=%2Flab%2Flab-page-${suffix}`)
  })
})
