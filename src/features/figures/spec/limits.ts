/**
 * Every ceiling a figure spec is held to, stated once. The schemas read these,
 * the JSON Schema handed to the admin editor and the MCP tools is generated
 * from the schemas, and the authoring skill quotes that: no limit is restated
 * by hand anywhere.
 *
 * The ceilings are the denial-of-service bound. Layout and render cost grow
 * with nodes, edges and rows, so a spec that cannot exceed these cannot make a
 * save or a page expensive (see `layout/index.ts` for the measured worst case).
 */
export const FIGURE_LIMITS = {
  /** A mark, node, actor, axis or series label. */
  label: 80,
  /** A node, group, actor or data-column id. */
  id: 40,
  chart: { annotations: 6, rows: 500, series: 4 },
  diagram: { actors: 8, edges: 80, eras: 6, events: 20, groups: 8, messages: 30, nodes: 40 },
} as const

/** The one spec version that exists. Bump with a content migration, never in place. */
export const SPEC_VERSION = 1
