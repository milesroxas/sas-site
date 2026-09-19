import type { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk-api'
import type { GraphSpec } from '../spec/diagram'
import { TEXT_METRICS, textWidth, wrapLabel } from './text'
import type { GraphLayout } from './types'

type Direction = GraphSpec['direction']
type NodeShape = NonNullable<GraphSpec['nodes'][number]['shape']>

/** Node label wrap: about four words a line reads as a caption, not a paragraph. */
const NODE_WRAP = { maxChars: 22, maxLines: 3 }
const NODE_MIN_WIDTH = 96
const NODE_PAD_Y = 12
/** Horizontal inset per shape: a pill and a pointed decision lose their corners to the outline. */
const NODE_PAD_X: Record<NodeShape, number> = { decision: 30, step: 16, terminal: 22 }
const EDGE_LABEL_HEIGHT = 18
const EDGE_LABEL_PAD_X = 6
/** Room above a group's children for its label. */
const GROUP_PADDING = '[top=40,left=20,bottom=20,right=20]'

const ELK_DIRECTION: Record<Direction, string> = { LR: 'RIGHT', TD: 'DOWN' }

/**
 * Layered layout with orthogonal routing. Model order is kept, so the order an
 * author lists nodes and edges in is the order they read in, and the same spec
 * always lays out the same way (ELK's seed is fixed by default).
 */
const layoutOptions = (direction: Direction): Record<string, string> => ({
  'elk.algorithm': 'layered',
  'elk.direction': ELK_DIRECTION[direction],
  'elk.edgeLabels.inline': 'true',
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
  'elk.layered.spacing.edgeNodeBetweenLayers': '24',
  'elk.layered.spacing.nodeNodeBetweenLayers': '64',
  'elk.padding': '[top=8,left=8,bottom=8,right=8]',
  'elk.spacing.edgeEdge': '16',
  'elk.spacing.edgeNode': '24',
  'elk.spacing.nodeNode': '28',
})

const round = (value: number | undefined): number => Math.round((value ?? 0) * 10) / 10

const wrapNode = (node: GraphSpec['nodes'][number]): string[] =>
  wrapLabel(node.label, NODE_WRAP.maxChars, NODE_WRAP.maxLines)

const toElkNode = (node: GraphSpec['nodes'][number], lines: string[]): ElkNode => ({
  height: lines.length * TEXT_METRICS.lineHeight + NODE_PAD_Y * 2,
  id: node.id,
  width: Math.max(
    NODE_MIN_WIDTH,
    Math.max(...lines.map((line) => textWidth(line))) + NODE_PAD_X[node.shape ?? 'step'] * 2,
  ),
})

const toElkEdge = (edge: GraphSpec['edges'][number], index: number): ElkExtendedEdge => ({
  id: `e${index}`,
  labels: edge.label
    ? [
        {
          height: EDGE_LABEL_HEIGHT,
          text: edge.label,
          width: textWidth(edge.label, TEXT_METRICS.smallCharWidth) + EDGE_LABEL_PAD_X * 2,
        },
      ]
    : [],
  sources: [edge.from],
  targets: [edge.to],
})

const toElkGraph = (
  spec: GraphSpec,
  direction: Direction,
  lines: ReadonlyMap<string, string[]>,
): ElkNode => {
  const nodes = spec.nodes.map((node) => ({
    elk: toElkNode(node, lines.get(node.id) ?? []),
    group: node.group,
  }))
  const groups = (spec.groups ?? []).map(
    (group): ElkNode => ({
      children: nodes.filter((node) => node.group === group.id).map((node) => node.elk),
      id: `group:${group.id}`,
      layoutOptions: { 'elk.padding': GROUP_PADDING },
    }),
  )
  return {
    // An empty group has nothing to frame; ELK would still reserve a box for it.
    children: [
      ...groups.filter((group) => group.children?.length),
      ...nodes.filter((node) => !node.group).map((node) => node.elk),
    ],
    edges: spec.edges.map(toElkEdge),
    id: 'root',
    layoutOptions: layoutOptions(direction),
  }
}

/**
 * ELK positions a node relative to its parent and an edge relative to its
 * `container` (the lowest common ancestor of its ends). Flatten both to the
 * canvas so the renderer never resolves a hierarchy.
 */
const absoluteOrigins = (root: ElkNode): Map<string, { x: number; y: number }> => {
  const origins = new Map<string, { x: number; y: number }>([[root.id, { x: 0, y: 0 }]])
  const visit = (node: ElkNode, x: number, y: number) => {
    for (const child of node.children ?? []) {
      const origin = { x: x + (child.x ?? 0), y: y + (child.y ?? 0) }
      origins.set(child.id, origin)
      visit(child, origin.x, origin.y)
    }
  }
  visit(root, 0, 0)
  return origins
}

export async function layoutGraph(spec: GraphSpec, direction: Direction): Promise<GraphLayout> {
  // Loaded on first use: the engine is a few megabytes of compiled Java and
  // only a save that carries a changed diagram needs it.
  const { default: ELK } = await import('elkjs/lib/elk.bundled.js')
  const lines = new Map(spec.nodes.map((node) => [node.id, wrapNode(node)]))
  const root = await new ELK().layout(toElkGraph(spec, direction, lines))
  const origins = absoluteOrigins(root)
  const leaves = [root, ...(root.children ?? [])].flatMap((parent) => parent.children ?? [])
  const labels = new Map(spec.groups?.map((group) => [`group:${group.id}`, group]))

  const placed = (node: ElkNode) => {
    const origin = origins.get(node.id) ?? { x: 0, y: 0 }
    return {
      height: round(node.height),
      width: round(node.width),
      x: round(origin.x),
      y: round(origin.y),
    }
  }

  return {
    edges: (root.edges ?? []).map((edge) => {
      const origin = origins.get((edge as { container?: string }).container ?? root.id) ?? {
        x: 0,
        y: 0,
      }
      const at = (point: { x: number; y: number }): [number, number] => [
        round(origin.x + point.x),
        round(origin.y + point.y),
      ]
      const [label] = edge.labels ?? []
      return {
        index: Number(edge.id.slice(1)),
        label:
          label?.text !== undefined
            ? {
                height: round(label.height),
                text: label.text,
                width: round(label.width),
                x: round(origin.x + (label.x ?? 0)),
                y: round(origin.y + (label.y ?? 0)),
              }
            : undefined,
        points: (edge.sections ?? []).flatMap((section) => [
          at(section.startPoint),
          ...(section.bendPoints ?? []).map(at),
          at(section.endPoint),
        ]),
      }
    }),
    groups: (root.children ?? []).flatMap((node) => {
      const group = labels.get(node.id)
      return group ? [{ ...placed(node), id: group.id, label: group.label }] : []
    }),
    height: round(root.height),
    nodes: leaves.flatMap((node) => {
      const wrapped = lines.get(node.id)
      return wrapped ? [{ ...placed(node), id: node.id, lines: wrapped }] : []
    }),
    width: round(root.width),
  }
}
