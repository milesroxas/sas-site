import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { ReactNode } from 'react'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type {
  CaseStudy,
  CaseStudyKeyDecisionsBlock,
  CaseStudyMediaShowcaseBlock,
  CaseStudyMetricsBlock,
  CaseStudyRelatedWorkBlock,
  CaseStudyStorySectionBlock,
  CaseStudyTestimonialBlock,
  CaseStudyTransitionBlock,
  Testimonial,
  WorkPage,
} from '@/payload-types'
import { cn } from '@/utilities/ui'

const themeClasses = {
  light: 'bg-white text-black',
  dark: 'bg-black text-white',
  neutral: 'bg-neutral-100 text-neutral-950',
  brand: 'bg-amber-300 text-neutral-950',
}

const Section = ({
  children,
  theme = 'light',
  className,
}: {
  children: ReactNode
  theme?: keyof typeof themeClasses | null
  className?: string
}) => (
  <section className={cn('py-16 md:py-24', themeClasses[theme || 'light'], className)}>
    {children}
  </section>
)

const richTextSource = (study: CaseStudy, source: CaseStudyStorySectionBlock['source']) => {
  if (source === 'outcome-summary') return study.outcomeSummary
  if (source === 'custom') return null
  return study[source]
}

const defaultHeading = (source: CaseStudyStorySectionBlock['source']) =>
  ({
    context: 'Context',
    challenge: 'Challenge',
    strategy: 'Strategy',
    approach: 'Approach',
    'outcome-summary': 'Outcomes',
    learnings: 'Learnings',
    custom: '',
  })[source]

const StorySection = ({
  block,
  study,
}: {
  block: CaseStudyStorySectionBlock
  study: CaseStudy
}) => {
  const content =
    block.source === 'custom'
      ? block.customBody
      : block.bodyOverride || richTextSource(study, block.source)
  if (!content) return null
  const width =
    block.width === 'narrow' ? 'max-w-3xl' : block.width === 'wide' ? 'max-w-7xl' : 'max-w-5xl'
  return (
    <Section theme={block.theme}>
      <div
        className={cn(
          'container mx-auto grid gap-10',
          width,
          block.media && block.layout !== 'text-only' && 'md:grid-cols-2',
        )}
      >
        <div className={cn(block.layout === 'text-right' && 'md:order-2')}>
          {block.eyebrow && (
            <p className="mb-3 text-sm uppercase tracking-[0.2em]">{block.eyebrow}</p>
          )}
          <h2 className="mb-6 text-3xl md:text-5xl">
            {block.headingOverride || defaultHeading(block.source)}
          </h2>
          <RichText data={content} enableGutter={false} />
        </div>
        {block.media && typeof block.media === 'object' && (
          <Media resource={block.media} imgClassName="h-auto w-full" />
        )}
      </div>
    </Section>
  )
}

const MediaShowcase = ({ block }: { block: CaseStudyMediaShowcaseBlock }) => {
  const media =
    block.media?.filter(
      (item) => typeof item === 'object' && item.usageStatus === 'public-approved',
    ) || []
  if (!media.length) return null
  return (
    <Section theme={block.theme}>
      <div className="container mx-auto">
        {block.heading && <h2 className="mb-6 text-3xl md:text-5xl">{block.heading}</h2>}
        {block.introduction && (
          <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
        )}
        <div
          className={cn(
            'grid gap-6',
            block.layout === 'grid' && 'md:grid-cols-2',
            block.layout === 'horizontal' && 'grid-flow-col auto-cols-[85%] overflow-x-auto snap-x',
          )}
        >
          {media.map(
            (item) =>
              typeof item === 'object' && (
                <figure className="snap-start" key={item.id}>
                  <Media resource={item} imgClassName="h-auto w-full" />
                  {block.showCaptions && item.caption && (
                    <RichText
                      className="mt-3 text-sm"
                      data={item.caption}
                      enableGutter={false}
                      enableProse={false}
                    />
                  )}
                  {block.showCredits && item.credit && (
                    <figcaption className="mt-2 text-xs opacity-70">
                      Credit: {item.credit}
                    </figcaption>
                  )}
                </figure>
              ),
          )}
        </div>
      </div>
    </Section>
  )
}

const KeyDecisions = ({
  block,
  study,
}: {
  block: CaseStudyKeyDecisionsBlock
  study: CaseStudy
}) => {
  const decisions = (study.keyDecisions || []).filter(
    (decision) => block.source === 'all' || decision.featured,
  )
  if (!decisions.length) return null
  return (
    <Section theme={block.theme}>
      <div className="container mx-auto">
        <h2 className="mb-8 text-3xl md:text-5xl">{block.heading || 'Key decisions'}</h2>
        {block.introduction && (
          <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
        )}
        <div className={cn('grid gap-6', block.layout === 'cards' && 'md:grid-cols-2')}>
          {decisions.map((decision) => (
            <article className="border-current/20 border p-6" key={decision.key}>
              <h3 className="mb-4 text-2xl">{decision.title}</h3>
              {decision.decision && <p>{decision.decision}</p>}
              {decision.impact && <p className="mt-4 opacity-75">{decision.impact}</p>}
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}

const Metrics = ({ block, study }: { block: CaseStudyMetricsBlock; study: CaseStudy }) => {
  const metrics = (study.metrics || []).filter(
    (metric) => metric.approvedForPublic && (block.source === 'all-public' || metric.featured),
  )
  if (!metrics.length) return null
  return (
    <Section theme={block.theme}>
      <div className="container mx-auto">
        <h2 className="mb-8 text-3xl md:text-5xl">{block.heading || 'Results'}</h2>
        {block.introduction && (
          <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
        )}
        <dl className={cn('grid gap-8', block.layout === 'grid' && 'md:grid-cols-3')}>
          {metrics.map((metric) => (
            <div key={metric.key}>
              <dd className="text-4xl md:text-6xl">
                {metric.value}
                {metric.unit}
              </dd>
              <dt className="mt-3 text-lg">{metric.label}</dt>
              {metric.qualifier && <p className="mt-2 text-sm opacity-70">{metric.qualifier}</p>}
            </div>
          ))}
        </dl>
      </div>
    </Section>
  )
}

const TestimonialBlock = ({ block }: { block: CaseStudyTestimonialBlock }) => {
  const testimonial =
    typeof block.testimonial === 'object' ? (block.testimonial as Testimonial) : null
  if (testimonial?._status !== 'published' || testimonial.approvalStatus !== 'approved-public')
    return null
  return (
    <Section theme={block.theme}>
      <figure className="container mx-auto max-w-4xl text-center">
        {block.showPortrait && testimonial.portrait && typeof testimonial.portrait === 'object' && (
          <Media
            className="mx-auto mb-6 w-24 overflow-hidden rounded-full"
            resource={testimonial.portrait}
          />
        )}
        <blockquote>
          <RichText
            className="text-2xl md:text-4xl"
            data={testimonial.quote}
            enableGutter={false}
            enableProse={false}
          />
        </blockquote>
        <figcaption className="mt-6">
          <strong>{testimonial.speakerName}</strong>
          {testimonial.speakerRole && `, ${testimonial.speakerRole}`}
          {testimonial.speakerOrganization && ` — ${testimonial.speakerOrganization}`}
        </figcaption>
      </figure>
    </Section>
  )
}

const Transition = ({ block }: { block: CaseStudyTransitionBlock }) => (
  <Section theme={block.theme}>
    <div className="container mx-auto max-w-5xl text-center">
      {block.eyebrow && <p className="mb-3 text-sm uppercase tracking-[0.2em]">{block.eyebrow}</p>}
      <h2 className="text-4xl md:text-7xl">{block.heading}</h2>
      {block.body && <RichText className="mt-8" data={block.body} enableGutter={false} />}
    </div>
  </Section>
)

const RelatedWork = async ({
  block,
  page,
  study,
}: {
  block: CaseStudyRelatedWorkBlock
  page: WorkPage
  study: CaseStudy
}) => {
  let pages = (page.relatedWorkPages || []).filter(
    (item): item is WorkPage => typeof item === 'object',
  )
  if (block.selectionMode === 'automatic-capability-match') {
    const capabilityIds = (study.featuredCapabilities || []).map((item) =>
      typeof item === 'object' ? item.id : item,
    )
    if (capabilityIds.length) {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'work-pages',
        overrideAccess: false,
        draft: false,
        depth: 2,
        limit: block.limit || 3,
        where: {
          and: [
            { id: { not_equals: page.id } },
            { 'caseStudy.featuredCapabilities': { in: capabilityIds } },
          ],
        },
      })
      pages = result.docs
    }
  }
  pages = pages.slice(0, block.limit || 3)
  if (!pages.length) return null
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        <h2 className="mb-8 text-3xl md:text-5xl">{block.heading || 'Related work'}</h2>
        <div className={cn('grid gap-8', block.layout === 'grid' && 'md:grid-cols-3')}>
          {pages.map((item) => (
            <a className="group block" href={`/works/${item.slug}`} key={item.id}>
              {item.coverAsset && typeof item.coverAsset === 'object' && (
                <Media resource={item.coverAsset} imgClassName="h-auto w-full" />
              )}
              <h3 className="mt-4 text-2xl group-hover:underline">
                {typeof item.caseStudy === 'object' ? item.caseStudy.title : item.title}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export const RenderCaseStudyBlocks = async ({
  blocks,
  page,
  study,
}: {
  blocks: NonNullable<WorkPage['layout']>
  page: WorkPage
  study: CaseStudy
}) => (
  <>
    {blocks.map((block) => {
      switch (block.blockType) {
        case 'caseStudyStorySection':
          return <StorySection block={block} key={block.id} study={study} />
        case 'caseStudyMediaShowcase':
          return <MediaShowcase block={block} key={block.id} />
        case 'caseStudyKeyDecisions':
          return <KeyDecisions block={block} key={block.id} study={study} />
        case 'caseStudyMetrics':
          return <Metrics block={block} key={block.id} study={study} />
        case 'caseStudyTestimonial':
          return <TestimonialBlock block={block} key={block.id} />
        case 'caseStudyTransition':
          return <Transition block={block} key={block.id} />
        case 'caseStudyRelatedWork':
          return <RelatedWork block={block} key={block.id} page={page} study={study} />
        default:
          return null
      }
    })}
  </>
)
