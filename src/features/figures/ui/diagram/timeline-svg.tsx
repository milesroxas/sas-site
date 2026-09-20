import { formatDate, layoutTimeline, type TimelineLayout } from '../../layout/timeline'
import type { TimelineSpec } from '../../spec/diagram'
import { TextLines } from '../text-lines'
import { type DiagramNaming, DiagramSvg } from './diagram-svg'
import { stepStyle } from './svg'

const LINE_HEIGHT = 18
type WideEvent = TimelineLayout['wide']['events'][number]

/** Height of an event's label block: its lines, plus its tag when it has one. */
const blockHeight = (event: WideEvent, spec: TimelineSpec): number =>
  (event.lines.length + (spec.events[event.index]?.ref ? 1 : 0)) * LINE_HEIGHT + 4

/** Proportional axis: events sit where their dates fall, labels stacked into lanes so none overlap. */
const Wide = ({ layout, spec }: { layout: TimelineLayout['wide']; spec: TimelineSpec }) => (
  <>
    {layout.eras.map((era) => (
      <g className="figure-step" key={era.index} style={stepStyle(0)}>
        <rect className="fill-muted/50" height={layout.height} width={era.width} x={era.x} y={0} />
        {era.label ? (
          <text className="fill-muted-foreground text-xs" x={era.x + 8} y={18}>
            {era.label}
          </text>
        ) : null}
      </g>
    ))}
    <line
      className="stroke-muted-foreground"
      strokeWidth={1.5}
      x1={0}
      x2={layout.width}
      y1={layout.axisY}
      y2={layout.axisY}
    />
    <text className="fill-muted-foreground text-xs" x={0} y={layout.height - 8}>
      {formatDate(spec.range.start)}
    </text>
    <text
      className="fill-muted-foreground text-xs"
      textAnchor="end"
      x={layout.width}
      y={layout.height - 8}
    >
      {formatDate(spec.range.end)}
    </text>
    {/* Leaders first, so a label further out paints over a leader it crosses and its halo breaks the line. */}
    {layout.events.map((event) => (
      <line
        className="figure-step stroke-border"
        key={event.index}
        x1={event.x}
        x2={event.x}
        y1={layout.axisY}
        y2={event.side === 'above' ? event.labelY + blockHeight(event, spec) : event.labelY}
      />
    ))}
    {layout.events.map((event, order) => {
      const source = spec.events[event.index]
      if (!source) return null
      return (
        <g className="figure-step" key={event.index} style={stepStyle(order + 1)}>
          <circle
            className="fill-foreground stroke-background"
            cx={event.x}
            cy={layout.axisY}
            r={5}
            strokeWidth={2}
          />
          <TextLines
            className="fill-foreground text-sm"
            halo
            lineHeight={LINE_HEIGHT}
            lines={event.lines}
            x={event.labelX}
            y={event.labelY + (event.lines.length * LINE_HEIGHT) / 2}
          />
          {source.ref ? (
            <TextLines
              className="fill-muted-foreground text-xs"
              halo
              lines={[source.ref]}
              x={event.labelX}
              y={event.labelY + (event.lines.length + 0.5) * LINE_HEIGHT}
            />
          ) : null}
        </g>
      )
    })}
  </>
)

/** Stepped run for narrow frames: even rows down one rail, each dated, eras announced as they open. */
const Narrow = ({ layout, spec }: { layout: TimelineLayout['narrow']; spec: TimelineSpec }) => {
  const rail = 6
  return (
    <>
      <line
        className="stroke-muted-foreground"
        strokeWidth={1.5}
        x1={rail}
        x2={rail}
        y1={0}
        y2={layout.height}
      />
      {layout.rows.map((row, order) => {
        if (row.kind === 'era')
          return (
            <text
              className="figure-step fill-muted-foreground text-xs uppercase tracking-wide"
              key={`era-${row.index}`}
              style={stepStyle(order)}
              x={rail + 18}
              y={row.y + 20}
            >
              {row.lines[0]}
            </text>
          )
        const source = spec.events[row.index]
        if (!source) return null
        return (
          <g className="figure-step" key={`event-${row.index}`} style={stepStyle(order)}>
            <circle
              className="fill-foreground stroke-background"
              cx={rail}
              cy={row.y + 8}
              r={5}
              strokeWidth={2}
            />
            <text className="fill-muted-foreground text-xs" x={rail + 18} y={row.y + 12}>
              {formatDate(source.at)}
              {source.ref ? ` · ${source.ref}` : ''}
            </text>
            <TextLines
              anchor="start"
              className="fill-foreground text-sm"
              lineHeight={LINE_HEIGHT}
              lines={row.lines}
              x={rail + 18}
              y={row.y + 18 + (row.lines.length * LINE_HEIGHT) / 2}
            />
          </g>
        )
      })}
    </>
  )
}

/**
 * A timeline in both forms; `DiagramFigure` shows the one that fits its frame.
 * Layout is arithmetic (`layout/timeline`), computed here.
 */
export const TimelineSvg = ({
  spec,
  variant,
  ...naming
}: DiagramNaming & { spec: TimelineSpec; variant: keyof TimelineLayout }) => {
  const layout = layoutTimeline(spec)
  // The stepped run reads down its left edge, so it keeps the text's margin rather than centring.
  return variant === 'wide' ? (
    <DiagramSvg {...naming} height={layout.wide.height} width={layout.wide.width}>
      <Wide layout={layout.wide} spec={spec} />
    </DiagramSvg>
  ) : (
    <DiagramSvg {...naming} align="start" height={layout.narrow.height} width={layout.narrow.width}>
      <Narrow layout={layout.narrow} spec={spec} />
    </DiagramSvg>
  )
}
