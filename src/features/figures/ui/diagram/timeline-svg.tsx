import { cn } from '@/utilities/ui'
import { formatDate, layoutTimeline, type TimelineLayout } from '../../layout/timeline'
import type { TimelineSpec } from '../../spec/diagram'
import { canvasStyle, HALO, stepStyle } from './svg'

const LINE_HEIGHT = 18
type WideEvent = TimelineLayout['wide']['events'][number]

/** Height of an event's label block: its lines, plus its tag when it has one. */
const blockHeight = (event: WideEvent, spec: TimelineSpec): number =>
  (event.lines.length + (spec.events[event.index]?.ref ? 1 : 0)) * LINE_HEIGHT + 4

type SvgProps = { describedBy: string; label: string; labelledBy?: string; spec: TimelineSpec }

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
          <text
            {...HALO}
            className={cn('fill-foreground text-sm', HALO.className)}
            textAnchor="middle"
          >
            {event.lines.map((line, index) => (
              <tspan key={index} x={event.labelX} y={event.labelY + 14 + index * LINE_HEIGHT}>
                {line}
              </tspan>
            ))}
          </text>
          {source.ref ? (
            <text
              {...HALO}
              className={cn('fill-muted-foreground text-xs', HALO.className)}
              textAnchor="middle"
              x={event.labelX}
              y={event.labelY + 14 + event.lines.length * LINE_HEIGHT}
            >
              {source.ref}
            </text>
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
            <text className="fill-foreground text-sm">
              {row.lines.map((line, index) => (
                <tspan key={index} x={rail + 18} y={row.y + 32 + index * LINE_HEIGHT}>
                  {line}
                </tspan>
              ))}
            </text>
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
  describedBy,
  label,
  labelledBy,
  spec,
  variant,
}: SvgProps & { variant: 'narrow' | 'wide' }) => {
  const layout = layoutTimeline(spec)[variant]
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
      {variant === 'wide' ? (
        <Wide layout={layout as TimelineLayout['wide']} spec={spec} />
      ) : (
        <Narrow layout={layout as TimelineLayout['narrow']} spec={spec} />
      )}
    </svg>
  )
}
