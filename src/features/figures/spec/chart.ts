import { z } from 'zod'
import { FIGURE_LIMITS } from './limits'
import {
  dataKey,
  duplicateIndexes,
  isoDate,
  label,
  type Report,
  reporter,
  specVersion,
} from './primitives'

/**
 * Chart spec v1: data and encoding, nothing else. Palette, marks, type, motion
 * and the one y axis are the renderer's and are not authorable, so every chart
 * on the site reads as one system (docs/figures.md).
 */

const CHART_KINDS = ['bar', 'line', 'area', 'scatter', 'diverging-bar'] as const
export type ChartKind = (typeof CHART_KINDS)[number]

const X_TYPES = ['category', 'number', 'time'] as const
type XType = (typeof X_TYPES)[number]

/** Which x scales each kind can be drawn on. A bar needs bands; a scatter needs a measure. */
const X_TYPES_BY_KIND: Record<ChartKind, readonly XType[]> = {
  area: X_TYPES,
  bar: ['category', 'time'],
  'diverging-bar': ['category'],
  line: X_TYPES,
  scatter: ['number'],
}

const BAR_KINDS: ReadonlySet<ChartKind> = new Set(['bar', 'diverging-bar'])
/** Kinds drawn as a path through the rows in order, so x has to run forward. */
const ORDERED_KINDS: ReadonlySet<ChartKind> = new Set(['line', 'area'])

const cell = z.union([z.number(), z.string().max(FIGURE_LIMITS.label), z.null()], {
  error: 'expected a number, a string or null',
})

const shape = z.strictObject({
  specVersion,
  kind: z.enum(CHART_KINDS),
  orientation: z
    .enum(['horizontal', 'vertical'])
    .optional()
    .describe('Bar kinds only. Horizontal suits long category labels. Default vertical.'),
  x: z.strictObject({
    key: dataKey.describe('The row column plotted on x.'),
    label: label.optional(),
    type: z
      .enum(X_TYPES)
      .describe('category: strings. number: numbers. time: calendar dates, YYYY-MM-DD.'),
  }),
  y: z.strictObject({
    label: label.optional(),
    format: z
      .enum(['number', 'percent', 'compact'])
      .optional()
      .describe('percent reads values as fractions of 1 (0.42 is 42%). compact prints 12.9K.'),
    domain: z
      .tuple([z.number(), z.number()])
      .optional()
      .describe('Fixed [min, max]. Omit to fit the data; bar kinds always include zero.'),
  }),
  series: z
    .array(
      z.strictObject({
        key: dataKey.describe('The row column this series reads.'),
        label,
        role: z
          .enum(['primary', 'reference'])
          .optional()
          .describe('reference draws neutral: a baseline, target or prior period.'),
      }),
    )
    .min(1)
    .max(FIGURE_LIMITS.chart.series)
    .describe('Order is identity: color follows position, so never reorder to restyle.'),
  rows: z
    .array(z.record(z.string(), cell))
    .min(1)
    .max(FIGURE_LIMITS.chart.rows)
    .describe('One object per x position: the x key plus a number or null per series key.'),
  annotations: z
    .array(
      z.strictObject({
        x: z.union([z.number(), z.string().max(FIGURE_LIMITS.label)]).optional(),
        y: z.number().optional(),
        label,
      }),
    )
    .max(FIGURE_LIMITS.chart.annotations)
    .optional()
    .describe('A labelled reference line at an x position, a y value, or a point at both.'),
})

type Shape = z.infer<typeof shape>

const isValidX = (value: unknown, type: XType): boolean => {
  if (type === 'number') return typeof value === 'number'
  if (type === 'time') return isoDate.safeParse(value).success
  return typeof value === 'string' && value.trim().length > 0
}

const X_EXPECTED: Record<XType, string> = {
  category: 'a non-empty string',
  number: 'a number',
  time: 'a calendar date, YYYY-MM-DD',
}

const checkSeries = (spec: Shape, report: Report) => {
  for (const index of duplicateIndexes(spec.series, (series) => series.key))
    report(['series', index, 'key'], `"${spec.series[index]?.key}" repeats an earlier series key`)
  spec.series.forEach((series, index) => {
    if (series.key === spec.x.key)
      report(
        ['series', index, 'key'],
        `"${series.key}" is the x key; a series needs its own column`,
      )
    if (!spec.rows.some((row) => typeof row[series.key] === 'number'))
      report(['series', index, 'key'], `no row has a number under "${series.key}"`)
  })
}

const checkEncoding = (spec: Shape, report: Report) => {
  const allowed = X_TYPES_BY_KIND[spec.kind]
  if (!allowed.includes(spec.x.type))
    report(['x', 'type'], `a ${spec.kind} chart needs x.type ${allowed.join(' or ')}`)
  if (spec.orientation && !BAR_KINDS.has(spec.kind))
    report(['orientation'], 'only bar and diverging-bar charts take an orientation')
  if (spec.y.domain && spec.y.domain[0] >= spec.y.domain[1])
    report(['y', 'domain'], 'domain must be [min, max] with min below max')
}

const checkRows = (spec: Shape, report: Report) => {
  const columns = new Set([spec.x.key, ...spec.series.map((series) => series.key)])
  // Unique, so a repeated series key (reported by `checkSeries`) is not also reported per row twice.
  const seriesKeys = [...new Set(spec.series.map((series) => series.key))]
  let previous: number | string | null = null
  const seen = new Set<number | string>()

  spec.rows.forEach((row, index) => {
    for (const key of Object.keys(row))
      if (!columns.has(key))
        report(
          ['rows', index, key],
          `unknown column; expected ${[...columns].map((column) => `"${column}"`).join(', ')}`,
        )
    for (const key of seriesKeys) {
      const value = row[key]
      if (value !== undefined && value !== null && typeof value !== 'number')
        report(['rows', index, key], 'a series value must be a number or null')
    }

    const x = row[spec.x.key]
    if (!isValidX(x, spec.x.type)) {
      report(['rows', index, spec.x.key], `expected ${X_EXPECTED[spec.x.type]} (x.type)`)
      return
    }
    const position = x as number | string
    if (spec.x.type === 'category' && seen.has(position))
      report(['rows', index, spec.x.key], `"${position}" repeats an earlier category`)
    seen.add(position)
    // ISO dates order the same as strings, so one comparison covers number and time.
    if (
      ORDERED_KINDS.has(spec.kind) &&
      spec.x.type !== 'category' &&
      previous !== null &&
      position <= previous
    )
      report(['rows', index, spec.x.key], 'rows must run in increasing x order')
    previous = position
  })
}

const checkAnnotations = (spec: Shape, report: Report) => {
  const categories = new Set(spec.rows.map((row) => row[spec.x.key]))
  spec.annotations?.forEach((annotation, index) => {
    if (annotation.x === undefined && annotation.y === undefined)
      report(['annotations', index], 'give x, y or both')
    if (annotation.x === undefined) return
    if (!isValidX(annotation.x, spec.x.type))
      report(['annotations', index, 'x'], `expected ${X_EXPECTED[spec.x.type]} (x.type)`)
    else if (spec.x.type === 'category' && !categories.has(annotation.x))
      report(['annotations', index, 'x'], `"${annotation.x}" is not a category in rows`)
  })
}

export const chartSpecSchema = shape.superRefine((spec, ctx) => {
  const report = reporter(ctx)
  checkEncoding(spec, report)
  checkSeries(spec, report)
  checkRows(spec, report)
  checkAnnotations(spec, report)
})

export type ChartSpec = z.infer<typeof chartSpecSchema>
