'use client'

import type { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartKind, ChartSpec } from '../../spec/chart'
import { type ChartModel, chartModel, directLabels, formatValue, formatX } from './model'

/**
 * The one chart renderer. Every mark rule is decided here, once, and none is
 * authorable (dataviz mark specs): 2px lines, bars capped at 24px with a 4px
 * rounded data end and a square baseline, a 10% area wash, 8px dots with a
 * surface ring, a hairline solid grid, text in text tokens. One y axis, always.
 *
 * Marks do not animate in: this chunk mounts before the chart scrolls into
 * view, so a grow-in would play unseen, and the frame fades the canvas over
 * its placeholder instead. The tooltip tracks the pointer with no easing; a
 * readout that trails the cursor reads as lag.
 */

const BAR_SIZE = 24
const BAR_RADIUS = 4
const SURFACE = 'var(--background)'
const INK = 'var(--foreground)'
const MUTED = 'var(--muted-foreground)'
const TICK = { fill: MUTED, fontSize: 12 }

/** What every mark component draws from. */
type Drawing = { labels: ReturnType<typeof directLabels>; model: ChartModel; spec: ChartSpec }

const isBarKind = (kind: ChartKind) => kind === 'bar' || kind === 'diverging-bar'

/** A rectangle path with a radius per corner: top-left, top-right, bottom-right, bottom-left. */
const roundedRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  [tl, tr, br, bl]: readonly [number, number, number, number],
) =>
  `M${x + tl},${y}H${x + w - tr}Q${x + w},${y} ${x + w},${y + tr}V${y + h - br}Q${x + w},${y + h} ${x + w - br},${y + h}H${x + bl}Q${x},${y + h} ${x},${y + h - bl}V${y + tl}Q${x},${y} ${x + tl},${y}Z`

type BarShapeProps = {
  fill?: string
  height?: number
  value?: unknown
  width?: number
  x?: number
  y?: number
}

/**
 * A bar with its data end rounded and its baseline square, whichever way it
 * points. Recharts' own `radius` rounds a fixed pair of corners, which puts
 * the curve on the baseline of every negative bar in a diverging chart.
 */
const barShape =
  (horizontal: boolean) =>
  ({ fill, height = 0, value, width = 0, x = 0, y = 0 }: BarShapeProps) => {
    const w = Math.abs(width)
    const h = Math.abs(height)
    const r = Math.min(BAR_RADIUS, w / 2, h / 2)
    const negative = typeof value === 'number' && value < 0
    // The data end: right or top when positive, left or bottom when negative.
    const corners = horizontal
      ? negative
        ? ([r, 0, 0, r] as const)
        : ([0, r, r, 0] as const)
      : negative
        ? ([0, 0, r, r] as const)
        : ([r, r, 0, 0] as const)
    return (
      <path
        d={roundedRect(Math.min(x, x + width), Math.min(y, y + height), w, h, corners)}
        fill={fill}
      />
    )
  }

/** An annotation's x on the scale the chart draws: a timestamp, a dated band, or the value itself. */
const annotationX = ({ model, spec }: Drawing, x: number | string): number | string => {
  if (spec.x.type !== 'time') return x
  return model.continuousX ? Date.parse(`${x}T00:00:00Z`) : formatX(spec, x)
}

const Annotations = (drawing: Drawing) =>
  drawing.spec.annotations?.map((annotation, index) => {
    const label = { fill: INK, fontSize: 12, value: annotation.label }
    // Recharts names axes by screen position, so a horizontal chart swaps them.
    const [position, measure] = drawing.model.horizontal
      ? (['y', 'x'] as const)
      : (['x', 'y'] as const)
    const at = annotation.x === undefined ? {} : { [position]: annotationX(drawing, annotation.x) }
    if (annotation.x !== undefined && annotation.y !== undefined)
      return (
        <ReferenceDot
          fill={INK}
          key={index}
          label={{ ...label, position: 'top' }}
          r={4}
          stroke={SURFACE}
          strokeWidth={2}
          {...at}
          {...{ [measure]: annotation.y }}
        />
      )
    return (
      <ReferenceLine
        key={index}
        label={{ ...label, position: 'insideTopRight' }}
        stroke={MUTED}
        strokeDasharray="3 3"
        {...at}
        {...(annotation.x === undefined ? { [measure]: annotation.y } : {})}
      />
    )
  })

const formatter = (spec: ChartSpec) => (input: unknown) =>
  typeof input === 'number' ? formatValue(spec, input) : ''

/** Bars and areas encode magnitude as length from zero, so their measure axis always includes it. */
const measuresFromZero = (kind: ChartKind) => isBarKind(kind) || kind === 'area'

/** The axis the x values sit on: bands for categories, a continuous scale for a measure or time. */
const positionAxis = ({ model, spec }: Drawing) => ({
  axisLine: false,
  dataKey: 'x',
  tick: TICK,
  tickFormatter: (input: number | string) =>
    model.continuousX ? formatX(spec, input) : String(input),
  tickLine: false,
  tickMargin: 8,
  ...(model.continuousX
    ? {
        domain: ['dataMin', 'dataMax'],
        scale: spec.x.type === 'time' ? ('time' as const) : ('linear' as const),
        type: 'number' as const,
      }
    : { type: 'category' as const }),
})

/** The one measure axis. It fits the data unless the author fixed the domain. */
const measureAxis = ({ spec }: Drawing) => ({
  axisLine: false,
  domain: spec.y.domain ?? [
    measuresFromZero(spec.kind) ? (min: number) => Math.min(0, min) : 'auto',
    'auto',
  ],
  tick: TICK,
  tickFormatter: formatter(spec),
  tickLine: false,
  type: 'number' as const,
})

/** Recharts names axes by screen position, so a horizontal chart hands each the other's props. */
const Axes = (drawing: Drawing) =>
  drawing.model.horizontal ? (
    <>
      <XAxis {...measureAxis(drawing)} />
      <YAxis {...positionAxis(drawing)} width="auto" />
    </>
  ) : (
    <>
      <XAxis {...positionAxis(drawing)} minTickGap={24} />
      <YAxis {...measureAxis(drawing)} width="auto" />
    </>
  )

/** Grid, both axes, the tooltip and the annotations: everything around the marks. */
const Scaffold = (drawing: Drawing) => {
  const { model, spec } = drawing
  const bars = isBarKind(spec.kind)

  return (
    <>
      <CartesianGrid
        horizontal={!model.horizontal}
        stroke="var(--border)"
        vertical={model.horizontal}
      />
      <Axes {...drawing} />
      <ChartTooltip
        content={
          <ChartTooltipContent
            indicator={measuresFromZero(spec.kind) ? 'dot' : 'line'}
            labelFormatter={(_, payload) => formatX(spec, payload?.[0]?.payload?.x ?? '')}
            valueFormatter={formatter(spec)}
          />
        }
        cursor={bars ? { fill: 'var(--muted)', opacity: 0.5 } : { stroke: 'var(--border)' }}
        isAnimationActive={false}
      />
      {spec.kind === 'diverging-bar' ? (
        <ReferenceLine stroke={MUTED} {...(model.horizontal ? { x: 0 } : { y: 0 })} />
      ) : null}
      <Annotations {...drawing} />
    </>
  )
}

/** The value at a line's last point, when `directLabels` says the ends are readable. */
const EndLabel = ({ labels, model, spec }: Drawing) =>
  labels === 'line-ends' ? (
    <LabelList
      content={({ index, value, x, y }) =>
        index === model.data.length - 1 && typeof value === 'number' ? (
          <text dx={8} dy={4} fill={INK} fontSize={12} x={Number(x)} y={Number(y)}>
            {formatValue(spec, value)}
          </text>
        ) : null
      }
    />
  ) : null

/** Stroke shared by lines and area outlines; a reference series draws dashed as well as neutral. */
const stroke = (slot: ChartModel['slots'][number]) => ({
  activeDot: { r: 4, stroke: SURFACE, strokeWidth: 2 },
  dataKey: slot.key,
  isAnimationActive: false,
  stroke: slot.color,
  strokeDasharray: slot.reference ? '4 4' : undefined,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 2,
  type: 'linear' as const,
})

type Frame = { data: ChartModel['data']; margin: Record<string, number> }

const BarMarks = ({ drawing, frame }: { drawing: Drawing; frame: Frame }) => {
  const { horizontal, slots } = drawing.model
  return (
    <BarChart
      {...frame}
      accessibilityLayer
      barCategoryGap="24%"
      barGap={2}
      layout={horizontal ? 'vertical' : 'horizontal'}
    >
      <Scaffold {...drawing} />
      {slots.map((slot) => (
        <Bar
          dataKey={slot.key}
          fill={slot.color}
          isAnimationActive={false}
          key={slot.key}
          maxBarSize={BAR_SIZE}
          shape={barShape(horizontal)}
        >
          {drawing.labels === 'bar-tips' ? (
            <LabelList
              fill={INK}
              fontSize={12}
              formatter={formatter(drawing.spec)}
              position={horizontal ? 'right' : 'top'}
            />
          ) : null}
        </Bar>
      ))}
    </BarChart>
  )
}

const ScatterMarks = ({ drawing, frame }: { drawing: Drawing; frame: Frame }) => (
  <ScatterChart {...frame} accessibilityLayer>
    <Scaffold {...drawing} />
    {drawing.model.slots.map((slot) => (
      <Scatter
        data={frame.data.filter((datum) => typeof datum[slot.key] === 'number')}
        dataKey={slot.key}
        fill={slot.color}
        isAnimationActive={false}
        key={slot.key}
        name={slot.label}
        shape={({ cx, cy }: { cx?: number; cy?: number }) => (
          <circle cx={cx} cy={cy} fill={slot.color} r={5} stroke={SURFACE} strokeWidth={2} />
        )}
      />
    ))}
  </ScatterChart>
)

const AreaMarks = ({ drawing, frame }: { drawing: Drawing; frame: Frame }) => (
  <AreaChart {...frame} accessibilityLayer>
    <Scaffold {...drawing} />
    {drawing.model.slots.map((slot) => (
      <Area
        {...stroke(slot)}
        fill={slot.color}
        fillOpacity={slot.reference ? 0 : 0.1}
        key={slot.key}
      >
        <EndLabel {...drawing} />
      </Area>
    ))}
  </AreaChart>
)

const LineMarks = ({ drawing, frame }: { drawing: Drawing; frame: Frame }) => (
  <LineChart {...frame} accessibilityLayer>
    <Scaffold {...drawing} />
    {drawing.model.slots.map((slot) => (
      <Line {...stroke(slot)} connectNulls={false} dot={false} key={slot.key}>
        <EndLabel {...drawing} />
      </Line>
    ))}
  </LineChart>
)

const MARKS: Record<ChartKind, (props: { drawing: Drawing; frame: Frame }) => ReactNode> = {
  area: AreaMarks,
  bar: BarMarks,
  'diverging-bar': BarMarks,
  line: LineMarks,
  scatter: ScatterMarks,
}

export default function ChartCanvas({ spec }: { spec: ChartSpec }) {
  const model = chartModel(spec)
  const labels = directLabels(spec, model)
  const Marks = MARKS[spec.kind]
  // Keyed by slot, never by an authored series key: see `chartModel`.
  const config: ChartConfig = Object.fromEntries(
    model.slots.map((slot) => [slot.key, { color: slot.color, label: slot.label }]),
  )
  return (
    <ChartContainer className="figure-chart-canvas aspect-auto size-full" config={config}>
      <Marks
        drawing={{ labels, model, spec }}
        frame={{
          data: model.data,
          // Room on the right for the end labels, when they are drawn.
          margin: { bottom: 4, left: 4, right: labels === 'line-ends' ? 48 : 12, top: 12 },
        }}
      />
    </ChartContainer>
  )
}
