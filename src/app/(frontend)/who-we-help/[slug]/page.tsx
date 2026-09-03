import { draftMode } from 'next/headers'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getRelatedWorkByIds, getRelatedWorkByIndustries } from '@/collections/WorkPages/queries'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { FooterClosingSection } from '@/Footer/Closing/Component'
import { FOOTER_CLOSING_ARTICLE_CLASS } from '@/Footer/Closing/curtain'
import { SegmentHero } from '@/heros/SegmentHero'
import type { AudiencePage } from '@/payload-types'
import { RelatedWorkSection, relatedWorkTerms } from '@/sections/RelatedWork'
import type { WorksBrowseItem } from '@/sections/WorksBrowse/queries'
import { relationshipIds } from '@/utilities/relationshipId'
import { breadcrumbSchema } from '@/utilities/schema'
import {
  createSlugQuery,
  type SlugRouteArgs,
  slugMetadata,
  slugStaticParams,
} from '@/utilities/slugRoute'

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
    <>
      {/* No top inset: the hero band pulls under the fixed header and owns its own. */}
      <article className={`${FOOTER_CLOSING_ARTICLE_CLASS} pb-24`}>
        <JsonLd
          data={breadcrumbSchema([
            { name: 'Who We Help', path: '/who-we-help' },
            { name: page.title, path: url },
          ])}
        />
        <PayloadRedirects disableNotFound url={url} />
        {draft && <LivePreviewListener />}
        <SegmentHero {...page.hero} />
        <RenderBlocks blocks={page.layout} />
        <RelatedWorkSection
          filter={{ kind: 'industries', terms: relatedWorkTerms(page.industries) }}
          items={relatedWork}
        />
      </article>
      <FooterClosingSection closing={page.closing} />
    </>
  )
}

/** The editor's picks win; otherwise published work sharing one of the page's industries. */
const resolveRelatedWork = async (page: AudiencePage): Promise<WorksBrowseItem[]> => {
  const manualIds = relationshipIds(page.relatedWorkPages ?? [])
  if (manualIds.length) return getRelatedWorkByIds(manualIds)
  return getRelatedWorkByIndustries(relationshipIds(page.industries ?? []))
}
