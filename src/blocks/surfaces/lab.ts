import type { Block } from 'payload'
import { Download } from '@/blocks/forms-and-ctas/download/config'
import { ProjectFacts } from '@/blocks/lists/project-facts/config'
import { RelatedLabProjects } from '@/blocks/lists/related-lab-projects/config'
import { Standard } from '@/blocks/section-heading/standard/config'
import { featureSourceField } from '@/blocks/shared/feature-fields'
import { sectionBlock } from '@/blocks/structure/section/config'
import { sectionNestableBlocks } from '@/blocks/surfaces/run'
import { StoryBeats } from '@/blocks/text/story-beats/config'
import { hasStorySource, withStoryBeatSource } from '@/fields/storyBeatSource'

/**
 * The Lab variant of a shared block: same slug and table, named `Lab` plus the
 * shared interface. A block that carries a story `source` gains the story
 * scope and Story Beat picker reading the related Lab Project; one without
 * passes through unchanged, so the Lab run tracks the shared run with no list
 * of its own to keep in sync.
 *
 * Standard is the one shared block that authors its copy with no `source` at
 * all, so the Lab variant puts the story picker in front of it, exactly the
 * field set Work's `caseStudyTransition` carries.
 */
const labBlock = (shared: Block): Block => {
  const block =
    shared.slug === Standard.slug
      ? { ...shared, fields: [featureSourceField(), ...shared.fields] }
      : shared
  if (!hasStorySource(block)) return block
  if (!block.interfaceName) {
    throw new Error(`labBlock: story-capable block "${block.slug}" needs an interfaceName.`)
  }
  return withStoryBeatSource(block, `Lab${block.interfaceName}`, 'lab-pages')
}

/**
 * The shared Section-nestable run (docs/blocks-reorg-roadmap.md) as Lab Pages
 * nest it, story copy resolving against the related Lab Project.
 *
 * Story beats joins the run here rather than in the shared list: it is a Text
 * block with no copy of its own, so only the two surfaces that present a story
 * record (Lab and Work Pages) have anything for it to resolve. The drawer
 * groups by `admin.group`, so it lands under Text wherever it sits here.
 *
 * Download joins here too, under Forms & CTAs: Lab and the post body are the
 * two surfaces that hand readers a file, so it stays out of the shared run.
 */
const labSectionBlocks = [...sectionNestableBlocks, StoryBeats, Download].map(labBlock)

export const LabSection = sectionBlock({
  blocks: labSectionBlocks,
  interfaceName: 'LabSectionBlock',
})

/** Lab Pages: Sections plus the two page-closing shells. */
export const labBlocks = [LabSection, ProjectFacts, RelatedLabProjects]
