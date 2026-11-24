import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/** Lab Pages only: the related Lab Project's status, stack and public links. */
export const ProjectFacts: Block = {
  slug: 'labFacts',
  admin: { group: BLOCK_GROUPS.lists },
  dbName: 'lp_facts',
  interfaceName: 'ProjectFactsBlock',
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
