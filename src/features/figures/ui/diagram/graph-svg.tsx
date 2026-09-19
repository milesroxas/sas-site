import { cn } from '@/utilities/ui'
import type { GraphLayout } from '../../layout/types'
import type { GraphSpec } from '../../spec/diagram'
import { arrowHead, canvasStyle, HALO, roundedPath, stepStyle } from './svg'

const LINE_HEIGHT = 20
/** Node outlines and edges share one weight, so neither reads as the louder mark. */
const NODE_STROKE = 1.5

type Node = GraphSpec['nodes'][number]
type Placed = GraphLayout['nodes'][number]

/**
 * Shape is a second channel beside the label, so a decision never relies on
 * color to read as one: a step is a rounded box, a terminal a pill, a decision
 * a box with pointed sides (a diamond's meaning without a diamond's wasted
 * corners, which would double the node's footprint).
 */
const NodeShape = ({
  className,
  node,
  shape,
}: {
  className: string
  node: Placed
  shape: Node['shape']
}) => {
  const { height, width, x, y } = node
  if (shape === 'decision') {
    const inset = 14
    const mid = y + height / 2
    return (
      <polygon
        className={className}
        strokeWidth={NODE_STROKE}
        points={`${x + inset},${y} ${x + width - inset},${y} ${x + width},${mid} ${x + width - inset},${y + height} ${x + inset},${y + height} ${x},${mid}`}
      />
    )
  }
  return (
    <rect
      className={className}
      height={height}
      rx={shape === 'terminal' ? height / 2 : 8}
      strokeWidth={NODE_STROKE}
      width={width}
      x={x}
      y={y}
    />
  )
}

/**
 * A flow or state graph drawn from its stored layout. Server SVG, no script:
 * the entrance and the marching dashes are CSS keyed off the block's reveal
 * (globals.css). Every coordinate comes from `layout`; nothing here measures,
 * wraps or routes.
 */
export const GraphSvg = ({
  describedBy,
  label,
  labelledBy,
  layout,
  spec,
}: {
  describedBy: string
  label: string
  labelledBy?: string
  layout: GraphLayout
  spec: GraphSpec
}) => {
  const order = new Map(spec.nodes.map((node, index) => [node.id, index]))
  const nodes = new Map(spec.nodes.map((node) => [node.id, node]))

  return (
    <svg
      aria-describedby={describedBy}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      className="figure-diagram mx-auto block font-sans"
      role="img"
      style={canvasStyle(layout.width)}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
    >
      {layout.groups.map((group) => (
        <g className="figure-step" key={group.id}>
          <rect
            className="fill-muted/40 stroke-border"
            height={group.height}
            rx={12}
            width={group.width}
            x={group.x}
            y={group.y}
          />
        </g>
      ))}

      {layout.edges.map((edge) => {
        const source = spec.edges[edge.index]
        if (!source) return null
        // An edge follows the node it leaves, so the figure reads in the direction it runs.
        const step = (order.get(source.from) ?? 0) + 1
        const dashed = source.style === 'dashed'
        return (
          <g key={edge.index}>
            <path
              className="figure-step figure-edge fill-none stroke-muted-foreground"
              d={roundedPath(edge.points)}
              strokeDasharray={dashed && !source.animated ? '5 5' : undefined}
              strokeWidth={NODE_STROKE}
              style={stepStyle(step)}
              {...(source.animated
                ? { 'data-march': '' }
                : dashed
                  ? {}
                  : { 'data-draw': '', pathLength: 1 })}
            />
            <g className="figure-step figure-mark" style={stepStyle(step)}>
              <polygon className="fill-muted-foreground" points={arrowHead(edge.points)} />
              {edge.label ? (
                <>
                  <rect
                    className="fill-background"
                    height={edge.label.height}
                    rx={4}
                    width={edge.label.width}
                    x={edge.label.x}
                    y={edge.label.y}
                  />
                  <text
                    className="fill-muted-foreground text-xs"
                    dominantBaseline="central"
                    textAnchor="middle"
                    x={edge.label.x + edge.label.width / 2}
                    y={edge.label.y + edge.label.height / 2}
                  >
                    {edge.label.text}
                  </text>
                </>
              ) : null}
            </g>
          </g>
        )
      })}

      {/* After the edges: an edge entering a group passes under its label, and the halo breaks it cleanly. */}
      {layout.groups.map((group) => (
        <text
          {...HALO}
          className={cn('figure-step fill-muted-foreground text-xs', HALO.className)}
          key={group.id}
          x={group.x + 16}
          y={group.y + 24}
        >
          {group.label}
        </text>
      ))}

      {layout.nodes.map((placed) => {
        const node = nodes.get(placed.id)
        if (!node) return null
        const top = placed.y + placed.height / 2 - ((placed.lines.length - 1) * LINE_HEIGHT) / 2
        return (
          <g className="figure-step" key={placed.id} style={stepStyle(order.get(placed.id) ?? 0)}>
            <NodeShape
              className={
                node.emphasis
                  ? 'fill-foreground stroke-foreground'
                  : 'fill-background stroke-muted-foreground'
              }
              node={placed}
              shape={node.shape}
            />
            <text
              className={cn('text-sm', node.emphasis ? 'fill-background' : 'fill-foreground')}
              dominantBaseline="central"
              textAnchor="middle"
            >
              {placed.lines.map((line, index) => (
                <tspan key={index} x={placed.x + placed.width / 2} y={top + index * LINE_HEIGHT}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
