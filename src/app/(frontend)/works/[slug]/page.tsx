import { draftMode } from 'next/headers'
import { RenderCaseStudyBlocks } from '@/blocks/case-study/RenderCaseStudyBlocks'
import { FeaturedWorkSection } from '@/blocks/featured-work/Component'
import { resolveRelatedWorkEntries } from '@/blocks/featured-work/resolve-entries'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { CaseStudyHero } from '@/heros/CaseStudyHero'
import type { CaseStudy } from '@/payload-types'
import { WorkIntro } from '@/sections/WorkIntro'
import { populatedDoc } from '@/utilities/relationshipId'
import { breadcrumbSchema, creativeWorkSchema } from '@/utilities/schema'
import {
  createSlugQuery,
  type SlugRouteArgs,
  slugMetadata,
  slugStaticParams,
} from '@/utilities/slugRoute'
import PageClient from './page.client'

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
})

export const generateStaticParams = slugStaticParams('work-pages')
export const generateMetadata = slugMetadata('/works', queryWorkPageBySlug)

/**
 * The fullest summary the Content Hub holds for a study: the intro band has
 * room for the medium copy, so the shorter summaries only stand in when an
 * editor left it blank.
 */
const introSummary = (summaries: CaseStudy['summaries']) => {
  const { medium, short, oneLine } = summaries ?? {}
  return medium || short || oneLine
}

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
    <article>
      <PageClient />
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
  )
}
