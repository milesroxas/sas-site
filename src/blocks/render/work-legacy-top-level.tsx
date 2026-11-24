import { StatementBlock } from '@/blocks/media/statement/Component'
import { PairOffsetView } from '@/blocks/media-and-content/pair-offset/PairOffsetView'
import { SplitNarrowView } from '@/blocks/media-and-content/split-narrow/SplitNarrowView'
import { StackedView } from '@/blocks/media-and-content/stacked/StackedView'
import { RevealSection } from '@/blocks/shared/RevealSection.client'
import { blockRevealVariants } from '@/blocks/shared/reveal-variants'
import { resolveStoryBlockCopy } from '@/blocks/shared/story-copy'
import { resolveVisual } from '@/features/immersive/visual'
import type {
  CaseStudy,
  Media as MediaDoc,
  WorkPage,
  WorkPairOffsetBlock,
  WorkSplitNarrowBlock,
  WorkStackedBlock,
  WorkStatementBlock,
} from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'

/**
 * TRANSITIONAL. The band Work Pages paint for a run block that still sits at
 * the top level of a page built before the Section model: adacore and vault
 * hold Stacked, Statement, Split narrow and Pair offset there. Their own band
 * runs at loose spacing, which the shared renderer does not restate, so the
 * live pages keep exactly the layout they have today until they move into
 * Sections (docs/blocks-reorg-roadmap.md section 0, step 3). Inside a Section
 * these blocks render through the shared renderer like every other surface.
 *
 * Delete this file, and its call in `RenderWorkBlocks`, in the change
 * that drops the Work run from `LEGACY_TOP_LEVEL`.
 */

/**
 * What a story-driven media block needs before it can render: the block with
 * its copy resolved against the study, that body as `content`, and its single
 * media document. Null when the block has no populated media, which is
 * nothing to show.
 */
const storyMediaProps = <T extends WorkStackedBlock | WorkSplitNarrowBlock>(
  block: T,
  study: CaseStudy,
) => {
  const visual = resolveVisual(block, { seedKey: block.id ?? undefined })
  if (!visual) return null
  const resolved = resolveStoryBlockCopy(block, study)
  return { block: resolved, content: resolved.body, visual }
}

const SplitNarrowSection = ({
  block,
  study,
}: {
  block: WorkSplitNarrowBlock
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
      <SplitNarrowView bare {...props} />
    </RevealSection>
  )
}

const StackedSection = ({ block, study }: { block: WorkStackedBlock; study: CaseStudy }) => {
  const props = storyMediaProps(block, study)
  if (!props) return null
  return (
    <RevealSection spacing="loose" theme={block.theme} variant={blockRevealVariants.fullMedia}>
      <StackedView bare {...props} />
    </RevealSection>
  )
}

const PairOffsetSection = ({ block, study }: { block: WorkPairOffsetBlock; study: CaseStudy }) => {
  const large = populatedDoc<MediaDoc>(block.largeMedia)
  const small = populatedDoc<MediaDoc>(block.smallMedia)
  if (!large || !small) return null
  const resolved = resolveStoryBlockCopy(block, study)
  return (
    <RevealSection
      spacing="loose"
      theme={block.theme}
      variant={blockRevealVariants.splitImageOffset}
    >
      <PairOffsetView bare block={resolved} content={resolved.body} large={large} small={small} />
    </RevealSection>
  )
}

const StatementSection = ({ block, study }: { block: WorkStatementBlock; study: CaseStudy }) => (
  <RevealSection
    spacing="loose"
    theme={block.theme}
    variant={blockRevealVariants.featureImageStatement}
  >
    <StatementBlock bare {...resolveStoryBlockCopy(block, study)} />
  </RevealSection>
)

type LegacyTopLevelBlock = Extract<
  NonNullable<WorkPage['layout']>[number],
  { blockType: 'featureImageStatement' | 'fullMedia' | 'splitContentNarrow' | 'splitImageOffset' }
>

const LEGACY_TOP_LEVEL_TYPES = new Set<string>([
  'featureImageStatement',
  'fullMedia',
  'splitContentNarrow',
  'splitImageOffset',
])

export const isLegacyTopLevelBlock = (block: {
  blockType?: string | null
}): block is LegacyTopLevelBlock =>
  Boolean(block.blockType && LEGACY_TOP_LEVEL_TYPES.has(block.blockType))

export const renderLegacyTopLevelBlock = (block: LegacyTopLevelBlock, study: CaseStudy) => {
  switch (block.blockType) {
    case 'fullMedia':
      return <StackedSection block={block} key={block.id} study={study} />
    case 'featureImageStatement':
      return <StatementSection block={block} key={block.id} study={study} />
    case 'splitContentNarrow':
      return <SplitNarrowSection block={block} key={block.id} study={study} />
    case 'splitImageOffset':
      return <PairOffsetSection block={block} key={block.id} study={study} />
    default:
      block satisfies never
      return null
  }
}
