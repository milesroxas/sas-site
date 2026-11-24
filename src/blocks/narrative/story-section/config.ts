import type { Block } from 'payload'
import { storySectionFields } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

export const StorySection: Block = {
  slug: 'caseStudyStorySection',
  admin: { group: BLOCK_GROUPS.narrative },
  dbName: 'wp_story',
  interfaceName: 'StorySectionBlock',
  labels: { singular: 'Story section', plural: 'Story sections' },
  fields: storySectionFields(),
}
