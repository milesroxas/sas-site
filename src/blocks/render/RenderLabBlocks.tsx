import type { ReactNode } from 'react'
import { DownloadBlock } from '@/blocks/forms-and-ctas/download/Component'
import { ProjectFactsView } from '@/blocks/lists/project-facts/ProjectFactsView'
import { RelatedLabProjectsView } from '@/blocks/lists/related-lab-projects/RelatedLabProjectsView'
import { renderContentBlock, sectionChildComponents } from '@/blocks/render/content-block-renderer'
import { resolveRelatedPages } from '@/blocks/shared/related-pages'
import { isStoryCopyBlock, resolveStoryBlockCopy } from '@/blocks/shared/story-copy'
import { type StoryOpener, sectionOpener } from '@/blocks/shared/story-headings'
import { SectionBand } from '@/blocks/structure/section/SectionBand'
import { StoryBeatsBlock } from '@/blocks/text/story-beats/Component'
import type {
  LabPage,
  LabProject,
  LabSectionBlock,
  ProjectFactsBlock as ProjectFactsBlockData,
  RelatedLabProjectsBlock as RelatedLabProjectsBlockData,
} from '@/payload-types'
import { RevealSection } from '@/shared/ui/reveal-section'
import { relationshipIds } from '@/utilities/relationshipId'

/**
 * The shared run's components plus Story beats, the Text block only a
 * story surface offers at all, and Download. Every entry renders exactly as it does on
 * Pages once its copy is resolved against the Lab Project.
 */
const labContentComponents = {
  ...sectionChildComponents,
  resourceDownload: DownloadBlock,
  storyBeats: StoryBeatsBlock,
}

/** Internal links never leave the CMS, and each column is opt-in per block. */
const ProjectFactsBlock = ({
  block,
  project,
}: {
  block: ProjectFactsBlockData
  project: LabProject
}) => (
  <ProjectFactsView
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

const RelatedLabProjectsBlock = async ({
  block,
  page,
  project,
}: {
  block: RelatedLabProjectsBlockData
  page: LabPage
  project: LabProject
}) => (
  <RelatedLabProjectsView
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

/** A block a lab Section can nest. */
type LabSectionChildBlock = NonNullable<LabSectionBlock['blocks']>[number]

type LabLayoutBlock = NonNullable<LabPage['layout']>[number] | LabSectionChildBlock

/** A lab block the shared content renderer paints (`labContentComponents`). */
type LabContentBlock = Extract<LabLayoutBlock, { blockType: keyof typeof labContentComponents }>

const isLabContentBlock = (block: LabLayoutBlock): block is LabContentBlock =>
  block.blockType in labContentComponents

/**
 * One lab-page block. `bare` is set for blocks nested inside a Section block:
 * the block keeps its entrance but skips its band, because the Section's
 * `SectionBand` painted it.
 */
const renderLabBlock = (
  block: LabLayoutBlock,
  ctx: { bare?: boolean; opener?: StoryOpener | null; page: LabPage; project: LabProject },
): ReactNode => {
  const { bare, opener = null, page, project } = ctx
  if (block.blockType === 'section') {
    // The Section owns the band; children render bare inside it with their
    // usual entrances. The band itself never animates: a second entrance on
    // the shell would double every child's motion. Its Prose heading is the
    // opener every Story beats child sets its beat headings under.
    const children = block.blocks ?? []
    const childCtx = { ...ctx, bare: true, opener: sectionOpener(children, project) }
    return (
      <SectionBand
        customize={block.customize}
        key={block.id}
        spacing={block.spacing}
        stack={block.stack}
        theme={block.theme}
      >
        {children.map((child) => renderLabBlock(child, childCtx))}
      </SectionBand>
    )
  }
  // The shared run paints itself the same way it does on Pages and Posts: one
  // map, one set of entrances, no lab-only drift. Story-capable blocks first
  // take their copy from the Lab Project, the same way Work Pages resolve it.
  if (isLabContentBlock(block)) {
    return renderContentBlock(
      isStoryCopyBlock(block) ? resolveStoryBlockCopy(block, project, opener) : block,
      block.id ?? block.blockType,
      Boolean(bare),
      labContentComponents,
    )
  }
  const content = (() => {
    switch (block.blockType) {
      case 'labFacts':
        return <ProjectFactsBlock block={block} project={project} />
      case 'labRelatedProjects':
        return <RelatedLabProjectsBlock block={block} page={page} project={project} />
      default:
        // Every block Lab Pages offer is painted above: a block added to the
        // Lab run without a renderer fails type-checking here.
        block satisfies never
        return null
    }
  })()
  if (!content) return null
  return <RevealSection key={block.id}>{content}</RevealSection>
}

/**
 * Lab blocks enter like generic page blocks: the CSS block reveal wraps each
 * section, except the shared Section-nestable run, which
 * enters through the common content-block renderer (`data-reveal` markers play
 * the shared GSAP reveal, the same motion those blocks have on every other
 * surface; the marker-less Carousel takes the CSS reveal there).
 */
export const RenderLabBlocks = async ({
  blocks,
  page,
  project,
}: {
  blocks: NonNullable<LabPage['layout']>
  page: LabPage
  project: LabProject
}) => <>{blocks.map((block) => renderLabBlock(block, { page, project }))}</>
