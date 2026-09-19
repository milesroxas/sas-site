/**
 * Figures: charts, diagrams and bespoke figures authored as validated specs
 * (docs/figures.md). This barrel is the server-safe surface: schemas, the spec
 * reader, save-time layout and the registry's data. Nothing here imports
 * React, so the Payload config and scripts can use it. Renderers import from
 * `./ui` directly.
 */
export { currentLayout, LayoutBudgetError, layoutDiagram } from './layout'
export type { GraphLayout } from './layout/types'
export {
  BESPOKE_FIGURE_IDS,
  BESPOKE_FIGURES,
  bespokePropsSchema,
  isBespokeFigureId,
} from './registry/definitions'
export { type ChartSpec, chartSpecSchema } from './spec/chart'
export { type DiagramSpec, diagramSpecSchema } from './spec/diagram'
export { chartSpecJsonSchema, diagramSpecJsonSchema } from './spec/json-schema'
export { describeIssues, readSpec } from './spec/read'
