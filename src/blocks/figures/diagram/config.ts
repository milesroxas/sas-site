import type { Block } from 'payload'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { type DiagramSpec, diagramSpecJsonSchema, diagramSpecSchema } from '@/features/figures'
import { figureFrameFields } from '../shared'
import { specField } from '../spec-field'

/** What a new block opens with: the smallest spec that draws, so the shape is visible at once. */
const STARTER_SPEC: DiagramSpec = {
  specVersion: 1,
  kind: 'flow',
  direction: 'LR',
  nodes: [
    { id: 'start', label: 'Start', shape: 'terminal' },
    { id: 'finish', label: 'Finish', shape: 'terminal' },
  ],
  edges: [{ from: 'start', to: 'finish' }],
}

/**
 * Diagram: a flow, state, sequence or timeline spec with no coordinates
 * (docs/figures.md). Positions for flow and state are computed when the
 * document is saved and stored in `geometry`; the page draws that as server
 * SVG and never runs a layout engine. (Not named `layout`: that is the page's
 * own composition field, and the content walk keys on field names.)
 *
 * `geometry` is written by `plugins/figures` on every save and is never taken
 * from the request, so it cannot be hand-placed or forged.
 */
export const Diagram: Block = {
  slug: 'diagram',
  admin: { group: BLOCK_GROUPS.figures },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_diagram`,
  interfaceName: 'DiagramBlock',
  labels: { singular: 'Diagram', plural: 'Diagrams' },
  fields: [
    ...figureFrameFields(),
    specField({
      defaultValue: STARTER_SPEC,
      description:
        'A flow, state, sequence or timeline. Say what connects to what; positions are computed when you save. The editor flags anything the spec does not allow as you type.',
      jsonSchema: diagramSpecJsonSchema,
      schema: diagramSpecSchema,
    }),
    {
      name: 'geometry',
      type: 'json',
      admin: { hidden: true },
    },
  ],
}
