import { canonicalJSON } from '@/utilities/canonicalJSON'
import type { DiagramSpec } from '../spec/diagram'
import { layoutGraph } from './graph'
import { type StoredLayout, storedLayoutSchema } from './types'

/**
 * Save-time layout for diagrams: compute once when the document is saved,
 * store the geometry beside the spec, render it cheaply forever after. No
 * layout engine ever runs during a page render, on the server or the client,
 * and a diagram cannot shift between deploys.
 *
 * Only `flow` and `state` store a layout. `sequence` and `timeline` are plain
 * arithmetic (`./sequence`, `./timeline`) and are computed where they render.
 */

/** Bump when node metrics, spacing or routing change, so stored geometry is recomputed on the next save. */
export const LAYOUT_VERSION = 1

/**
 * Tripwire, not a sandbox. ELK runs in-process and cannot be interrupted, so
 * what bounds the work is the spec ceilings (`FIGURE_LIMITS`): the largest
 * legal graph, 40 nodes and 80 labelled edges, lays out in about 40ms on a
 * laptop. A layout that still blows this budget means the engine or the
 * ceilings changed for the worse, and the save fails loudly rather than
 * storing a result nobody measured.
 */
export const LAYOUT_BUDGET_MS = 2000

export class LayoutBudgetError extends Error {
  constructor(elapsedMs: number) {
    super(
      `Diagram layout took ${Math.round(elapsedMs)}ms, over the ${LAYOUT_BUDGET_MS}ms budget. Nothing was stored; simplify the diagram or split it in two.`,
    )
    this.name = 'LayoutBudgetError'
  }
}

/**
 * Identity of a parsed spec, independent of key order and whitespace (Postgres
 * `jsonb` reorders keys). Web Crypto, so the same function runs in Node, in
 * the browser and in Storybook.
 */
export async function specHash(spec: DiagramSpec): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalJSON(spec))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const storesLayout = (
  spec: DiagramSpec,
): spec is Extract<DiagramSpec, { kind: 'flow' | 'state' }> =>
  spec.kind === 'flow' || spec.kind === 'state'

/** The stored layout for a spec, or `null` for the kinds that need none. */
export async function layoutDiagram(spec: DiagramSpec): Promise<StoredLayout | null> {
  if (!storesLayout(spec)) return null
  const started = performance.now()
  const wide = await layoutGraph(spec, spec.direction)
  // A left-to-right flow gets a top-down twin: a narrow frame swaps layouts
  // rather than shrinking type below a readable size.
  const narrow = spec.direction === 'LR' ? await layoutGraph(spec, 'TD') : undefined
  const elapsed = performance.now() - started
  if (elapsed > LAYOUT_BUDGET_MS) throw new LayoutBudgetError(elapsed)
  return { hash: await specHash(spec), narrow, version: LAYOUT_VERSION, wide }
}

/**
 * A stored layout that still belongs to this spec and this renderer, or
 * `null`. Null is the renderer's cue to fall back to the list view: it happens
 * in a draft preview between an autosave and the next full save, never on a
 * published page (publishing is a full save).
 */
export async function currentLayout(
  spec: DiagramSpec,
  stored: unknown,
): Promise<StoredLayout | null> {
  const parsed = storedLayoutSchema.safeParse(stored)
  if (!parsed.success || parsed.data.version !== LAYOUT_VERSION) return null
  return parsed.data.hash === (await specHash(spec)) ? parsed.data : null
}
