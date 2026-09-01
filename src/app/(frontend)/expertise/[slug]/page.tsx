import { draftMode } from 'next/headers'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getWorkPageCardsByCapabilities } from '@/collections/WorkPages/queries'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import type { WorkPageCardData } from '@/components/WorkPageCard'
import { FooterClosingSection } from '@/Footer/Closing/Component'
import { FOOTER_CLOSING_ARTICLE_CLASS } from '@/Footer/Closing/curtain'
import { RenderHero } from '@/heros/RenderHero'
import type { ExpertisePage, WorkPage } from '@/payload-types'
import { RelatedWorkSection } from '@/sections/RelatedWork'
import { breadcrumbSchema, serviceSchema } from '@/utilities/schema'
import {
  createSlugQuery,
  type SlugRouteArgs,
  slugMetadata,
  slugStaticParams,
} from '@/utilities/slugRoute'
import PageClient from './page.client'

const queryExpertisePageBySlug = createSlugQuery('expertise-pages', { depth: 3 })

export const generateStaticParams = slugStaticParams('expertise-pages')
export const generateMetadata = slugMetadata('/expertise', queryExpertisePageBySlug)

export default async function ExpertisePageRoute({ params }: SlugRouteArgs) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const url = `/expertise/${decodedSlug}`
  const page = await queryExpertisePageBySlug(decodedSlug)
  if (!page) return <PayloadRedirects url={url} />
  const relatedWork = await resolveRelatedWork(page)
  return (
    <>
      <article className={`${FOOTER_CLOSING_ARTICLE_CLASS} pt-16 pb-24`}>
        <PageClient />
        <JsonLd
          data={[
            serviceSchema(page),
            breadcrumbSchema([
              { name: 'Expertise', path: '/expertise' },
              { name: page.title, path: url },
            ]),
          ]}
        />
        <PayloadRedirects disableNotFound url={url} />
        {draft && <LivePreviewListener />}
        <RenderHero {...page.hero} />
        <RenderBlocks blocks={page.layout} />
        <RelatedWorkSection pages={relatedWork} />
      </article>
      <FooterClosingSection closing={page.closing} />
    </>
  )
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
