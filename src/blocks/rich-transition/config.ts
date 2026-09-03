import type { Block } from 'payload'
import { transitionFields } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * The Standard section heading every composition surface offers: eyebrow,
 * heading, and optional body on a themed band, arranged by `layout`.
 *
 * Self-contained (authors its copy inline), so it sits in the shared
 * Section-nestable run. Work Pages offer `caseStudyTransition` instead: the
 * same copy fields behind a canonical story picker, on a static table that is
 * live in production.
 */
export const RichTransition: Block = {
  slug: 'richTransition',
  admin: { group: BLOCK_GROUPS.sectionHeading },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_transition`,
  interfaceName: 'RichTransitionBlock',
  labels: { singular: 'Standard', plural: 'Standard' },
  fields: [...transitionFields()],
}
