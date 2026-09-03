import { draftMode } from 'next/headers'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getRelatedWorkByCapabilities, getRelatedWorkByIds } from '@/collections/WorkPages/queries'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { FooterClosingSection } from '@/Footer/Closing/Component'
import { FOOTER_CLOSING_ARTICLE_CLASS } from '@/Footer/Closing/curtain'
import { RenderHero } from '@/heros/RenderHero'
import type { ExpertisePage } from '@/payload-types'
import { RelatedWorkSection, relatedWorkTerms } from '@/sections/RelatedWork'
import type { WorksBrowseItem } from '@/sections/WorksBrowse/queries'
import { relationshipIds } from '@/utilities/relationshipId'
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
        <RelatedWorkSection
          filter={{ kind: 'capabilities', terms: relatedWorkTerms(page.capabilities) }}
          items={relatedWork}
        />
      </article>
      <FooterClosingSection closing={page.closing} />
    </>
  )
}

/** The editor's picks win; otherwise published work sharing one of the page's capabilities. */
const resolveRelatedWork = async (page: ExpertisePage): Promise<WorksBrowseItem[]> => {
  const manualIds = relationshipIds(page.relatedWorkPages ?? [])
  if (manualIds.length) return getRelatedWorkByIds(manualIds)
  return getRelatedWorkByCapabilities(relationshipIds(page.capabilities ?? []))
}
