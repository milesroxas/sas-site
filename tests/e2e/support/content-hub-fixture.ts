import { getPayload, type Payload } from 'payload'

import config from '../../../src/payload.config'

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

const removeFixture = async (payload: Payload, suffix: string) => {
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
    collection: 'asset-libraries',
    where: { slug: { contains: suffix } },
  })
  await payload.delete({
    collection: 'projects',
    where: { internalTitle: { contains: suffix } },
  })
  await payload.delete({
    collection: 'organizations',
    where: { name: { contains: suffix } },
  })
}

const createFixture = async (payload: Payload, suffix: string) => {
  const organization = await payload.create({
    collection: 'organizations',
    data: { name: `E2E Client ${suffix}`, slug: `e2e-client-${suffix}`, _status: 'published' },
  })
  const project = await payload.create({
    collection: 'projects',
    data: {
      internalTitle: `E2E Project ${suffix}`,
      organization: organization.id,
      status: 'completed',
      _status: 'published',
    },
  })
  const library = await payload.create({
    collection: 'asset-libraries',
    data: {
      name: `E2E Library ${suffix}`,
      slug: `e2e-library-${suffix}`,
      organization: organization.id,
      project: project.id,
      libraryStatus: 'active',
    },
  })
  const common = {
    project: project.id,
    summaries: { short: 'Canonical hero summary' },
    challenge: richText('Canonical story challenge'),
    outcomeSummary: richText('Canonical outcome'),
    assetLibraries: [library.id],
    _status: 'published' as const,
  }
  const canonicalStudy = await payload.create({
    collection: 'case-studies',
    context: { disableRevalidate: true },
    data: {
      ...common,
      title: 'Canonical hero title',
      key: `canonical-study-${suffix}`,
      metrics: [
        {
          key: 'approved',
          label: 'Approved metric',
          value: '42',
          qualifier: 'Measured',
          approvedForPublic: true,
          featured: true,
        },
        {
          key: 'hidden',
          label: 'Hidden metric',
          value: '99',
          qualifier: 'Internal',
          approvedForPublic: false,
          featured: true,
        },
      ],
    },
  })
  const overrideStudy = await payload.create({
    collection: 'case-studies',
    context: { disableRevalidate: true },
    data: { ...common, title: 'Original title', key: `override-study-${suffix}` },
  })

  await payload.create({
    collection: 'work-pages',
    context: { disableRevalidate: true },
    data: {
      title: `Canonical Work ${suffix}`,
      slug: `canonical-${suffix}`,
      caseStudy: canonicalStudy.id,
      _status: 'published',
      layout: [
        {
          blockType: 'caseStudyStorySection',
          source: 'challenge',
          layout: 'text-only',
          theme: 'light',
          width: 'standard',
        },
        {
          blockType: 'caseStudyTransition',
          heading: 'Website-only transition',
          layout: 'centered',
          theme: 'neutral',
        },
        {
          blockType: 'caseStudyMetrics',
          source: 'featured-public',
          layout: 'grid',
          theme: 'light',
        },
      ],
    },
  })
  await payload.create({
    collection: 'work-pages',
    context: { disableRevalidate: true },
    data: {
      title: `Override Work ${suffix}`,
      slug: `override-${suffix}`,
      caseStudy: overrideStudy.id,
      _status: 'published',
      hero: {
        titleOverride: 'Website override title',
        summaryOverride: 'Website override summary',
      },
      layout: [
        {
          blockType: 'caseStudyTransition',
          heading: 'Override page',
          layout: 'centered',
          theme: 'light',
        },
      ],
    },
  })
}

const [operation, suffix] = process.argv.slice(2)

if ((operation !== 'create' && operation !== 'delete') || !suffix) {
  throw new Error('Usage: content-hub-fixture.ts <create|delete> <suffix>')
}

const payload = await getPayload({ config: await config })

try {
  if (operation === 'create') {
    await createFixture(payload, suffix)
  } else {
    await removeFixture(payload, suffix)
  }
} finally {
  await payload.db.destroy?.()
}
