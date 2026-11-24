import type { ReactNode } from 'react'
import { RichTransition } from '@/blocks/rich-transition/RichTransition'
import { SectionBand } from '@/blocks/section/SectionBand'
import { renderContentBlock, sectionChildComponents } from '@/blocks/shared/content-block-renderer'
import { MediaShowcaseGrid, publicApprovedMedia } from '@/blocks/shared/media-showcase-grid'
import {
  isStoryCopyBlock,
  resolveStoryBlockCopy,
  resolveStorySectionCopy,
} from '@/blocks/shared/story-copy'
import { type StoryOpener, sectionOpener } from '@/blocks/shared/story-headings'
import { StoryBeatsBlock } from '@/blocks/story-beats/Component'
import RichText from '@/components/RichText'
import type {
  CaseStudy,
  CaseStudyMediaShowcaseBlock,
  WorkCaseStudyStorySectionBlock,
  WorkCaseStudyTransitionBlock,
  WorkPage,
  WorkSectionBlock,
} from '@/payload-types'
import { isLegacyTopLevelBlock, renderLegacyTopLevelBlock } from './legacy-top-level'
import { RevealSection } from './RevealSection.client'
import { StorySection as StorySectionLayout } from './StorySection'

/**
 * The shared run's components plus Story beats, the Text block only a story
 * surface offers (`blocks/story-beats/config.ts`). Every entry paints the band
 * and entrance it has on every other surface, the same map Lab Pages use.
 */
const workContentComponents = {
  ...sectionChildComponents,
  storyBeats: StoryBeatsBlock,
}

const StorySection = ({
  block,
  study,
}: {
  block: WorkCaseStudyStorySectionBlock
  study: CaseStudy
}) => <StorySectionLayout block={block} {...resolveStorySectionCopy(block, study)} />

const MediaShowcase = ({ block }: { block: CaseStudyMediaShowcaseBlock }) => {
  const media = publicApprovedMedia(block.media)
  if (!media.length) return null
  return (
    <RevealSection spacing="loose" theme={block.theme} variant="underMedia">
      <div className="container mx-auto">
        {block.heading && (
          <h2 className="mb-6 text-heading" data-reveal>
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

/**
 * Transition band: no bottom padding, so it runs into the next block.
 *
 * An interstitial with a canonical source restates a story beat, so its
 * heading and body resolve like every heading-led block (`story-copy.ts`).
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
    {/* Always `bare` (the reveal band above paints the surface); `stacked`
        is the narrower question of whether a Section's stack sits under it. */}
    <RichTransition bare stacked={bare} {...resolveStoryBlockCopy(block, study)} />
  </RevealSection>
)

/** A block a work Section can nest. */
type WorkSectionChildBlock = NonNullable<WorkSectionBlock['blocks']>[number]

type WorkLayoutBlock = NonNullable<WorkPage['layout']>[number] | WorkSectionChildBlock

/** A work block the shared content renderer paints (`workContentComponents`). */
type WorkContentBlock = Extract<WorkLayoutBlock, { blockType: keyof typeof workContentComponents }>

const isWorkContentBlock = (block: WorkLayoutBlock): block is WorkContentBlock =>
  block.blockType in workContentComponents

/**
 * One work-page block. `bare` is set for blocks nested inside a Section
 * block: the block keeps its scroll entrance but skips its band, because the
 * Section's `SectionBand` painted it.
 *
 * The shared run goes through the shared renderer, exactly as on Lab Pages:
 * a story-capable block first takes its copy from the case study, then paints
 * the band and entrance it has everywhere else. Only Work's own blocks (Story
 * section, Media showcase, the Work Standard heading, Featured work) are
 * painted here.
 */
const renderWorkBlock = (
  block: WorkLayoutBlock,
  ctx: { bare?: boolean; opener?: StoryOpener | null; study: CaseStudy },
): ReactNode => {
  const { bare, opener = null, study } = ctx
  if (block.blockType === 'section') {
    // The Section owns the band; children render bare inside it with their
    // usual entrances. The band itself never animates: a second entrance on
    // the shell would double every child's motion. Its Prose heading is the
    // opener every Story beats child sets its beat headings under.
    const children = block.blocks ?? []
    const childCtx = { ...ctx, bare: true, opener: sectionOpener(children, study) }
    return (
      <SectionBand
        customize={block.customize}
        key={block.id}
        spacing={block.spacing}
        stack={block.stack}
        theme={block.theme}
      >
        {children.map((child) => renderWorkBlock(child, childCtx))}
      </SectionBand>
    )
  }
  // Transitional: flat pages keep their top-level band (legacy-top-level.tsx).
  if (!bare && isLegacyTopLevelBlock(block)) return renderLegacyTopLevelBlock(block, study)
  if (isWorkContentBlock(block)) {
    return renderContentBlock(
      isStoryCopyBlock(block) ? resolveStoryBlockCopy(block, study, opener) : block,
      block.id ?? block.blockType,
      Boolean(bare),
      workContentComponents,
    )
  }
  switch (block.blockType) {
    case 'caseStudyStorySection':
      return <StorySection block={block} key={block.id} study={study} />
    case 'caseStudyMediaShowcase':
      return <MediaShowcase block={block} key={block.id} />
    case 'caseStudyTransition':
      return <Transition bare={bare} block={block} key={block.id} study={study} />
    case 'featuredWork':
      // Work pages always close with this block from the Related Work tab.
      return null
    default:
      // Every block Work Pages offer is painted above: a block added to the
      // Work run without a renderer fails type-checking here instead of
      // rendering nothing.
      block satisfies never
      return null
  }
}

export const RenderCaseStudyBlocks = async ({
  blocks,
  study,
}: {
  blocks: NonNullable<WorkPage['layout']>
  study: CaseStudy
}) => <>{blocks.map((block) => renderWorkBlock(block, { study }))}</>
