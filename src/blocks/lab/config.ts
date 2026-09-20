import type { Block } from 'payload'
import { Content } from '@/blocks/Content/config'
import { FeatureStatementGrid } from '@/blocks/feature/StatementGrid/config'
import { featureSourceField } from '@/blocks/feature/shared'
import { RichTransition } from '@/blocks/rich-transition/config'
import { ScrollGallery } from '@/blocks/scroll-gallery/config'
import { sectionBlock } from '@/blocks/section/config'
import { relatedSelectionFields, storySectionFields, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { sectionNestableBlocks } from '@/blocks/shared/section-blocks'
import { StoryBeats } from '@/blocks/story-beats/config'
import { hasStorySource, withStoryBeatSource } from '@/fields/storyBeatSource'

export const LabStorySection: Block = withStoryBeatSource(
  {
    slug: 'labStorySection',
    admin: { group: BLOCK_GROUPS.narrative },
    dbName: 'lp_story',
    interfaceName: 'LabStorySectionBlock',
    labels: { singular: 'Story section', plural: 'Story sections' },
    fields: storySectionFields(),
  },
  'LabStorySectionBlock',
  'lab-pages',
)

export const LabMediaShowcase: Block = {
  slug: 'labMediaShowcase',
  admin: { group: BLOCK_GROUPS.media },
  dbName: 'lp_media',
  interfaceName: 'LabMediaShowcaseBlock',
  labels: { singular: 'Media showcase', plural: 'Media showcases' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'introduction', type: 'richText' },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      filterOptions: { usageStatus: { equals: 'public-approved' } },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: ['single', 'grid', 'horizontal', 'stacked', 'full-bleed', 'comparison'],
    },
    themeField(),
    { name: 'showCaptions', type: 'checkbox', defaultValue: true },
    { name: 'showCredits', type: 'checkbox', defaultValue: true },
  ],
}

export const LabFacts: Block = {
  slug: 'labFacts',
  admin: { group: BLOCK_GROUPS.lists },
  dbName: 'lp_facts',
  interfaceName: 'LabFactsBlock',
  labels: { singular: 'Project facts', plural: 'Project facts' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'About this project' },
    { name: 'showStatus', type: 'checkbox', defaultValue: true },
    { name: 'showTechnologies', type: 'checkbox', defaultValue: true },
    {
      name: 'showLinks',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Only links marked public are ever rendered.' },
    },
    themeField(),
  ],
}

export const LabRelatedProjects: Block = {
  slug: 'labRelatedProjects',
  admin: { group: BLOCK_GROUPS.lists },
  dbName: 'lp_related',
  interfaceName: 'LabRelatedProjectsBlock',
  labels: { singular: 'Related lab projects', plural: 'Related lab projects' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'More from the lab' },
    ...relatedSelectionFields(),
  ],
}

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
    shared.slug === RichTransition.slug
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
 * offer it: in a Section and at the top level while the Section transition is
 * underway, story copy resolving against the related Lab Project.
 *
 * Story beats joins the run here rather than in the shared list: it is a Text
 * block with no copy of its own, so only the two surfaces that present a story
 * record (Lab and Work Pages) have anything for it to resolve. The drawer
 * groups by `admin.group`, so it lands under Text wherever it sits here.
 */
const labSectionBlocks = [...sectionNestableBlocks, StoryBeats].map(labBlock)

export const LabSection = sectionBlock({
  // Content carries no story copy; it closes the nested list under Custom
  // exactly as `sectionChildBlocks` does on every other surface.
  blocks: [...labSectionBlocks, Content],
  interfaceName: 'LabSectionBlock',
})

/**
 * Ordered by `admin.group`: the blocks drawer renders groups in
 * first-appearance order, and the reorganized groups lead
 * (docs/blocks-reorg-roadmap.md) ahead of the legacy ones.
 */
export const labBlocks = [
  // Structure
  LabSection,
  // Section heading / Media and content / Media / Text / Interactive / Lists: the Section-nestable run
  ...labSectionBlocks,
  // Media
  LabMediaShowcase,
  ScrollGallery,
  // Narrative
  LabStorySection,
  // Statements
  labBlock(FeatureStatementGrid),
  // Lists (legacy, top-level only)
  LabFacts,
  LabRelatedProjects,
]
