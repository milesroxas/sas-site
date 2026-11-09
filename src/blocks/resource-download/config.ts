import type { Block, Field } from 'payload'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * What a download is made of, stated once for the Download block and a post's
 * Primary resource group (`primaryResourceField`), so the two can never drift.
 *
 * Copy falls back to the resource itself, so the common case is one pick: the
 * heading to the resource's title, the description to its description, and
 * the button to "Download" plus the file type ("Download PDF").
 *
 * `required` is the block's: a Download block with no file is a mistake, a
 * post with no primary resource is the default.
 */
const resourceDownloadFields = ({ required }: { required: boolean }): Field[] => [
  {
    name: 'resource',
    type: 'upload',
    relationTo: 'resources',
    required,
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
]

/**
 * Download: a call to action that hands the reader one file from Resources
 * (any file type). Offered twice from this one config, the way Code is: inline
 * in a post body (a Lexical block, stored in the body's JSON; as many as the
 * article wants) and in the Lab Page composition, at the top level and nested
 * in a Section.
 */
export const ResourceDownload: Block = {
  slug: 'resourceDownload',
  admin: { group: BLOCK_GROUPS.forms },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_download`,
  interfaceName: 'ResourceDownloadBlock',
  labels: { singular: 'Download', plural: 'Downloads' },
  fields: resourceDownloadFields({ required: true }),
}

/**
 * A post's one primary file, apart from any Download blocks in the article.
 * Pinned in the side rail beside the article from `lg`; below it, where there
 * is no rail, it closes the article as a card (`posts/[slug]/page.tsx`).
 */
export const primaryResourceField: Field = {
  name: 'primaryResource',
  type: 'group',
  label: 'Primary resource',
  interfaceName: 'PrimaryResource',
  admin: {
    description:
      'The one file this insight offers. Pinned in the side rail on wide screens; at the end of the article on phones and tablets. For more files, add Download blocks in the article.',
  },
  fields: resourceDownloadFields({ required: false }),
}
