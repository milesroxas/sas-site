import type { ReactNode } from 'react'
import { AudienceTabsBlock } from '@/blocks/AudienceTabs/Component'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FaqBlock } from '@/blocks/faq/Component'
import { FeatureHeadingOffsetBlock as FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/Component'
import { FeatureImageStatementBlock as FeatureImageStatement } from '@/blocks/feature/ImageStatement/Component'
import { FeatureStatementGridBlock as FeatureStatementGrid } from '@/blocks/feature/StatementGrid/Component'
import { FeatureStatementLinksBlock as FeatureStatementLinks } from '@/blocks/feature/StatementLinks/Component'
import { FeatureTabsBlock as FeatureTabs } from '@/blocks/feature/Tabs/Component'
import { FullMedia } from '@/blocks/full-media/FullMedia'
import { IndustryWorkBlock } from '@/blocks/IndustryWork/Component'
import { ImagePair } from '@/blocks/image-pair/ImagePair'
import { MediaBlock as MediaBlockComponent } from '@/blocks/MediaBlock/Component'
import { MediaContentSplit } from '@/blocks/media-content-split/MediaContentSplit'
import { RichTransition } from '@/blocks/rich-transition/RichTransition'
import { ScrollGalleryBlock } from '@/blocks/scroll-gallery/Component'
import { SectionBand } from '@/blocks/section/SectionBand'
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
  WorkMediaContentSplitBlock,
  WorkPage,
  WorkSectionBlock,
  WorkSplitContentNarrowBlock,
  WorkSplitImageOffsetBlock,
} from '@/payload-types'
import { RevealSection as CssRevealSection } from '@/shared/ui/reveal-section'
import { hasRichTextContent } from '@/utilities/hasRichTextContent'
import { populatedDoc, relationshipIds } from '@/utilities/relationshipId'
import { blockRevealVariants } from '../shared/reveal-variants'
import { KeyDecisions as KeyDecisionsList } from './KeyDecisions'
import { Metrics as MetricsList } from './Metrics'
import { RelatedWorkList } from './RelatedWork'
import { RevealSection } from './RevealSection.client'
import { StorySection as StorySectionLayout } from './StorySection'
import { TestimonialBlock as TestimonialQuote } from './Testimonial'

/**
 * Feature blocks carry a single rich-text body plus a `source` select. Written
 * copy always wins; an empty body pulls from the canonical case study when a
 * source other than `custom` is chosen. Empty means no real content — a
 * touched-then-cleared editor saves an empty paragraph that must not shadow
 * the pulled source.
 */
const resolveFeatureBody = (
  body: CaseStudyStoryBody | null | undefined,
  source: CaseStudyStorySource | null | undefined,
  storyBeatKey: string | null | undefined,
  study: CaseStudy,
  storyScope?: CaseStudyStoryScope | null,
) =>
  hasRichTextContent(body)
    ? body
    : resolveCaseStudyStoryBody(study, source, storyBeatKey, storyScope)

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
  block.source === 'custom' || hasRichTextContent(block.body)
    ? block.body
    : resolveCaseStudyStoryBody(study, block.source, block.storyBeatKey, block.storyScope)

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
    : hasRichTextContent(block.bodyOverride)
      ? block.bodyOverride
      : resolveCaseStudyStoryBody(study, block.source, block.storyBeatKey, block.storyScope)

/**
 * Heading precedence for a story section: the editor's override, then the
 * heading the story beat already carries, then the name of the canonical
 * section it came from.
 */
const storySectionHeading = (block: WorkCaseStudyStorySectionBlock, study: CaseStudy) =>
  block.headingOverride ||
  storyBeatHeading(study, block.source, block.storyBeatKey) ||
  defaultHeading(block.source)

const StorySection = ({
  block,
  study,
}: {
  block: WorkCaseStudyStorySectionBlock
  study: CaseStudy
}) => (
  <StorySectionLayout
    block={block}
    content={resolveStorySectionBody(block, study)}
    heading={storySectionHeading(block, study)}
  />
)

/**
 * What a story-driven media block needs before it can render: the resolved
 * body, its single media document, and the block with the story beat's
 * heading filled in where the editor left the override empty. Null when the
 * block has no populated media, which is nothing to show.
 */
const storyMediaProps = <
  T extends WorkFullMediaBlock | WorkMediaContentSplitBlock | WorkSplitContentNarrowBlock,
>(
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
  bare,
  block,
  study,
}: {
  bare?: boolean
  block: WorkSplitContentNarrowBlock
  study: CaseStudy
}) => {
  const props = storyMediaProps(block, study)
  if (!props) return null
  return (
    <RevealSection
      bare={bare}
      spacing="loose"
      theme={block.theme}
      variant={blockRevealVariants.splitContentNarrow}
    >
      <SplitContentNarrow bare {...props} />
    </RevealSection>
  )
}

const FullMediaSection = ({
  bare,
  block,
  study,
}: {
  bare?: boolean
  block: WorkFullMediaBlock
  study: CaseStudy
}) => {
  const props = storyMediaProps(block, study)
  if (!props) return null
  return (
    <RevealSection
      bare={bare}
      spacing="loose"
      theme={block.theme}
      variant={blockRevealVariants.fullMedia}
    >
      <FullMedia bare {...props} />
    </RevealSection>
  )
}

const MediaContentSplitSection = ({
  bare,
  block,
  study,
}: {
  bare?: boolean
  block: WorkMediaContentSplitBlock
  study: CaseStudy
}) => {
  const props = storyMediaProps(block, study)
  if (!props) return null
  return (
    <RevealSection
      bare={bare}
      spacing="loose"
      theme={block.theme}
      variant={blockRevealVariants.mediaContentSplit}
    >
      <MediaContentSplit bare {...props} />
    </RevealSection>
  )
}

const ImagePairSection = ({
  bare,
  block,
  study,
}: {
  bare?: boolean
  block: WorkImagePairBlock
  study: CaseStudy
}) => {
  const content = resolveStoryBody(block, study)
  const portrait = populatedDoc<MediaDoc>(block.portraitMedia)
  const landscape = populatedDoc<MediaDoc>(block.landscapeMedia)
  if (!portrait || !landscape) return null
  return (
    <RevealSection
      bare={bare}
      spacing="loose"
      theme={block.theme}
      variant={blockRevealVariants.imagePair}
    >
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
  bare,
  block,
  study,
}: {
  bare?: boolean
  block: WorkSplitImageOffsetBlock
  study: CaseStudy
}) => {
  const content = resolveStoryBody(block, study)
  const large = populatedDoc<MediaDoc>(block.largeMedia)
  const small = populatedDoc<MediaDoc>(block.smallMedia)
  if (!large || !small) return null
  return (
    <RevealSection
      bare={bare}
      spacing="loose"
      theme={block.theme}
      variant={blockRevealVariants.splitImageOffset}
    >
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

/** `featured` narrows the study's decisions to the ones marked for prominence. */
const KeyDecisions = ({
  block,
  study,
}: {
  block: CaseStudyKeyDecisionsBlock
  study: CaseStudy
}) => (
  <KeyDecisionsList
    block={block}
    decisions={(study.keyDecisions || []).filter(
      (decision) => block.source === 'all' || decision.featured,
    )}
  />
)

/** Only public-approved metrics leave the study; `featured` narrows further. */
const Metrics = ({ block, study }: { block: CaseStudyMetricsBlock; study: CaseStudy }) => (
  <MetricsList
    block={block}
    metrics={(study.metrics || []).filter(
      (metric) => metric.approvedForPublic && (block.source === 'all-public' || metric.featured),
    )}
  />
)

const TestimonialBlock = ({ block }: { block: CaseStudyTestimonialBlock }) => (
  <TestimonialQuote block={block} testimonial={populatedDoc<Testimonial>(block.testimonial)} />
)

/**
 * Transition band: no bottom padding, so it runs into the next block.
 *
 * An interstitial with a canonical source restates a story beat, so its
 * heading and body fall back the same way the feature blocks do — written
 * copy first, then the canonical content the picker points at.
 */
const Transition = ({
  bare,
  block,
  study,
}: {
  bare?: boolean
  block: WorkCaseStudyTransitionBlock
  study: CaseStudy
}) => (
  <RevealSection bare={bare} className="pb-0 md:pb-0" theme={block.theme} variant="intro">
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

const RelatedWork = async ({
  block,
  page,
  study,
}: {
  block: CaseStudyRelatedWorkBlock
  page: WorkPage
  study: CaseStudy
}) => (
  <RelatedWorkList
    block={block}
    pages={
      await resolveRelatedPages<WorkPage>({
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
    }
  />
)

const FeatureHeadingOffsetSection = ({
  bare,
  block,
  study,
}: {
  bare?: boolean
  block: WorkFeatureHeadingOffsetBlock
  study: CaseStudy
}) => (
  <RevealSection bare={bare} theme={block.theme} variant={blockRevealVariants.featureHeadingOffset}>
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
  bare,
  block,
  study,
}: {
  bare?: boolean
  block: WorkFeatureImageStatementBlock
  study: CaseStudy
}) => (
  <RevealSection
    bare={bare}
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

/** A block a work Section can nest: the child union carries the nested-only ones (Content). */
type WorkSectionChildBlock = NonNullable<WorkSectionBlock['blocks']>[number]

type WorkLayoutBlock = NonNullable<WorkPage['layout']>[number] | WorkSectionChildBlock

/**
 * One work-page block. `bare` is set for blocks nested inside a Section
 * block: the block keeps its scroll entrance but skips its band, because the
 * Section's `SectionBand` painted it. Only the Section-nestable blocks ever
 * receive `bare: true`, so the self-shell cases ignore it.
 */
const renderWorkBlock = (
  block: WorkLayoutBlock,
  ctx: { bare?: boolean; page: WorkPage; study: CaseStudy },
): ReactNode => {
  const { bare, page, study } = ctx
  switch (block.blockType) {
    case 'section':
      // The Section owns the band; children render bare inside it with their
      // usual entrances. The band itself never animates: a second entrance
      // on the shell would double every child's motion.
      return (
        <SectionBand
          customize={block.customize}
          key={block.id}
          spacing={block.spacing}
          theme={block.theme}
        >
          {(block.blocks ?? []).map((child) => renderWorkBlock(child, { ...ctx, bare: true }))}
        </SectionBand>
      )
    case 'caseStudyStorySection':
      return <StorySection block={block} key={block.id} study={study} />
    case 'splitContentNarrow':
      return <SplitNarrow bare={bare} block={block} key={block.id} study={study} />
    case 'fullMedia':
      return <FullMediaSection bare={bare} block={block} key={block.id} study={study} />
    case 'mediaContentSplit':
      return <MediaContentSplitSection bare={bare} block={block} key={block.id} study={study} />
    case 'imagePair':
      return <ImagePairSection bare={bare} block={block} key={block.id} study={study} />
    case 'splitImageOffset':
      return <SplitImageOffsetSection bare={bare} block={block} key={block.id} study={study} />
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
      return <Transition bare={bare} block={block} key={block.id} study={study} />
    case 'caseStudyRelatedWork':
      return <RelatedWork block={block} key={block.id} page={page} study={study} />
    case 'featureHeadingOffset':
      return <FeatureHeadingOffsetSection bare={bare} block={block} key={block.id} study={study} />
    case 'featureStatementGrid':
      return <FeatureStatementGridSection block={block} key={block.id} study={study} />
    case 'featureStatementLinks':
      // Owns its own GSAP intro `ScrollReveal` shell — do not wrap again.
      return <FeatureStatementLinks key={block.id} {...block} />
    case 'industryWork':
      // Owns its own full-viewport `ScrollReveal` shell — do not wrap again.
      return <IndustryWorkBlock key={block.id} {...block} />
    case 'featuredWork':
      // Work pages always close with this block from the Related Work tab.
      return null
    case 'featureImageStatement':
      return <FeatureImageStatementSection bare={bare} block={block} key={block.id} study={study} />
    case 'mediaBlock':
      // Caption carries no story copy: it paints the same band and caption it
      // does on every other surface, bare inside a Section.
      return (
        <CssRevealSection key={block.id}>
          <MediaBlockComponent {...block} bare={bare} disableInnerContainer />
        </CssRevealSection>
      )
    case 'content':
      // Same deal for the multi-column Content block: no story copy, same
      // entrance as Pages, bare inside a Section.
      return (
        <CssRevealSection key={block.id}>
          <ContentBlock {...block} bare={bare} />
        </CssRevealSection>
      )
    case 'audienceTabs':
      // Owns its own GSAP entrance + swap shell — do not wrap again.
      return <AudienceTabsBlock key={block.id} {...block} />
    case 'featureTabs':
      return <FeatureTabsSection block={block} key={block.id} study={study} />
    case 'carousel':
      // Same CSS entrance as Pages/Home — no data-reveal markers, and the
      // GSAP shell would put a transform on an ancestor of embla. The
      // block paints its own band (bare inside a Section), so the wrapper
      // only carries the entrance.
      return (
        <CssRevealSection key={block.id}>
          <CarouselBlock {...block} bare={bare} disableInnerContainer />
        </CssRevealSection>
      )
    case 'faq':
      // FAQ copy is the block's own, so nothing resolves against the study:
      // the same intro reveal and band it has on every other surface.
      return (
        <RevealSection
          bare={bare}
          key={block.id}
          theme={block.theme}
          variant={blockRevealVariants.faq}
        >
          <FaqBlock {...block} bare />
        </RevealSection>
      )
    default:
      return null
  }
}

export const RenderCaseStudyBlocks = async ({
  blocks,
  page,
  study,
}: {
  blocks: NonNullable<WorkPage['layout']>
  page: WorkPage
  study: CaseStudy
}) => <>{blocks.map((block) => renderWorkBlock(block, { page, study }))}</>
