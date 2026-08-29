import { AudienceTabsBlock } from '@/blocks/AudienceTabs/Component'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { FeatureHeadingOffsetBlock as FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/Component'
import { FeatureImageStatementBlock as FeatureImageStatement } from '@/blocks/feature/ImageStatement/Component'
import { FeatureStatementGridBlock as FeatureStatementGrid } from '@/blocks/feature/StatementGrid/Component'
import { FeatureStatementLinksBlock as FeatureStatementLinks } from '@/blocks/feature/StatementLinks/Component'
import { FeatureTabsBlock as FeatureTabs } from '@/blocks/feature/Tabs/Component'
import { FeaturedWorkBlock } from '@/blocks/featured-work/Component'
import { FullMedia } from '@/blocks/full-media/FullMedia'
import { IndustryWorkBlock } from '@/blocks/IndustryWork/Component'
import { ImagePair } from '@/blocks/image-pair/ImagePair'
import { RichTransition } from '@/blocks/rich-transition/RichTransition'
import { ScrollGalleryBlock } from '@/blocks/scroll-gallery/Component'
import { MediaShowcaseGrid, publicApprovedMedia } from '@/blocks/shared/media-showcase-grid'
import { resolveRelatedPages } from '@/blocks/shared/related-pages'
import { SplitContentNarrow } from '@/blocks/split-content/SplitContentNarrow'
import { SplitImageOffset } from '@/blocks/split-image-offset/SplitImageOffset'
import {
  type CaseStudyStoryBody,
  type CaseStudyStoryScope,
  type CaseStudyStorySource,
  findCaseStudyStoryBeat,
  isStoryBeatKey,
  resolveCaseStudyStoryBody,
  resolveCaseStudyStoryHeading,
} from '@/collections/CaseStudies/story'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type {
  CaseStudy,
  CaseStudyKeyDecisionsBlock,
  CaseStudyMediaShowcaseBlock,
  CaseStudyMetricsBlock,
  CaseStudyRelatedWorkBlock,
  CaseStudyTestimonialBlock,
  Media as MediaDoc,
  Testimonial,
  WorkCaseStudyStorySectionBlock,
  WorkCaseStudyTransitionBlock,
  WorkFeatureHeadingOffsetBlock,
  WorkFeatureImageStatementBlock,
  WorkFeatureStatementGridBlock,
  WorkFeatureTabsBlock,
  WorkFullMediaBlock,
  WorkImagePairBlock,
  WorkPage,
  WorkSplitContentNarrowBlock,
  WorkSplitImageOffsetBlock,
} from '@/payload-types'
import { RevealSection as CssRevealSection } from '@/shared/ui/reveal-section'
import { populatedDoc, relationshipIds } from '@/utilities/relationshipId'
import { cn } from '@/utilities/ui'
import { blockRevealVariants } from '../shared/reveal-variants'
import { RevealSection } from './RevealSection.client'

/**
 * Feature blocks carry a single rich-text body plus a `source` select. Written
 * copy always wins; an empty body pulls from the canonical case study when a
 * source other than `custom` is chosen.
 */
const resolveFeatureBody = (
  body: CaseStudyStoryBody | null | undefined,
  source: CaseStudyStorySource | null | undefined,
  storyBeatKey: string | null | undefined,
  study: CaseStudy,
  storyScope?: CaseStudyStoryScope | null,
) => body || resolveCaseStudyStoryBody(study, source, storyBeatKey, storyScope)

/**
 * The story copy every media block shares. `source` is nullable: a block that
 * hides it behind a toggle (Full media's "Show content") generates it as
 * optional, and no source resolves the same as `custom`.
 */
type StoryCopyFields = Pick<
  WorkSplitContentNarrowBlock,
  'body' | 'heading' | 'storyBeatKey' | 'storyScope'
> & {
  source?: WorkSplitContentNarrowBlock['source'] | null
}

/**
 * Media blocks (split narrow, full media, image pair, split offset) share one
 * body field: `custom` renders the body as-is, any other source falls back to
 * the canonical story content when the body is empty.
 */
const resolveStoryBody = (
  block: Pick<StoryCopyFields, 'body' | 'source' | 'storyBeatKey' | 'storyScope'>,
  study: CaseStudy,
) =>
  block.source === 'custom'
    ? block.body
    : block.body ||
      resolveCaseStudyStoryBody(study, block.source, block.storyBeatKey, block.storyScope)

const storyBeatHeading = (
  study: CaseStudy,
  source: CaseStudyStorySource | null | undefined,
  storyBeatKey: string | null | undefined,
) => {
  if (!source || source === 'custom' || !isStoryBeatKey(storyBeatKey)) return undefined
  const beat = findCaseStudyStoryBeat(study, source, storyBeatKey)
  return beat?.heading || beat?.label
}

const defaultHeading = (source: CaseStudyStorySource) =>
  ({
    context: 'Context',
    challenge: 'Challenge',
    strategy: 'Strategy',
    approach: 'Approach',
    'outcome-summary': 'Outcomes',
    learnings: 'Learnings',
    custom: '',
  })[source]

/**
 * The block with its heading filled in from the story beat. Media blocks let
 * the beat speak for itself: an empty heading on the block is not a missing
 * heading, it is a request for the one the beat already carries.
 */
const withStoryBeatHeading = <
  T extends Pick<StoryCopyFields, 'heading' | 'source' | 'storyBeatKey'>,
>(
  block: T,
  study: CaseStudy,
) => ({
  ...block,
  heading: block.heading || storyBeatHeading(study, block.source, block.storyBeatKey),
})

/**
 * The story section splits its copy across two fields: `custom` renders the
 * block's own body, any other source renders the canonical story unless the
 * editor wrote a website-only override.
 */
const resolveStorySectionBody = (block: WorkCaseStudyStorySectionBlock, study: CaseStudy) =>
  block.source === 'custom'
    ? block.customBody
    : block.bodyOverride ||
      resolveCaseStudyStoryBody(study, block.source, block.storyBeatKey, block.storyScope)

/**
 * Heading precedence for a story section: the editor's override, then the
 * heading the story beat already carries, then the name of the canonical
 * section it came from.
 */
const storySectionHeading = (block: WorkCaseStudyStorySectionBlock, study: CaseStudy) =>
  block.headingOverride ||
  storyBeatHeading(study, block.source, block.storyBeatKey) ||
  defaultHeading(block.source)

const storySectionWidths: Record<NonNullable<WorkCaseStudyStorySectionBlock['width']>, string> = {
  narrow: 'max-w-3xl',
  standard: 'max-w-5xl',
  wide: 'max-w-7xl',
}

const StorySection = ({
  block,
  study,
}: {
  block: WorkCaseStudyStorySectionBlock
  study: CaseStudy
}) => {
  const content = resolveStorySectionBody(block, study)
  if (!content) return null
  const media = populatedDoc<MediaDoc>(block.media)
  return (
    <RevealSection theme={block.theme} variant={media ? 'underMedia' : 'intro'}>
      <div
        className={cn(
          'container mx-auto grid gap-10',
          storySectionWidths[block.width ?? 'standard'],
          block.media && block.layout !== 'text-only' && 'md:grid-cols-2',
        )}
      >
        <div className={cn('text-stack', block.layout === 'text-right' && 'md:order-2')}>
          {block.eyebrow && (
            <p className="text-sm uppercase tracking-[0.2em]" data-reveal>
              {block.eyebrow}
            </p>
          )}
          <h2 className="text-heading-2" data-reveal>
            {storySectionHeading(block, study)}
          </h2>
          <div data-reveal>
            <RichText data={content} enableGutter={false} />
          </div>
        </div>
        {media && (
          <div data-reveal="media">
            <Media resource={media} imgClassName="h-auto w-full" />
          </div>
        )}
      </div>
    </RevealSection>
  )
}

/**
 * What a story-driven media block needs before it can render: the resolved
 * body, its single media document, and the block with the story beat's
 * heading filled in where the editor left the override empty. Null when the
 * block has no populated media, which is nothing to show.
 */
const storyMediaProps = <T extends WorkFullMediaBlock | WorkSplitContentNarrowBlock>(
  block: T,
  study: CaseStudy,
) => {
  const media = populatedDoc<MediaDoc>(block.media)
  if (!media) return null
  return {
    block: withStoryBeatHeading(block, study),
    content: resolveStoryBody(block, study),
    media,
  }
}

const SplitNarrow = ({
  block,
  study,
}: {
  block: WorkSplitContentNarrowBlock
  study: CaseStudy
}) => {
  const props = storyMediaProps(block, study)
  if (!props) return null
  return (
    <RevealSection
      spacing="loose"
      theme={block.theme}
      variant={blockRevealVariants.splitContentNarrow}
    >
      <SplitContentNarrow bare {...props} />
    </RevealSection>
  )
}

const FullMediaSection = ({ block, study }: { block: WorkFullMediaBlock; study: CaseStudy }) => {
  const props = storyMediaProps(block, study)
  if (!props) return null
  return (
    <RevealSection spacing="loose" theme={block.theme} variant={blockRevealVariants.fullMedia}>
      <FullMedia bare {...props} />
    </RevealSection>
  )
}

const ImagePairSection = ({ block, study }: { block: WorkImagePairBlock; study: CaseStudy }) => {
  const content = resolveStoryBody(block, study)
  const portrait = populatedDoc<MediaDoc>(block.portraitMedia)
  const landscape = populatedDoc<MediaDoc>(block.landscapeMedia)
  if (!portrait || !landscape) return null
  return (
    <RevealSection spacing="loose" theme={block.theme} variant="underMedia">
      <ImagePair
        bare
        block={withStoryBeatHeading(block, study)}
        content={content}
        landscape={landscape}
        portrait={portrait}
      />
    </RevealSection>
  )
}

const SplitImageOffsetSection = ({
  block,
  study,
}: {
  block: WorkSplitImageOffsetBlock
  study: CaseStudy
}) => {
  const content = resolveStoryBody(block, study)
  const large = populatedDoc<MediaDoc>(block.largeMedia)
  const small = populatedDoc<MediaDoc>(block.smallMedia)
  if (!large || !small) return null
  return (
    <RevealSection spacing="loose" theme={block.theme} variant="underMedia">
      <SplitImageOffset
        bare
        block={withStoryBeatHeading(block, study)}
        content={content}
        large={large}
        small={small}
      />
    </RevealSection>
  )
}

const MediaShowcase = ({ block }: { block: CaseStudyMediaShowcaseBlock }) => {
  const media = publicApprovedMedia(block.media)
  if (!media.length) return null
  return (
    <RevealSection spacing="loose" theme={block.theme} variant="underMedia">
      <div className="container mx-auto">
        {block.heading && (
          <h2 className="mb-6 text-heading-2" data-reveal>
            {block.heading}
          </h2>
        )}
        {block.introduction && (
          <div data-reveal>
            <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
          </div>
        )}
        <MediaShowcaseGrid
          layout={block.layout}
          media={media}
          reveal
          showCaptions={block.showCaptions}
          showCredits={block.showCredits}
        />
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
        <h2 className="mb-8 text-heading-2" data-reveal>
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
              <h3 className="mb-4 text-heading-3">{decision.title}</h3>
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
        <h2 className="mb-8 text-heading-2" data-reveal>
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
              <dd className="text-heading-1">
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

/**
 * A quote may only appear once it is published and the speaker has approved it
 * for public use — a draft or an internal-only testimonial never reaches the
 * site.
 */
const isPublicTestimonial = (testimonial: Testimonial | null): testimonial is Testimonial =>
  testimonial?._status === 'published' && testimonial.approvalStatus === 'approved-public'

const TestimonialBlock = ({ block }: { block: CaseStudyTestimonialBlock }) => {
  const testimonial = populatedDoc<Testimonial>(block.testimonial)
  if (!isPublicTestimonial(testimonial)) return null
  const portrait = block.showPortrait ? populatedDoc<MediaDoc>(testimonial.portrait) : null
  return (
    <RevealSection theme={block.theme} variant={portrait ? 'underMedia' : 'intro'}>
      <figure className="container mx-auto max-w-4xl text-center">
        {portrait && (
          <div data-reveal="media">
            <Media className="mx-auto mb-6 w-24 overflow-hidden rounded-full" resource={portrait} />
          </div>
        )}
        <blockquote data-reveal>
          <RichText
            className="text-heading-2 leading-snug [&_p+p]:mt-4"
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

/**
 * Transition band: no bottom padding, so it runs into the next block.
 *
 * An interstitial with a canonical source restates a story beat, so its
 * heading and body fall back the same way the feature blocks do — written
 * copy first, then the canonical content the picker points at.
 */
const Transition = ({
  block,
  study,
}: {
  block: WorkCaseStudyTransitionBlock
  study: CaseStudy
}) => (
  <RevealSection className="pb-0 md:pb-0" theme={block.theme} variant="intro">
    <RichTransition
      bare
      {...block}
      body={resolveFeatureBody(
        block.body,
        block.source,
        block.storyBeatKey,
        study,
        block.storyScope,
      )}
      heading={
        block.heading ||
        resolveCaseStudyStoryHeading(study, block.source, block.storyBeatKey, block.storyScope) ||
        ''
      }
    />
  </RevealSection>
)

const RelatedWorkCard = ({ page }: { page: WorkPage }) => {
  const cover = populatedDoc<MediaDoc>(page.coverAsset)
  const caseStudy = populatedDoc<CaseStudy>(page.caseStudy)
  return (
    <a className="group pressable pressable-subtle block" data-reveal href={`/works/${page.slug}`}>
      {cover && <Media resource={cover} imgClassName="h-auto w-full" />}
      <h3 className="mt-4 text-heading-3 group-hover:underline">
        {caseStudy ? caseStudy.title : page.title}
      </h3>
    </a>
  )
}

const RelatedWork = async ({
  block,
  page,
  study,
}: {
  block: CaseStudyRelatedWorkBlock
  page: WorkPage
  study: CaseStudy
}) => {
  const pages = await resolveRelatedPages<WorkPage>({
    automatic: block.selectionMode === 'automatic-capability-match',
    capabilityIds: relationshipIds(study.featuredCapabilities || []),
    capabilityPath: 'caseStudy.featuredCapabilities',
    collection: 'work-pages',
    currentId: page.id,
    limit: block.limit || 3,
    manual: (page.relatedWorkPages || []).filter(
      (item): item is WorkPage => typeof item === 'object',
    ),
  })
  if (!pages.length) return null
  return (
    <RevealSection variant="intro">
      <div className="container mx-auto">
        <h2 className="mb-8 text-heading-2" data-reveal>
          {block.heading || 'Related work'}
        </h2>
        <div className={cn('grid gap-8', block.layout === 'grid' && 'md:grid-cols-3')}>
          {pages.map((item) => (
            <RelatedWorkCard key={item.id} page={item} />
          ))}
        </div>
      </div>
    </RevealSection>
  )
}

const FeatureHeadingOffsetSection = ({
  block,
  study,
}: {
  block: WorkFeatureHeadingOffsetBlock
  study: CaseStudy
}) => (
  <RevealSection theme={block.theme} variant={blockRevealVariants.featureHeadingOffset}>
    <FeatureHeadingOffset
      bare
      {...block}
      body={resolveFeatureBody(
        block.body,
        block.source,
        block.storyBeatKey,
        study,
        block.storyScope,
      )}
      heading={
        block.heading ||
        resolveCaseStudyStoryHeading(study, block.source, block.storyBeatKey, block.storyScope) ||
        ''
      }
    />
  </RevealSection>
)

const FeatureStatementGridSection = ({
  block,
  study,
}: {
  block: WorkFeatureStatementGridBlock
  study: CaseStudy
}) => (
  <RevealSection theme={block.theme} variant={blockRevealVariants.featureStatementGrid}>
    <FeatureStatementGrid
      bare
      {...block}
      heading={
        block.heading ||
        resolveCaseStudyStoryHeading(study, block.source, block.storyBeatKey, block.storyScope) ||
        ''
      }
      statement={resolveFeatureBody(
        block.statement,
        block.source,
        block.storyBeatKey,
        study,
        block.storyScope,
      )}
    />
  </RevealSection>
)

const FeatureImageStatementSection = ({
  block,
  study,
}: {
  block: WorkFeatureImageStatementBlock
  study: CaseStudy
}) => (
  <RevealSection
    spacing="loose"
    theme={block.theme}
    variant={blockRevealVariants.featureImageStatement}
  >
    <FeatureImageStatement
      bare
      {...block}
      caption={resolveFeatureBody(
        block.caption,
        block.source,
        block.storyBeatKey,
        study,
        block.storyScope,
      )}
    />
  </RevealSection>
)

const FeatureTabsSection = ({
  block,
  study,
}: {
  block: WorkFeatureTabsBlock
  study: CaseStudy
}) => (
  <RevealSection theme={block.theme} variant={blockRevealVariants.featureTabs}>
    <FeatureTabs
      bare
      {...block}
      tabs={(block.tabs || []).map((tab) => ({
        ...tab,
        description: resolveFeatureBody(
          tab.description,
          tab.source,
          tab.storyBeatKey,
          study,
          tab.storyScope,
        ),
        heading:
          tab.heading ||
          resolveCaseStudyStoryHeading(study, tab.source, tab.storyBeatKey, tab.storyScope) ||
          '',
      }))}
    />
  </RevealSection>
)

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
        case 'fullMedia':
          return <FullMediaSection block={block} key={block.id} study={study} />
        case 'imagePair':
          return <ImagePairSection block={block} key={block.id} study={study} />
        case 'splitImageOffset':
          return <SplitImageOffsetSection block={block} key={block.id} study={study} />
        case 'caseStudyMediaShowcase':
          return <MediaShowcase block={block} key={block.id} />
        case 'scrollGallery':
          // Owns its own pinned full-viewport shell and section band — do not wrap again.
          return <ScrollGalleryBlock key={block.id} {...block} />
        case 'caseStudyKeyDecisions':
          return <KeyDecisions block={block} key={block.id} study={study} />
        case 'caseStudyMetrics':
          return <Metrics block={block} key={block.id} study={study} />
        case 'caseStudyTestimonial':
          return <TestimonialBlock block={block} key={block.id} />
        case 'caseStudyTransition':
          return <Transition block={block} key={block.id} study={study} />
        case 'caseStudyRelatedWork':
          return <RelatedWork block={block} key={block.id} page={page} study={study} />
        case 'featureHeadingOffset':
          return <FeatureHeadingOffsetSection block={block} key={block.id} study={study} />
        case 'featureStatementGrid':
          return <FeatureStatementGridSection block={block} key={block.id} study={study} />
        case 'featureStatementLinks':
          // Owns its own GSAP intro `ScrollReveal` shell — do not wrap again.
          return <FeatureStatementLinks key={block.id} {...block} />
        case 'industryWork':
          // Owns its own full-viewport `ScrollReveal` shell — do not wrap again.
          return <IndustryWorkBlock key={block.id} {...block} />
        case 'featuredWork':
          // Owns its own pinned shell and section band — do not wrap again.
          return <FeaturedWorkBlock key={block.id} {...block} />
        case 'featureImageStatement':
          return <FeatureImageStatementSection block={block} key={block.id} study={study} />
        case 'audienceTabs':
          // Owns its own GSAP entrance + swap shell — do not wrap again.
          return <AudienceTabsBlock key={block.id} {...block} />
        case 'featureTabs':
          return <FeatureTabsSection block={block} key={block.id} study={study} />
        case 'carousel':
          // Same CSS entrance as Pages/Home — no data-reveal markers, and the
          // GSAP shell would put a transform on an ancestor of embla. The
          // block paints its own band, so the wrapper only carries the entrance.
          return (
            <CssRevealSection key={block.id}>
              <CarouselBlock {...block} disableInnerContainer />
            </CssRevealSection>
          )
        default:
          return null
      }
    })}
  </>
)
