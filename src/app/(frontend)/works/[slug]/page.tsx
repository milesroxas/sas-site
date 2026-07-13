import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { RenderCaseStudyBlocks } from '@/blocks/case-study/RenderCaseStudyBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { CaseStudyHero } from '@/heros/CaseStudyHero'
import type { CaseStudy } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'work-pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return result.docs.map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug: string }> }

export default async function WorkPageRoute({ params }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const url = `/works/${decodedSlug}`
  const page = await queryWorkPageBySlug(decodedSlug)
  if (!page || typeof page.caseStudy !== 'object') return <PayloadRedirects url={url} />
  const study = page.caseStudy as CaseStudy
  return (
    <article>
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <CaseStudyHero page={page} study={study} />
      {page.layout?.length ? (
        <RenderCaseStudyBlocks blocks={page.layout} page={page} study={study} />
      ) : null}
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  return generateMeta({ doc: await queryWorkPageBySlug(decodeURIComponent(slug)) })
}

const queryWorkPageBySlug = cache(async (slug: string) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'work-pages',
    draft,
    depth: 4,
    limit: 1,
    pagination: false,
    populate: {
      'case-studies': {
        title: true,
        project: true,
        thesis: true,
        summaries: true,
        primaryAudience: true,
        featuredCapabilities: true,
        context: true,
        challenge: true,
        objectives: true,
        strategy: true,
        approach: true,
        keyDecisions: true,
        learnings: true,
        outcomeSummary: true,
        qualitativeOutcomes: true,
        metrics: true,
        testimonials: true,
        assetLibraries: true,
        reviewDate: true,
        publishedAt: true,
        key: true,
        _status: true,
      },
    },
    overrideAccess: draft,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] || null
})
