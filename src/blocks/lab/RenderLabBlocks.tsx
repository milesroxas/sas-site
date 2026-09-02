import { CarouselBlock } from '@/blocks/Carousel/Component'
import { RichTransition } from '@/blocks/rich-transition/RichTransition'
import { ScrollGalleryBlock } from '@/blocks/scroll-gallery/Component'
import { MediaShowcaseGrid, publicApprovedMedia } from '@/blocks/shared/media-showcase-grid'
import { resolveRelatedPages } from '@/blocks/shared/related-pages'
import { blockRevealVariants } from '@/blocks/shared/reveal-variants'
import { Section } from '@/blocks/shared/section'
import { SplitContentNarrowBlock } from '@/blocks/split-content/Component'
import RichText from '@/components/RichText'
import type {
  LabFactsBlock,
  LabMediaShowcaseBlock,
  LabPage,
  LabProject,
  LabRelatedProjectsBlock,
  LabStorySectionBlock,
  LabTransitionBlock,
} from '@/payload-types'
import { RevealSection } from '@/shared/ui/reveal-section'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { relationshipIds } from '@/utilities/relationshipId'
import { Facts as FactsList } from './Facts'
import { RelatedProjectsList } from './RelatedProjects'
import { StorySection as StorySectionLayout } from './StorySection'

const richTextSource = (project: LabProject, source: LabStorySectionBlock['source']) => {
  if (source === 'custom') return null
  return project[source]
}

/**
 * The story section splits its copy across two fields: `custom` renders the
 * block's own body, any other source renders the project's canonical section
 * unless the editor wrote a website-only override.
 */
const resolveStorySectionBody = (block: LabStorySectionBlock, project: LabProject) =>
  block.source === 'custom'
    ? block.customBody
    : block.bodyOverride || richTextSource(project, block.source)

const StorySection = ({ block, project }: { block: LabStorySectionBlock; project: LabProject }) => (
  <StorySectionLayout block={block} content={resolveStorySectionBody(block, project)} />
)

const MediaShowcase = ({ block }: { block: LabMediaShowcaseBlock }) => {
  const media = publicApprovedMedia(block.media)
  if (!media.length) return null
  return (
    <Section theme={block.theme}>
      <div className="text-stack container mx-auto">
        {block.heading && <h2 className="text-heading-2">{block.heading}</h2>}
        {block.introduction && (
          <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
        )}
        <MediaShowcaseGrid
          layout={block.layout}
          media={media}
          showCaptions={block.showCaptions}
          showCredits={block.showCredits}
        />
      </div>
    </Section>
  )
}

/** Internal links never leave the CMS, and each column is opt-in per block. */
const Facts = ({ block, project }: { block: LabFactsBlock; project: LabProject }) => (
  <FactsList
    block={block}
    links={
      block.showLinks
        ? (project.projectLinks || []).filter((link) => link.visibility !== 'internal')
        : []
    }
    status={block.showStatus ? project.status : null}
    technologies={block.showTechnologies ? project.technologies || [] : []}
  />
)

const Transition = ({ block }: { block: LabTransitionBlock }) => <RichTransition {...block} />

const RelatedProjects = async ({
  block,
  page,
  project,
}: {
  block: LabRelatedProjectsBlock
  page: LabPage
  project: LabProject
}) => (
  <RelatedProjectsList
    block={block}
    pages={
      await resolveRelatedPages<LabPage>({
        automatic: block.selectionMode === 'automatic-capability-match',
        capabilityIds: relationshipIds(project.capabilities || []),
        capabilityPath: 'labProject.capabilities',
        collection: 'lab-pages',
        currentId: page.id,
        limit: block.limit || 3,
        manual: (page.relatedLabPages || []).filter(
          (item): item is LabPage => typeof item === 'object',
        ),
      })
    }
  />
)

/**
 * Lab blocks enter like generic page blocks: the CSS block reveal wraps each
 * section, except `splitContentNarrow`, whose `data-reveal` markers play the
 * shared GSAP reveal — the same motion it has on every other surface —
 * `carousel`, which matches Pages/Home (CSS reveal only, no GSAP shell — the
 * block paints its own band, so the wrapper never adds margin), and
 * `scrollGallery`, whose pinned shell must not sit under a transformed ancestor.
 */
export const RenderLabBlocks = async ({
  blocks,
  page,
  project,
}: {
  blocks: NonNullable<LabPage['layout']>
  page: LabPage
  project: LabProject
}) => (
  <>
    {blocks.map((block) => {
      if (block.blockType === 'splitContentNarrow') {
        return (
          <ScrollReveal as="div" key={block.id} variant={blockRevealVariants.splitContentNarrow}>
            <SplitContentNarrowBlock {...block} />
          </ScrollReveal>
        )
      }
      if (block.blockType === 'scrollGallery') {
        // Owns its own pinned full-viewport shell and section band — do not wrap again.
        return <ScrollGalleryBlock key={block.id} {...block} />
      }
      if (block.blockType === 'carousel') {
        return (
          <RevealSection key={block.id}>
            <CarouselBlock {...block} disableInnerContainer />
          </RevealSection>
        )
      }
      const content = (() => {
        switch (block.blockType) {
          case 'labStorySection':
            return <StorySection block={block} project={project} />
          case 'labMediaShowcase':
            return <MediaShowcase block={block} />
          case 'labFacts':
            return <Facts block={block} project={project} />
          case 'labTransition':
            return <Transition block={block} />
          case 'labRelatedProjects':
            return <RelatedProjects block={block} page={page} project={project} />
          default:
            return null
        }
      })()
      if (!content) return null
      return <RevealSection key={block.id}>{content}</RevealSection>
    })}
  </>
)
