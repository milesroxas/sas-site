import { z } from 'zod'

/**
 * What a saved graph diagram stores beside its spec: finished geometry in CSS
 * px, top-left origin. Self-contained on purpose: boxes carry the wrapped lines
 * they were sized for and edges carry their routed points, so the renderer
 * draws a stored layout without measuring, routing or re-wrapping anything.
 *
 * Read back through this schema, never cast: the column is plain JSON and a
 * layout written by an older `LAYOUT_VERSION` must fail closed to the list
 * view rather than draw half a diagram.
 */

const box = z.object({ height: z.number(), width: z.number(), x: z.number(), y: z.number() })

const graphLayout = z.object({
  edges: z.array(
    z.object({
      /** Index into `spec.edges`: style and direction stay with the spec. */
      index: z.number().int().nonnegative(),
      label: box.extend({ text: z.string() }).optional(),
      points: z.array(z.tuple([z.number(), z.number()])).min(2),
    }),
  ),
  groups: z.array(box.extend({ id: z.string(), label: z.string() })),
  height: z.number().positive(),
  nodes: z.array(box.extend({ id: z.string(), lines: z.array(z.string()).min(1) })),
  width: z.number().positive(),
})

export const storedLayoutSchema = z.object({
  /** Hash of the spec this geometry was computed from (`specHash`). */
  hash: z.string(),
  /** Top-down twin of a left-to-right graph, for frames too narrow to read it. */
  narrow: graphLayout.optional(),
  version: z.number().int(),
  wide: graphLayout,
})

export type Box = z.infer<typeof box>
export type GraphLayout = z.infer<typeof graphLayout>
export type StoredLayout = z.infer<typeof storedLayoutSchema>
