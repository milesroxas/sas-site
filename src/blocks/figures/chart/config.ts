import type { Block } from 'payload'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { type ChartSpec, chartSpecJsonSchema, chartSpecSchema } from '@/features/figures'
import { figureFrameFields } from '../shared'
import { specField } from '../spec-field'

/** What a new block opens with: the smallest spec that draws, so the shape is visible at once. */
const STARTER_SPEC: ChartSpec = {
  specVersion: 1,
  kind: 'bar',
  x: { key: 'label', type: 'category' },
  y: {},
  series: [{ key: 'value', label: 'Value' }],
  rows: [
    { label: 'A', value: 12 },
    { label: 'B', value: 19 },
  ],
}

/**
 * Chart: data and encoding as a JSON spec, drawn by one code-owned renderer
 * (docs/figures.md). The numbers live in the CMS, so a person corrects a value
 * in the admin without re-exporting an image; palette, marks and motion are
 * decided once in code and are not authorable.
 *
 * Sits in the shared Section-nestable run under Figures. It carries no story
 * `source`, so the Lab run passes it through unchanged and Work Pages offer it
 * plain.
 */
export const Chart: Block = {
  slug: 'chart',
  admin: { group: BLOCK_GROUPS.figures },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_chart`,
  interfaceName: 'ChartBlock',
  labels: { singular: 'Chart', plural: 'Charts' },
  fields: [
    ...figureFrameFields(),
    specField({
      defaultValue: STARTER_SPEC,
      description:
        'Bar, line, area, scatter or diverging bar. Up to 4 series and 500 rows; one y axis. The editor flags anything the spec does not allow as you type.',
      jsonSchema: chartSpecJsonSchema,
      schema: chartSpecSchema,
    }),
  ],
}
