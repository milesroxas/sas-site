import { layoutSequence, SELF_LOOP } from '../../layout/sequence'
import type { SequenceSpec } from '../../spec/diagram'
import { arrowHead, canvasStyle, stepStyle } from './svg'

const LINE_HEIGHT = 18
/** Gap between a message label's last line and its arrow. */
const LABEL_LIFT = 10

/**
 * A sequence diagram. Its layout is arithmetic, computed right here. A reply
 * draws dashed and a person's header is a pill, so neither direction nor role
 * depends on color. Wider than a phone by nature: the frame scrolls it
 * sideways rather than shrinking the labels (`DiagramFigure`).
 */
export const SequenceSvg = ({
  describedBy,
  label,
  labelledBy,
  spec,
}: {
  describedBy: string
  label: string
  labelledBy?: string
  spec: SequenceSpec
}) => {
  const layout = layoutSequence(spec)
  const headerTop = 8
  const headerBottom = headerTop + layout.header.height

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
      {layout.actors.map((actor, index) => {
        const top =
          headerTop + layout.header.height / 2 - ((actor.lines.length - 1) * LINE_HEIGHT) / 2
        return (
          <g className="figure-step" key={actor.id} style={stepStyle(0)}>
            <line
              className="stroke-border"
              x1={actor.x}
              x2={actor.x}
              y1={headerBottom}
              y2={layout.tailY}
            />
            <rect
              className="fill-background stroke-muted-foreground"
              strokeWidth={1.5}
              height={layout.header.height}
              rx={spec.actors[index]?.role === 'person' ? layout.header.height / 2 : 8}
              width={layout.header.width}
              x={actor.x - layout.header.width / 2}
              y={headerTop}
            />
            <text
              className="fill-foreground text-sm"
              dominantBaseline="central"
              textAnchor="middle"
            >
              {actor.lines.map((line, lineIndex) => (
                <tspan key={lineIndex} x={actor.x} y={top + lineIndex * LINE_HEIGHT}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}

      {layout.messages.map((message) => {
        const source = spec.messages[message.index]
        if (!source) return null
        const self = message.fromX === message.toX
        const points: [number, number][] = self
          ? [
              [message.fromX, message.y],
              [message.fromX + SELF_LOOP.width, message.y],
              [message.fromX + SELF_LOOP.width, message.y + SELF_LOOP.height],
              [message.fromX, message.y + SELF_LOOP.height],
            ]
          : [
              [message.fromX, message.y],
              [message.toX, message.y],
            ]
        const labelX = self
          ? message.fromX + SELF_LOOP.width + 8
          : (message.fromX + message.toX) / 2
        const labelY = self
          ? message.y + SELF_LOOP.height / 2 - ((message.lines.length - 1) * LINE_HEIGHT) / 2
          : message.y - LABEL_LIFT - (message.lines.length - 1) * LINE_HEIGHT
        return (
          <g className="figure-step" key={message.index} style={stepStyle(message.index + 1)}>
            <polyline
              className="fill-none stroke-muted-foreground"
              points={points.map((point) => point.join(',')).join(' ')}
              strokeDasharray={source.style === 'reply' ? '5 5' : undefined}
              strokeWidth={1.5}
            />
            <polygon className="fill-muted-foreground" points={arrowHead(points)} />
            <text
              className="fill-foreground text-xs"
              dominantBaseline={self ? 'central' : 'auto'}
              textAnchor={self ? 'start' : 'middle'}
            >
              {message.lines.map((line, lineIndex) => (
                <tspan key={lineIndex} x={labelX} y={labelY + lineIndex * LINE_HEIGHT}>
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
