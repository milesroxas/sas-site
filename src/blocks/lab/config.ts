import type { Block, SelectField } from 'payload'
import { SplitContentNarrow } from '@/blocks/split-content/config'

const themeField = (name = 'theme'): SelectField => ({
  name,
  type: 'select',
  defaultValue: 'light',
  options: ['light', 'dark', 'neutral', 'brand'],
  admin: {
    description:
      'Section surface within the visitor\'s site theme. Does not force light/dark mode — "dark" is a contrasted band in whichever theme the visitor chose.',
  },
})

export const LabStorySection: Block = {
  slug: 'labStorySection',
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
    { name: 'eyebrow', type: 'text' },
    { name: 'headingOverride', type: 'text' },
    {
      name: 'bodyOverride',
      type: 'richText',
      admin: { description: 'Website-only override; canonical content is unchanged.' },
    },
    {
      name: 'customBody',
      type: 'richText',
      admin: { condition: (_, siblingData) => siblingData?.source === 'custom' },
    },
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

export const LabTransition: Block = {
  slug: 'labTransition',
  dbName: 'lp_transition',
  interfaceName: 'LabTransitionBlock',
  labels: { singular: 'Rich transition', plural: 'Rich transitions' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'richText' },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'centered',
      options: ['left', 'centered', 'split', 'statement'],
    },
    themeField(),
  ],
}

export const LabRelatedProjects: Block = {
  slug: 'labRelatedProjects',
  dbName: 'lp_related',
  interfaceName: 'LabRelatedProjectsBlock',
  labels: { singular: 'Related lab projects', plural: 'Related lab projects' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'More from the lab' },
    {
      name: 'selectionMode',
      type: 'select',
      defaultValue: 'document-settings',
      options: ['document-settings', 'automatic-capability-match'],
    },
    { name: 'limit', type: 'number', min: 1, max: 12, defaultValue: 3 },
    { name: 'layout', type: 'select', defaultValue: 'grid', options: ['grid', 'list', 'feature'] },
  ],
}

export const labBlocks = [
  LabStorySection,
  LabMediaShowcase,
  LabFacts,
  LabTransition,
  LabRelatedProjects,
  SplitContentNarrow,
]
