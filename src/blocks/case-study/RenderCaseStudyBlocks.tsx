import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { FeatureHeadingOffsetBlock as FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/Component'
import { FeatureImageStatementBlock as FeatureImageStatement } from '@/blocks/feature/ImageStatement/Component'
import { FeatureStatementGridBlock as FeatureStatementGrid } from '@/blocks/feature/StatementGrid/Component'
import { FeatureStatementLinksBlock as FeatureStatementLinks } from '@/blocks/feature/StatementLinks/Component'
import { FeatureTabsBlock as FeatureTabs } from '@/blocks/feature/Tabs/Component'
import { IndustryWorkBlock } from '@/blocks/IndustryWork/Component'
import { ImagePair } from '@/blocks/image-pair/ImagePair'
import { SplitContentNarrow } from '@/blocks/split-content/SplitContentNarrow'
import { SplitImageOffset } from '@/blocks/split-image-offset/SplitImageOffset'
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
  FeatureHeadingOffsetBlock,
  ImagePairBlock,
  SplitContentNarrowBlock,
  SplitImageOffsetBlock,
  Testimonial,
  WorkPage,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import { blockRevealVariants } from '../shared/reveal-variants'
import { RevealSection } from './RevealSection.client'

const richTextSource = (study: CaseStudy, source: CaseStudyStorySectionBlock['source']) => {
  if (source === 'outcome-summary') return study.outcomeSummary
  if (source === 'custom') return null
  return study[source]
}

/**
 * Feature blocks carry a single rich-text body plus a `source` select. Written
 * copy always wins; an empty body pulls from the canonical case study when a
 * source other than `custom` is chosen.
 */
const resolveFeatureBody = (
  body: FeatureHeadingOffsetBlock['body'],
  source: FeatureHeadingOffsetBlock['source'],
  study: CaseStudy,
) => body || (source && source !== 'custom' ? richTextSource(study, source) : null)

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
  const hasMedia = Boolean(block.media && typeof block.media === 'object')
  return (
    <RevealSection theme={block.theme} variant={hasMedia ? 'underMedia' : 'intro'}>
      <div
        className={cn(
          'container mx-auto grid gap-10',
          width,
          block.media && block.layout !== 'text-only' && 'md:grid-cols-2',
        )}
      >
        <div className={cn(block.layout === 'text-right' && 'md:order-2')}>
          {block.eyebrow && (
            <p className="mb-3 text-sm uppercase tracking-[0.2em]" data-reveal>
              {block.eyebrow}
            </p>
          )}
          <h2 className="mb-6 text-3xl font-normal md:text-5xl" data-reveal>
            {block.headingOverride || defaultHeading(block.source)}
          </h2>
          <div data-reveal>
            <RichText data={content} enableGutter={false} />
          </div>
        </div>
        {block.media && typeof block.media === 'object' && (
          <div data-reveal="media">
            <Media resource={block.media} imgClassName="h-auto w-full" />
          </div>
        )}
      </div>
    </RevealSection>
  )
}

const SplitNarrow = ({ block, study }: { block: SplitContentNarrowBlock; study: CaseStudy }) => {
  const content =
    block.source === 'custom' ? block.body : block.body || richTextSource(study, block.source)
  const media = block.media
  if (typeof media !== 'object' || !media) return null
  return (
    <RevealSection theme={block.theme} variant={blockRevealVariants.splitContentNarrow}>
      <SplitContentNarrow bare block={block} content={content} media={media} />
    </RevealSection>
  )
}

const ImagePairSection = ({ block, study }: { block: ImagePairBlock; study: CaseStudy }) => {
  const content =
    block.source === 'custom' ? block.body : block.body || richTextSource(study, block.source)
  const { landscapeMedia, portraitMedia } = block
  if (typeof portraitMedia !== 'object' || !portraitMedia) return null
  if (typeof landscapeMedia !== 'object' || !landscapeMedia) return null
  return (
    <RevealSection theme={block.theme} variant="underMedia">
      <ImagePair
        bare
        block={block}
        content={content}
        landscape={landscapeMedia}
        portrait={portraitMedia}
      />
    </RevealSection>
  )
}

const SplitImageOffsetSection = ({
  block,
  study,
}: {
  block: SplitImageOffsetBlock
  study: CaseStudy
}) => {
  const content =
    block.source === 'custom' ? block.body : block.body || richTextSource(study, block.source)
  const { largeMedia, smallMedia } = block
  if (typeof largeMedia !== 'object' || !largeMedia) return null
  if (typeof smallMedia !== 'object' || !smallMedia) return null
  return (
    <RevealSection theme={block.theme} variant="underMedia">
      <SplitImageOffset
        bare
        block={block}
        content={content}
        large={largeMedia}
        small={smallMedia}
      />
    </RevealSection>
  )
}

const MediaShowcase = ({ block }: { block: CaseStudyMediaShowcaseBlock }) => {
  const media =
    block.media?.filter(
      (item) => typeof item === 'object' && item.usageStatus === 'public-approved',
    ) || []
  if (!media.length) return null
  return (
    <RevealSection theme={block.theme} variant="underMedia">
      <div className="container mx-auto">
        {block.heading && (
          <h2 className="mb-6 text-3xl font-normal md:text-5xl" data-reveal>
            {block.heading}
          </h2>
        )}
        {block.introduction && (
          <div data-reveal>
            <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
          </div>
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
                <figure className="snap-start" data-reveal="media" key={item.id}>
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
    </RevealSection>
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
    <RevealSection theme={block.theme} variant="intro">
      <div className="container mx-auto">
        <h2 className="mb-8 text-3xl font-normal md:text-5xl" data-reveal>
          {block.heading || 'Key decisions'}
        </h2>
        {block.introduction && (
          <div data-reveal>
            <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
          </div>
        )}
        <div className={cn('grid gap-6', block.layout === 'cards' && 'md:grid-cols-2')}>
          {decisions.map((decision) => (
            <article className="border-current/20 border p-6" data-reveal key={decision.key}>
              <h3 className="mb-4 text-2xl font-normal">{decision.title}</h3>
              {decision.decision && <p>{decision.decision}</p>}
              {decision.impact && <p className="mt-4 opacity-75">{decision.impact}</p>}
            </article>
          ))}
        </div>
      </div>
    </RevealSection>
  )
}

const Metrics = ({ block, study }: { block: CaseStudyMetricsBlock; study: CaseStudy }) => {
  const metrics = (study.metrics || []).filter(
    (metric) => metric.approvedForPublic && (block.source === 'all-public' || metric.featured),
  )
  if (!metrics.length) return null
  return (
    <RevealSection theme={block.theme} variant="intro">
      <div className="container mx-auto">
        <h2 className="mb-8 text-3xl font-normal md:text-5xl" data-reveal>
          {block.heading || 'Results'}
        </h2>
        {block.introduction && (
          <div data-reveal>
            <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
          </div>
        )}
        <dl className={cn('grid gap-8', block.layout === 'grid' && 'md:grid-cols-3')}>
          {metrics.map((metric) => (
            <div data-reveal key={metric.key}>
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
    </RevealSection>
  )
}

const TestimonialBlock = ({ block }: { block: CaseStudyTestimonialBlock }) => {
  const testimonial =
    typeof block.testimonial === 'object' ? (block.testimonial as Testimonial) : null
  if (testimonial?._status !== 'published' || testimonial.approvalStatus !== 'approved-public')
    return null
  const hasPortrait = Boolean(
    block.showPortrait && testimonial.portrait && typeof testimonial.portrait === 'object',
  )
  return (
    <RevealSection theme={block.theme} variant={hasPortrait ? 'underMedia' : 'intro'}>
      <figure className="container mx-auto max-w-4xl text-center">
        {block.showPortrait && testimonial.portrait && typeof testimonial.portrait === 'object' && (
          <div data-reveal="media">
            <Media
              className="mx-auto mb-6 w-24 overflow-hidden rounded-full"
              resource={testimonial.portrait}
            />
          </div>
        )}
        <blockquote data-reveal>
          <RichText
            className="text-2xl md:text-4xl"
            data={testimonial.quote}
            enableGutter={false}
            enableProse={false}
          />
        </blockquote>
        <figcaption className="mt-6" data-reveal>
          <strong>{testimonial.speakerName}</strong>
          {testimonial.speakerRole && `, ${testimonial.speakerRole}`}
          {testimonial.speakerOrganization && ` — ${testimonial.speakerOrganization}`}
        </figcaption>
      </figure>
    </RevealSection>
  )
}

const Transition = ({ block }: { block: CaseStudyTransitionBlock }) => (
  <RevealSection theme={block.theme} variant="intro">
    <div className="container mx-auto max-w-5xl text-center">
      {block.eyebrow && (
        <p className="mb-3 text-sm uppercase tracking-[0.2em]" data-reveal>
          {block.eyebrow}
        </p>
      )}
      <h2 className="text-4xl font-normal md:text-7xl" data-reveal>
        {block.heading}
      </h2>
      {block.body && (
        <div data-reveal>
          <RichText className="mt-8" data={block.body} enableGutter={false} />
        </div>
      )}
    </div>
  </RevealSection>
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
    <RevealSection variant="intro">
      <div className="container mx-auto">
        <h2 className="mb-8 text-3xl font-normal md:text-5xl" data-reveal>
          {block.heading || 'Related work'}
        </h2>
        <div className={cn('grid gap-8', block.layout === 'grid' && 'md:grid-cols-3')}>
          {pages.map((item) => (
            <a className="group block" data-reveal href={`/works/${item.slug}`} key={item.id}>
              {item.coverAsset && typeof item.coverAsset === 'object' && (
                <Media resource={item.coverAsset} imgClassName="h-auto w-full" />
              )}
              <h3 className="mt-4 text-2xl font-normal group-hover:underline">
                {typeof item.caseStudy === 'object' ? item.caseStudy.title : item.title}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </RevealSection>
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
        case 'splitContentNarrow':
          return <SplitNarrow block={block} key={block.id} study={study} />
        case 'imagePair':
          return <ImagePairSection block={block} key={block.id} study={study} />
        case 'splitImageOffset':
          return <SplitImageOffsetSection block={block} key={block.id} study={study} />
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
        case 'featureHeadingOffset':
          return (
            <RevealSection
              as="div"
              key={block.id}
              variant={blockRevealVariants.featureHeadingOffset}
            >
              <FeatureHeadingOffset
                {...block}
                body={resolveFeatureBody(block.body, block.source, study)}
              />
            </RevealSection>
          )
        case 'featureStatementGrid':
          return (
            <RevealSection
              as="div"
              key={block.id}
              variant={blockRevealVariants.featureStatementGrid}
            >
              <FeatureStatementGrid
                {...block}
                statement={resolveFeatureBody(block.statement, block.source, study)}
              />
            </RevealSection>
          )
        case 'featureStatementLinks':
          // Owns its own GSAP intro `ScrollReveal` shell — do not wrap again.
          return <FeatureStatementLinks key={block.id} {...block} />
        case 'industryWork':
          // Owns its own full-viewport `ScrollReveal` shell — do not wrap again.
          return <IndustryWorkBlock key={block.id} {...block} />
        case 'featureImageStatement':
          return (
            <RevealSection
              as="div"
              key={block.id}
              variant={blockRevealVariants.featureImageStatement}
            >
              <FeatureImageStatement
                {...block}
                caption={resolveFeatureBody(block.caption, block.source, study)}
              />
            </RevealSection>
          )
        case 'featureTabs':
          return (
            <RevealSection as="div" key={block.id} variant={blockRevealVariants.featureTabs}>
              <FeatureTabs
                {...block}
                tabs={(block.tabs || []).map((tab) => ({
                  ...tab,
                  description: resolveFeatureBody(tab.description, tab.source, study),
                }))}
              />
            </RevealSection>
          )
        default:
          return null
      }
    })}
  </>
)
