import type { Block } from 'payload'
import { Carousel } from '@/blocks/Carousel/config'
import { ScrollGallery } from '@/blocks/scroll-gallery/config'
import { sectionBlock } from '@/blocks/section/config'
import { relatedSelectionFields, storySectionCopyFields, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { sectionNestableBlocks } from '@/blocks/shared/section-blocks'

export const LabStorySection: Block = {
  slug: 'labStorySection',
  admin: { group: BLOCK_GROUPS.narrative },
  dbName: 'lp_story',
  interfaceName: 'LabStorySectionBlock',
  labels: { singular: 'Story section', plural: 'Story sections' },
  fields: [
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'context',
      options: ['context', 'approach', 'outcome', 'learnings', 'custom'],
      admin: { description: 'Uses canonical story content unless a website override is supplied.' },
    },
    ...storySectionCopyFields(),
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { usageStatus: { equals: 'public-approved' } },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'text-only',
      options: ['text-only', 'text-left', 'text-right', 'centered', 'sticky-media'],
    },
    themeField(),
    {
      name: 'width',
      type: 'select',
      defaultValue: 'standard',
      options: ['narrow', 'standard', 'wide'],
    },
  ],
}

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
 * A Lab Page Section nests the shared run every composition surface offers
 * (docs/blocks-reorg-roadmap.md); lab pages resolve no story copy of their
 * own, so the generic Standard heading in that run is the lab Standard.
 */
export const LabSection = sectionBlock({
  blocks: sectionNestableBlocks,
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
  // Section heading / Media and content / Media: the Section-nestable run
  ...sectionNestableBlocks,
  // Media
  LabMediaShowcase,
  ScrollGallery,
  // Narrative
  LabStorySection,
  // Interactive
  Carousel,
  // Lists & grids
  LabFacts,
  LabRelatedProjects,
]
