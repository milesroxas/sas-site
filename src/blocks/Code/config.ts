import type { Block } from 'payload'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * Languages the block highlights. Values are stored (a Postgres enum where the
 * block sits in a composition, a JSON string inside a post body), so relabel
 * freely but never re-value. `glsl` and `bash` are not in the highlighter's
 * bundled set; `prism-languages.ts` registers them.
 */
export const CODE_LANGUAGES = [
  { label: 'TypeScript', value: 'typescript' },
  { label: 'TSX', value: 'tsx' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'GLSL', value: 'glsl' },
  { label: 'Shell', value: 'bash' },
] as const

/**
 * Code: one highlighted listing. Offered twice from this one config: inline in
 * a post body (a Lexical block, stored in the body's JSON) and in the shared
 * Section-nestable run under Text (docs/blocks-reorg-roadmap.md), where long
 * form technical pieces compose it between rich text and figures.
 */
export const Code: Block = {
  slug: 'code',
  admin: { group: BLOCK_GROUPS.text },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_code`,
  interfaceName: 'CodeBlock',
  labels: { singular: 'Code', plural: 'Code' },
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'typescript',
      options: [...CODE_LANGUAGES],
    },
    {
      name: 'code',
      type: 'code',
      label: false,
      required: true,
    },
  ],
}
