import type { ChartSpec } from '../../spec/chart'

/**
 * A spec turned into what the renderer draws from. Pure, so the server table,
 * the legend and the client canvas all read one model and it can be tested
 * without a DOM.
 *
 * Series are re-keyed to fixed slots (`s0`..`s3`). The keys an author chose
 * stay in the spec: they never become a data key, a CSS variable or a class,
 * so nothing authored reaches a stylesheet.
 */

/** Categorical colors in fixed order (`--figure-*`, globals.css). Never cycled: the spec caps series at four. */
const CATEGORICAL = [
  'var(--figure-1)',
  'var(--figure-2)',
  'var(--figure-3)',
  'var(--figure-4)',
] as const
const REFERENCE = 'var(--figure-reference)'

export type ChartSlot = {
  color: string
  /** The slot's data key in `ChartModel.data`. */
  key: string
  label: string
  reference: boolean
}

export type ChartDatum = Record<string, null | number | string> & { x: number | string }

export type ChartModel = {
  data: ChartDatum[]
  horizontal: boolean
  slots: ChartSlot[]
  /** x is drawn on a continuous scale (a measure or time), not bands. */
  continuousX: boolean
}

const toTime = (date: string): number => Date.parse(`${date}T00:00:00Z`)

const dateFormat = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})

const numberFormats = {
  compact: new Intl.NumberFormat('en', { maximumFractionDigits: 1, notation: 'compact' }),
  number: new Intl.NumberFormat('en', { maximumFractionDigits: 2 }),
  percent: new Intl.NumberFormat('en', { maximumFractionDigits: 1, style: 'percent' }),
}

export const formatValue = (spec: ChartSpec, value: number): string =>
  numberFormats[spec.y.format ?? 'number'].format(value)

export const formatX = (spec: ChartSpec, value: number | string): string => {
  if (spec.x.type === 'number') return numberFormats.number.format(Number(value))
  if (spec.x.type !== 'time') return String(value)
  return dateFormat.format(typeof value === 'number' ? value : toTime(value))
}

const isBarKind = (spec: ChartSpec) => spec.kind === 'bar' || spec.kind === 'diverging-bar'

export function chartModel(spec: ChartSpec): ChartModel {
  // Color follows the entity: a reference series is neutral and does not use
  // up a categorical slot, so adding one never repaints the others.
  let categorical = 0
  const slots = spec.series.map((series, index): ChartSlot => {
    const reference = series.role === 'reference'
    const color = reference ? REFERENCE : (CATEGORICAL[categorical++] ?? REFERENCE)
    return { color, key: `s${index}`, label: series.label, reference }
  })

  // Bars need bands, so a time axis under bars is drawn as dated categories.
  const continuousX = spec.x.type !== 'category' && !isBarKind(spec)
  const data = spec.rows.map((row): ChartDatum => {
    const raw = row[spec.x.key] as number | string
    const x =
      spec.x.type === 'time' && typeof raw === 'string'
        ? continuousX
          ? toTime(raw)
          : formatX(spec, raw)
        : raw
    const datum: ChartDatum = { x }
    spec.series.forEach((series, index) => {
      const value = row[series.key]
      datum[`s${index}`] = typeof value === 'number' ? value : null
    })
    return datum
  })

  return {
    continuousX,
    data,
    horizontal: isBarKind(spec) && (spec.orientation ?? defaultOrientation(spec)) === 'horizontal',
    slots,
  }
}

/** A diverging bar reads as left against right; every other bar stands up. */
const defaultOrientation = (spec: ChartSpec) =>
  spec.kind === 'diverging-bar' ? 'horizontal' : 'vertical'

/**
 * The box a chart reserves before it loads, so the lazy canvas replaces its
 * placeholder without moving the page. Standing charts hold an aspect ratio;
 * a horizontal bar chart grows with its rows, since each row is a fixed band.
 */
export const chartBox = (model: ChartModel): { className?: string; height?: number } => {
  if (!model.horizontal) return { className: 'aspect-4/3 sm:aspect-video' }
  const band = model.slots.length * 26 + 18
  return { height: model.data.length * band + 56 }
}

/**
 * Direct value labels, sparingly: they supplement the legend and the table,
 * and a number on every mark is noise. Bars label their tips only when one
 * series has few enough rows to leave air. Lines label their last point, and
 * only while the end points sit far enough apart not to collide.
 */
export function directLabels(spec: ChartSpec, model: ChartModel): 'bar-tips' | 'line-ends' | null {
  if (isBarKind(spec))
    return model.slots.length === 1 && model.data.length <= 12 ? 'bar-tips' : null
  if (spec.kind === 'scatter') return null
  const last = model.data.at(-1)
  const ends = model.slots.flatMap((slot) => {
    const value = last?.[slot.key]
    return typeof value === 'number' ? [value] : []
  })
  const values = model.data.flatMap((datum) =>
    model.slots.flatMap((slot) =>
      typeof datum[slot.key] === 'number' ? [Number(datum[slot.key])] : [],
    ),
  )
  const range = Math.max(...values) - Math.min(...values) || 1
  const sorted = [...ends].sort((a, b) => a - b)
  const crowded = sorted.some(
    (value, index) => index > 0 && (value - (sorted[index - 1] ?? value)) / range < 0.08,
  )
  return crowded ? null : 'line-ends'
}
