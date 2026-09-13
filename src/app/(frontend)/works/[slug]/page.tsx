import { draftMode } from 'next/headers'
import { RenderCaseStudyBlocks } from '@/blocks/case-study/RenderCaseStudyBlocks'
import { FeaturedWorkSection } from '@/blocks/featured-work/Component'
import { resolveRelatedWorkEntries } from '@/blocks/featured-work/resolve-entries'
import { STORY_SECTION_SELECT } from '@/collections/story/narrative'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { FooterClosingSection } from '@/Footer/Closing/Component'
import { FOOTER_CLOSING_ARTICLE_CLASS } from '@/Footer/Closing/curtain'
import { CaseStudyHero } from '@/heros/CaseStudyHero'
import type { CaseStudy } from '@/payload-types'
import { introSummary, WorkIntro } from '@/sections/WorkIntro'
import { populatedDoc } from '@/utilities/relationshipId'
import { breadcrumbSchema, creativeWorkSchema } from '@/utilities/schema'
import {
  createSlugQuery,
  type SlugRouteArgs,
  slugMetadata,
  slugStaticParams,
} from '@/utilities/slugRoute'

const queryWorkPageBySlug = createSlugQuery('work-pages', {
  depth: 4,
  populate: {
    'case-studies': {
      title: true,
      project: true,
      thesis: true,
      summaries: true,
      primaryAudience: true,
      featuredCapabilities: true,
      ...STORY_SECTION_SELECT,
      objectives: true,
      keyDecisions: true,
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
})

export const generateStaticParams = slugStaticParams('work-pages')
export const generateMetadata = slugMetadata('/works', queryWorkPageBySlug)

export default async function WorkPageRoute({ params }: SlugRouteArgs) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const url = `/works/${decodedSlug}`
  const page = await queryWorkPageBySlug(decodedSlug)
  const study = populatedDoc<CaseStudy>(page?.caseStudy)
  if (!page || !study) return <PayloadRedirects url={url} />
  const relatedEntries = await resolveRelatedWorkEntries(page)
  return (
    <>
      <article className={FOOTER_CLOSING_ARTICLE_CLASS}>
        <JsonLd
          data={[
            creativeWorkSchema(page, '/works'),
            breadcrumbSchema([
              { name: 'Work', path: '/works' },
              { name: page.title, path: url },
            ]),
          ]}
        />
        <PayloadRedirects disableNotFound url={url} />
        {draft && <LivePreviewListener />}
        <CaseStudyHero page={page} study={study} />
        {page.intro?.title ? (
          <WorkIntro
            body={page.intro.bodyOverride}
            eyebrow={page.intro.eyebrow}
            summary={introSummary(study.summaries)}
            title={page.intro.title}
          />
        ) : null}
        {page.layout?.length ? (
          <RenderCaseStudyBlocks blocks={page.layout} page={page} study={study} />
        ) : null}
        <FeaturedWorkSection eyebrow="Explore More Work" entries={relatedEntries} />
      </article>
      <FooterClosingSection closing={page.closing} />
    </>
  )
}
