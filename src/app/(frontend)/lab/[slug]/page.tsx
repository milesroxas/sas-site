import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { RenderLabBlocks } from '@/blocks/lab/RenderLabBlocks'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LabHero } from '@/heros/LabHero'
import type { LabProject } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { breadcrumbSchema, creativeWorkSchema } from '@/utilities/schema'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'lab-pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return result.docs.map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug: string }> }

export default async function LabPageRoute({ params }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const url = `/lab/${decodedSlug}`
  const page = await queryLabPageBySlug(decodedSlug)
  if (!page || typeof page.labProject !== 'object') return <PayloadRedirects url={url} />
  const project = page.labProject as LabProject
  return (
    <article>
      <PageClient />
      <JsonLd
        data={[
          creativeWorkSchema(page, '/lab'),
          breadcrumbSchema([
            { name: 'Lab', path: '/lab' },
            { name: page.title, path: url },
          ]),
        ]}
      />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <LabHero page={page} project={project} />
      {page.layout?.length ? (
        <RenderLabBlocks blocks={page.layout} page={page} project={project} />
      ) : null}
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  return generateMeta({
    doc: await queryLabPageBySlug(decodedSlug),
    pathname: `/lab/${decodedSlug}`,
  })
}

const queryLabPageBySlug = cache(async (slug: string) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'lab-pages',
    draft,
    depth: 4,
    limit: 1,
    pagination: false,
    populate: {
      'lab-projects': {
        title: true,
        key: true,
        kind: true,
        status: true,
        startDate: true,
        endDate: true,
        thesis: true,
        summaries: true,
        capabilities: true,
        technologies: true,
        context: true,
        approach: true,
        outcome: true,
        learnings: true,
        coverAsset: true,
        selectedAssets: true,
        projectLinks: true,
        publishedAt: true,
        _status: true,
      },
    },
    overrideAccess: draft,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] || null
})
