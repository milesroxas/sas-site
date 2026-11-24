import type { Block } from 'payload'
import { featureSourceField } from '@/blocks/shared/feature-fields'
import { transitionFields } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * Work Pages' own Standard heading (its own slug and table, live in
 * production): the copy fields behind a canonical Case Study story picker.
 * Only ever offered as its Work variant (`WorkStandardBlock`).
 */
export const WorkStandard: Block = {
  slug: 'caseStudyTransition',
  admin: { group: BLOCK_GROUPS.sectionHeading },
  dbName: 'wp_transition',
  interfaceName: 'StandardBlock',
  labels: { singular: 'Standard', plural: 'Standard' },
  // The content picker leads: an interstitial either restates a canonical
  // story beat or writes its own copy, and that choice decides which copy
  // fields the editor ever sees.
  fields: [featureSourceField(), ...transitionFields()],
}
