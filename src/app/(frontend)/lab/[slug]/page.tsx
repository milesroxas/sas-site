import { draftMode } from 'next/headers'
import { RenderLabBlocks } from '@/blocks/lab/RenderLabBlocks'
import { STORY_SECTION_SELECT } from '@/collections/story/narrative'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { FooterClosingSection } from '@/Footer/Closing/Component'
import { FOOTER_CLOSING_ARTICLE_CLASS } from '@/Footer/Closing/curtain'
import { ContentsButton } from '@/features/contents'
import { LabHero } from '@/heros/LabHero'
import type { LabProject } from '@/payload-types'
import { introSummary, WorkIntro } from '@/sections/WorkIntro'
import { populatedDoc } from '@/utilities/relationshipId'
import { breadcrumbSchema, creativeWorkSchema } from '@/utilities/schema'
import {
  createSlugQuery,
  type SlugRouteArgs,
  slugMetadata,
  slugStaticParams,
} from '@/utilities/slugRoute'

const queryLabPageBySlug = createSlugQuery('lab-pages', {
  depth: 4,
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
      populatedAuthors: true,
      ...STORY_SECTION_SELECT,
      coverAsset: true,
      selectedAssets: true,
      projectLinks: true,
      publishedAt: true,
      _status: true,
    },
  },
})

export const generateStaticParams = slugStaticParams('lab-pages')
export const generateMetadata = slugMetadata('/lab', queryLabPageBySlug)

export default async function LabPageRoute({ params }: SlugRouteArgs) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const url = `/lab/${decodedSlug}`
  const page = await queryLabPageBySlug(decodedSlug)
  const project = populatedDoc<LabProject>(page?.labProject)
  if (!page || !project) return <PayloadRedirects url={url} />
  return (
    <>
      <article className={FOOTER_CLOSING_ARTICLE_CLASS}>
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
        {page.intro?.title ? (
          <WorkIntro
            body={page.intro.bodyOverride}
            eyebrow={page.intro.eyebrow}
            summary={introSummary(project.summaries)}
            title={page.intro.title}
          />
        ) : null}
        {page.layout?.length ? (
          <RenderLabBlocks blocks={page.layout} page={page} project={project} />
        ) : null}
        {page.showContents && <ContentsButton />}
      </article>
      <FooterClosingSection closing={page.closing} />
    </>
  )
}
