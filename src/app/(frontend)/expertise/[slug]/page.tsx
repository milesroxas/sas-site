import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getWorkPageCardsByCapabilities } from '@/collections/WorkPages/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RelatedWorkSection } from '@/components/RelatedWorkSection'
import type { WorkPageCardData } from '@/components/WorkPageCard'
import { RenderHero } from '@/heros/RenderHero'
import type { ExpertisePage, WorkPage } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'expertise-pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return result.docs.map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug: string }> }

export default async function ExpertisePageRoute({ params }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const url = `/expertise/${decodedSlug}`
  const page = await queryExpertisePageBySlug(decodedSlug)
  if (!page) return <PayloadRedirects url={url} />
  const relatedWork = await resolveRelatedWork(page)
  return (
    <article className="pt-16 pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <RenderHero {...page.hero} />
      <RenderBlocks blocks={page.layout} />
      <RelatedWorkSection pages={relatedWork} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  return generateMeta({ doc: await queryExpertisePageBySlug(decodeURIComponent(slug)) })
}

const resolveRelatedWork = async (page: ExpertisePage): Promise<WorkPageCardData[]> => {
  const manual = (page.relatedWorkPages ?? []).filter(
    (doc): doc is WorkPage => typeof doc === 'object',
  )
  if (manual.length) return manual
  const capabilityIds = (page.capabilities ?? []).map((capability) =>
    typeof capability === 'object' ? capability.id : capability,
  )
  return getWorkPageCardsByCapabilities(capabilityIds)
}

const queryExpertisePageBySlug = cache(async (slug: string) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'expertise-pages',
    draft,
    depth: 3,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] || null
})
