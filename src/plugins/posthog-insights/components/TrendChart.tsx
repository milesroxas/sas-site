'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { bandIndex, barPath, niceScale } from '../chart'
import type { Metric, TrendPoint } from '../summary'
import styles from './traffic.module.css'

const HEIGHT = 160
const PAD = { top: 6, right: 0, bottom: 22, left: 28 }
const PLOT_HEIGHT = HEIGHT - PAD.top - PAD.bottom
/** A bar takes this share of its day's band; the rest is the gap between days. */
const BAR_SHARE = 0.64
/** Seven bars on a wide card would be slabs: past this they stop widening. */
const BAR_MAX = 32
/** A day's band this wide or wider can carry its own date under it. */
const LABEL_EVERY_DAY = 44

/** Dates arrive as calendar days; read them in UTC so no time zone moves them. */
const dayFormat = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})
const longDayFormat = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  weekday: 'short',
})
const dateOf = (day: string) => new Date(`${day}T00:00:00Z`)
const shortDay = (day: string) => dayFormat.format(dateOf(day))
const longDay = (day: string) => longDayFormat.format(dateOf(day))

/** 3.3 a day, 12 a day: one place below ten, none above. */
const formatAverage = (value: number) =>
  value < 10 ? String(Math.round(value * 10) / 10) : String(Math.round(value))

/** Its width, kept current as the widget is resized. Zero until measured. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

/**
 * The window day by day, one column per day, over a dashed line at the
 * window before's daily average: each bar reads as above or below a usual
 * day. Today is still counting, so its bar is hatched. Hovering a day lifts
 * its bar and reads it. The plot is a slider over the days, so the arrow keys
 * move the same reading and a screen reader hears it; a hidden table carries
 * every value.
 */
export function TrendChart({
  metric,
  points,
  previousLabel,
}: {
  metric: Metric
  points: TrendPoint[]
  previousLabel: string
}) {
  // The SVG fills the frame and the frame is measured, never the reverse: a
  // drawing sized from its last measure would hold the card open as it shrinks.
  const [frameRef, width] = useWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  // The tooltip glides between days, but appears where it is needed rather
  // than sliding in from wherever it was last.
  const [instant, setInstant] = useState(true)
  const hatchId = useId()

  const values = points.map((point) => metric.value(point.current))
  const previousTotal = points.reduce((sum, point) => sum + metric.value(point.previous), 0)
  const average = points.length ? previousTotal / points.length : 0
  // Three steps at most: a compact plot needs a scale, not a ruler.
  const { top, ticks } = niceScale(Math.max(average, ...values), 3)

  const last = points.length - 1
  const plotWidth = Math.max(0, width - PAD.left - PAD.right)
  const band = points.length ? plotWidth / points.length : 0
  const barWidth = Math.max(2, Math.min(BAR_MAX, band * BAR_SHARE))
  const center = (index: number) => PAD.left + band * (index + 0.5)
  const y = (value: number) => PAD.top + PLOT_HEIGHT - (value / top) * PLOT_HEIGHT
  const baseline = y(0)
  const nothing = values.every((value) => value === 0) && average === 0

  const show = (next: number) => {
    if (next === active) return
    setInstant(active === null)
    setActive(next)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const left = event.currentTarget.getBoundingClientRect().left
    show(bandIndex(event.clientX - left, PAD.left, band, points.length))
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys: Record<string, (index: number) => number> = {
      ArrowLeft: (index) => Math.max(0, index - 1),
      ArrowRight: (index) => Math.min(last, index + 1),
      End: () => last,
      Home: () => 0,
    }
    const go = keys[event.key]
    if (!go) return
    event.preventDefault()
    show(go(active ?? last))
  }

  // Every day under its bar when there is room. Otherwise the ends and the
  // middle, the ends held flush with the outer bars so neither runs off.
  const everyDay = band >= LABEL_EVERY_DAY
  const xLabels = everyDay
    ? points.map((_, index) => index)
    : [0, Math.floor(last / 2), last].filter((index, at, all) => all.indexOf(index) === at)
  const labelAt = (index: number): { x: number; anchor: 'start' | 'middle' | 'end' } => {
    if (everyDay || (index !== 0 && index !== last)) return { x: center(index), anchor: 'middle' }
    return index === 0
      ? { x: center(0) - barWidth / 2, anchor: 'start' }
      : { x: center(last) + barWidth / 2, anchor: 'end' }
  }

  const dayName = (index: number) =>
    index === last ? 'Today, so far' : longDay(points[index]?.date ?? '')
  const point = active === null ? undefined : points[active]
  const tooltipLeft = active === null ? 0 : center(active)
  const flip = tooltipLeft > width - 160
  // What the slider says for the day under the reading, or today when none is.
  const readIndex = active ?? last
  const reading = points[readIndex]
    ? `${dayName(readIndex)}: ${metric.counted(values[readIndex] ?? 0)}.`
    : 'No days to read.'
  const averageText = `${previousLabel}: ${formatAverage(average)} a day`

  return (
    <div className={styles.chart}>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span aria-hidden className={styles.legendBar} />
          {metric.label} a day
        </span>
        <span className={styles.legendItem}>
          <span aria-hidden className={styles.legendAverage} />
          {averageText}
        </span>
      </div>

      {/* A slider over the days: the arrow keys move the reading, and a screen
          reader hears each day as the value. */}
      <div
        aria-label={`${metric.label} by day`}
        aria-valuemax={last}
        aria-valuemin={0}
        aria-valuenow={readIndex}
        aria-valuetext={reading}
        className={styles.plotFrame}
        onBlur={() => setActive(null)}
        onFocus={() => show(last)}
        onKeyDown={onKeyDown}
        onPointerLeave={() => setActive(null)}
        onPointerMove={onPointerMove}
        ref={frameRef}
        role="slider"
        tabIndex={0}
      >
        <svg aria-hidden="true" className={styles.plot} height={HEIGHT} width="100%">
          <defs>
            {/* Today's bar: hatched, because the day is not over. */}
            <pattern
              height="5"
              id={hatchId}
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
              width="5"
            >
              <rect className={styles.hatchGround} height="5" width="5" />
              <line className={styles.hatchLine} x1="0" x2="0" y1="0" y2="5" />
            </pattern>
          </defs>

          {ticks.map((tick) => (
            <g key={tick}>
              <line
                className={tick === 0 ? `${styles.gridLine} ${styles.baseline}` : styles.gridLine}
                x1={PAD.left}
                x2={width - PAD.right}
                y1={Math.round(y(tick)) + 0.5}
                y2={Math.round(y(tick)) + 0.5}
              />
              <text dominantBaseline="middle" textAnchor="end" x={PAD.left - 8} y={y(tick)}>
                {metric.format(tick)}
              </text>
            </g>
          ))}

          {width > 0 && active !== null && (
            <rect
              className={styles.dayBand}
              height={PLOT_HEIGHT}
              rx={4}
              width={band}
              x={PAD.left + band * active}
              y={PAD.top}
            />
          )}

          {width > 0 && (
            <g
              className={styles.bars}
              data-reading={active !== null}
              key={`${metric.key}-${points.length}-${points[0]?.date}`}
            >
              {values.map((value, index) => (
                <path
                  className={styles.bar}
                  d={barPath(center(index) - barWidth / 2, y(value), barWidth, baseline)}
                  data-active={index === active}
                  key={index}
                  // Inline, so the hatch outranks the stylesheet's fill.
                  style={
                    {
                      '--index': index,
                      fill: index === last ? `url(#${hatchId})` : undefined,
                    } as React.CSSProperties
                  }
                />
              ))}
            </g>
          )}

          {width > 0 && average > 0 && (
            <line
              className={styles.averageLine}
              x1={PAD.left}
              x2={width - PAD.right}
              y1={Math.round(y(average)) + 0.5}
              y2={Math.round(y(average)) + 0.5}
            />
          )}

          {width > 0 &&
            xLabels.map((index) => {
              const { x, anchor } = labelAt(index)
              return (
                <text
                  className={index === active ? styles.axisActive : undefined}
                  key={index}
                  textAnchor={anchor}
                  x={x}
                  y={HEIGHT - 6}
                >
                  {index === last ? 'Today' : shortDay(points[index]?.date ?? '')}
                </text>
              )
            })}
        </svg>
      </div>

      {nothing && width > 0 && (
        <p className={styles.empty}>No production traffic in this window.</p>
      )}

      <div
        aria-hidden
        className={styles.tooltip}
        data-instant={instant}
        style={{
          opacity: point ? 1 : 0,
          transform: `translateX(${flip ? tooltipLeft - barWidth / 2 - 8 : tooltipLeft + barWidth / 2 + 8}px) translateX(${flip ? '-100%' : '0'})`,
        }}
      >
        {point && active !== null && (
          <>
            <span className={styles.tooltipDate}>{dayName(active)}</span>
            <strong className={styles.tooltipValue}>{metric.counted(values[active] ?? 0)}</strong>
          </>
        )}
      </div>

      <table className={styles.srOnly}>
        <caption>
          {metric.label} by day. {averageText}.
        </caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">{metric.label}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((day, index) => (
            <tr key={day.date}>
              <th scope="row">{dayName(index)}</th>
              <td>{metric.format(values[index] ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
