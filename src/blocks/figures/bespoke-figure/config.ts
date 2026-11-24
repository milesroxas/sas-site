import type { Block } from 'payload'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import {
  BESPOKE_FIGURE_IDS,
  BESPOKE_FIGURES,
  bespokePropsSchema,
  describeIssues,
  isBespokeFigureId,
  readSpec,
} from '@/features/figures'
import { figureFrameFields } from '../shared'

const catalogue = BESPOKE_FIGURE_IDS.map((id) => `${id} (${BESPOKE_FIGURES[id].label})`).join(', ')

/**
 * Bespoke figure: a one-off interactive figure that lives in code, referenced
 * by id with a small props object (docs/figures.md). The escape hatch for
 * anything a chart or diagram spec should not grow to express.
 *
 * `figure` is validated text, not a select: a select would be a Postgres enum
 * and every new figure a migration. Same choice as a shipped Streak Field look
 * (`fields/visual.ts`).
 *
 * The frame's text alternative is optional here only: left empty, it is filled
 * from the registry on save (`plugins/figures`), so it is always stored and
 * always indexed.
 */
export const BespokeFigure: Block = {
  slug: 'bespokeFigure',
  admin: { group: BLOCK_GROUPS.figures },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_bespoke`,
  interfaceName: 'BespokeFigureBlock',
  labels: { singular: 'Bespoke figure', plural: 'Bespoke figures' },
  fields: [
    {
      name: 'figure',
      type: 'text',
      required: true,
      validate: (value: null | string | undefined) =>
        isBespokeFigureId(value) ? true : `Choose a registered figure: ${catalogue}.`,
      admin: { description: `The figure's id in the code registry. Available: ${catalogue}.` },
    },
    ...figureFrameFields().map((field) =>
      'name' in field && field.name === 'textAlternative' ? { ...field, required: false } : field,
    ),
    {
      name: 'props',
      type: 'json',
      validate: (value, { siblingData }) => {
        const id = (siblingData as { figure?: unknown })?.figure
        if (!isBespokeFigureId(id) || value === null || value === undefined) return true
        const { issues } = readSpec(bespokePropsSchema(id), value)
        return issues ? describeIssues(issues) : true
      },
      admin: {
        description:
          'Optional starting values for the figure. Each figure documents its own; leave empty for its defaults.',
      },
    },
  ],
}
