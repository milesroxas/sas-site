import { draftMode } from 'next/headers'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getWorkPageCardsByIndustries } from '@/collections/WorkPages/queries'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import type { WorkPageCardData } from '@/components/WorkPageCard'
import { RenderHero } from '@/heros/RenderHero'
import type { AudiencePage, WorkPage } from '@/payload-types'
import { RelatedWorkSection } from '@/sections/RelatedWork'
import { breadcrumbSchema } from '@/utilities/schema'
import {
  createSlugQuery,
  type SlugRouteArgs,
  slugMetadata,
  slugStaticParams,
} from '@/utilities/slugRoute'
import PageClient from './page.client'

const queryAudiencePageBySlug = createSlugQuery('audience-pages', { depth: 3 })

export const generateStaticParams = slugStaticParams('audience-pages')
export const generateMetadata = slugMetadata('/who-we-help', queryAudiencePageBySlug)

export default async function AudiencePageRoute({ params }: SlugRouteArgs) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const url = `/who-we-help/${decodedSlug}`
  const page = await queryAudiencePageBySlug(decodedSlug)
  if (!page) return <PayloadRedirects url={url} />
  const relatedWork = await resolveRelatedWork(page)
  return (
    <article className="pt-16 pb-24">
      <PageClient />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Who We Help', path: '/who-we-help' },
          { name: page.title, path: url },
        ])}
      />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <RenderHero {...page.hero} />
      <RenderBlocks blocks={page.layout} />
      <RelatedWorkSection pages={relatedWork} />
    </article>
  )
}

const resolveRelatedWork = async (page: AudiencePage): Promise<WorkPageCardData[]> => {
  const manual = (page.relatedWorkPages ?? []).filter(
    (doc): doc is WorkPage => typeof doc === 'object',
  )
  if (manual.length) return manual
  const industryIds = (page.industries ?? []).map((industry) =>
    typeof industry === 'object' ? industry.id : industry,
  )
  return getWorkPageCardsByIndustries(industryIds)
}
