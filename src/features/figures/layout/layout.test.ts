import { describe, expect, it } from 'vitest'
import { DIAGRAM_CORPUS } from '../corpus'
import type { DiagramSpec, GraphSpec } from '../spec/diagram'
import { FIGURE_LIMITS } from '../spec/limits'
import { currentLayout, LAYOUT_BUDGET_MS, LAYOUT_VERSION, layoutDiagram, specHash } from './index'
import { layoutSequence } from './sequence'
import { TEXT_METRICS, textWidth, wrapLabel } from './text'
import { layoutTimeline } from './timeline'
import type { Box } from './types'

const overlaps = (a: Box, b: Box): boolean =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

const pairs = <T>(items: T[]): [T, T][] =>
  items.flatMap((a, index) => items.slice(index + 1).map((b): [T, T] => [a, b]))

const graphs = Object.entries(DIAGRAM_CORPUS).filter(
  ([, figure]) => figure.spec.kind === 'flow' || figure.spec.kind === 'state',
)

/** The largest graph the spec allows: every node and edge slot used, every edge labelled. */
const largest: GraphSpec = {
  specVersion: 1,
  kind: 'flow',
  direction: 'LR',
  nodes: Array.from({ length: FIGURE_LIMITS.diagram.nodes }, (_, index) => ({
    id: `n${index}`,
    label: `Node number ${index} with a label`,
  })),
  edges: Array.from({ length: FIGURE_LIMITS.diagram.edges }, (_, index) => ({
    from: `n${index % FIGURE_LIMITS.diagram.nodes}`,
    to: `n${(index * 7 + 3) % FIGURE_LIMITS.diagram.nodes}`,
    label: 'carries data',
  })).filter((edge) => edge.from !== edge.to),
}

describe('layoutDiagram', () => {
  it.each(graphs)('lays out %s with no two nodes or labels overlapping', async (_, figure) => {
    const layout = await layoutDiagram(figure.spec)
    for (const graph of [layout?.wide, layout?.narrow]) {
      if (!graph) continue
      const labels = graph.edges.flatMap((edge) => (edge.label ? [edge.label] : []))
      for (const [a, b] of pairs<Box>([...graph.nodes, ...labels]))
        expect(overlaps(a, b)).toBe(false)
      expect(graph.nodes).toHaveLength((figure.spec as GraphSpec).nodes.length)
    }
  })

  it('gives a left-to-right graph a top-down twin and a top-down graph none', async () => {
    const lr = await layoutDiagram(DIAGRAM_CORPUS.visualResolves?.spec as DiagramSpec)
    const td = await layoutDiagram(DIAGRAM_CORPUS.admission?.spec as DiagramSpec)
    expect(lr?.narrow).toBeDefined()
    expect(lr?.narrow?.width).toBeLessThan(lr?.wide.width ?? 0)
    expect(td?.narrow).toBeUndefined()
  })

  it('lays the same spec out the same way twice', async () => {
    const spec = DIAGRAM_CORPUS.renderPipeline?.spec as DiagramSpec
    expect(await layoutDiagram(spec)).toEqual(await layoutDiagram(spec))
  })

  it('keeps the largest legal graph far inside the budget', async () => {
    await layoutDiagram(largest) // first call pays for loading the engine
    const started = performance.now()
    await layoutDiagram(largest)
    expect(performance.now() - started).toBeLessThan(LAYOUT_BUDGET_MS / 4)
  })

  it('stores nothing for the arithmetic kinds', async () => {
    expect(await layoutDiagram(DIAGRAM_CORPUS.publishSequence?.spec as DiagramSpec)).toBeNull()
    expect(await layoutDiagram(DIAGRAM_CORPUS.studioTimeline?.spec as DiagramSpec)).toBeNull()
  })
})

describe('currentLayout', () => {
  const spec = DIAGRAM_CORPUS.admission?.spec as GraphSpec

  it('hashes a spec the same however Postgres reorders its keys', async () => {
    const reordered = Object.fromEntries(Object.entries(spec).reverse()) as DiagramSpec
    expect(await specHash(reordered)).toBe(await specHash(spec))
  })
  it('accepts the layout computed from this spec and drops one from another', async () => {
    const stored = await layoutDiagram(spec)
    expect(await currentLayout(spec, stored)).toEqual(stored)
    const edited = {
      ...spec,
      nodes: spec.nodes.map((node) => ({ ...node, label: `${node.label}!` })),
    }
    expect(await currentLayout(edited, stored)).toBeNull()
  })
  it('drops a layout from another layout version, and anything that is not a layout', async () => {
    const stored = await layoutDiagram(spec)
    expect(await currentLayout(spec, { ...stored, version: LAYOUT_VERSION + 1 })).toBeNull()
    expect(
      await currentLayout(spec, { hash: 'x', version: LAYOUT_VERSION, wide: 'nope' }),
    ).toBeNull()
    expect(await currentLayout(spec, null)).toBeNull()
  })
})

describe('arithmetic layouts', () => {
  it('spaces sequence columns so the longest label fits the span it sits over', () => {
    const spec = DIAGRAM_CORPUS.authoringPath?.spec as Extract<DiagramSpec, { kind: 'sequence' }>
    const layout = layoutSequence(spec).wide
    const [first, second] = layout.actors
    expect((second?.x ?? 0) - (first?.x ?? 0)).toBeGreaterThanOrEqual(148)
    expect(layout.messages).toHaveLength(spec.messages.length)
  })
  it('holds a narrow sequence to a phone column with every label inside the canvas', () => {
    const spec = DIAGRAM_CORPUS.publishSequence?.spec as Extract<DiagramSpec, { kind: 'sequence' }>
    const longest = {
      ...spec,
      messages: spec.messages.map((message) => ({
        ...message,
        label: 'word '.repeat(FIGURE_LIMITS.label / 5).trim(),
      })),
    }
    for (const candidate of [spec, longest]) {
      const layout = layoutSequence(candidate).narrow
      // Four actors at 80%, the furthest a drawing shrinks, fit a 320px phone's 288px column.
      expect(layout.width * 0.8).toBeLessThanOrEqual(288)
      for (const { label } of layout.messages) {
        const half =
          Math.max(...label.lines.map((line) => textWidth(line, TEXT_METRICS.smallCharWidth))) / 2
        expect(label.x - half).toBeGreaterThanOrEqual(0)
        expect(label.x + half).toBeLessThanOrEqual(layout.width)
      }
    }
  })
  it('stacks timeline labels into lanes so none overlap', () => {
    const spec = DIAGRAM_CORPUS.studioTimeline?.spec as Extract<DiagramSpec, { kind: 'timeline' }>
    const crowded = {
      ...spec,
      events: Array.from({ length: FIGURE_LIMITS.diagram.events }, (_, index) => ({
        at: `2026-08-${String(10 + (index % 5)).padStart(2, '0')}`,
        label: `A crowded week, event ${index}`,
      })),
    }
    const { events } = layoutTimeline(crowded).wide
    const boxes = events.map((event) => ({
      height: 50,
      width: 150,
      x: event.labelX - 75,
      y: event.labelY,
    }))
    for (const [a, b] of pairs(boxes)) expect(overlaps(a, b)).toBe(false)
  })
})

describe('wrapLabel', () => {
  it('wraps on words, splits a word longer than a line, and cuts past the last line', () => {
    expect(wrapLabel('Advance time and pointer', 12, 3)).toEqual(['Advance time', 'and pointer'])
    expect(wrapLabel('supercalifragilistic', 8, 3)).toEqual(['supercal', 'ifragili', 'stic'])
    expect(wrapLabel('one two three four five six', 8, 2)).toEqual(['one two', 'three…'])
  })
})
