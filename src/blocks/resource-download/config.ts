import type { Block } from 'payload'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * Download: a call to action that hands the reader one file from Resources
 * (any file type). Offered twice from this one config, the way Code is: inline
 * in a post body (a Lexical block, stored in the body's JSON) and in the Lab
 * Page composition, at the top level and nested in a Section.
 *
 * Copy falls back to the resource itself, so the common case is one pick: the
 * heading to the resource's title, the description to its description, and
 * the button to "Download" plus the file type ("Download PDF").
 */
export const ResourceDownload: Block = {
  slug: 'resourceDownload',
  admin: { group: BLOCK_GROUPS.forms },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_download`,
  interfaceName: 'ResourceDownloadBlock',
  labels: { singular: 'Download', plural: 'Downloads' },
  fields: [
    {
      name: 'resource',
      type: 'upload',
      relationTo: 'resources',
      required: true,
      filterOptions: { usageStatus: { equals: 'public-approved' } },
      admin: {
        description: 'The file to download. Only public-approved resources are listed.',
      },
    },
    {
      name: 'heading',
      type: 'text',
      admin: { description: "Leave empty to use the resource's title." },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: "Leave empty to use the resource's description." },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      admin: {
        description: 'Leave empty for "Download" and the file type, e.g. "Download PDF".',
      },
    },
  ],
}
