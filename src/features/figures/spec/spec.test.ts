import { describe, expect, it } from 'vitest'
import { CHART_CORPUS, DIAGRAM_CORPUS } from '../corpus'
import { type ChartSpec, chartSpecSchema } from './chart'
import { type DiagramSpec, diagramSpecSchema, type GraphSpec } from './diagram'
import { chartSpecJsonSchema, diagramSpecJsonSchema } from './json-schema'
import { FIGURE_LIMITS } from './limits'
import { describeIssues, readSpec } from './read'

const chart = CHART_CORPUS.posterWeight?.spec as ChartSpec
const flow = DIAGRAM_CORPUS.visualResolves?.spec as GraphSpec

const issuesOf = (schema: Parameters<typeof readSpec>[0], value: unknown): string =>
  describeIssues(readSpec(schema, value).issues ?? [])

describe('the acceptance corpus', () => {
  it.each(Object.entries(CHART_CORPUS))('accepts chart %s', (_, figure) => {
    expect(readSpec(chartSpecSchema, figure.spec).issues).toBeUndefined()
  })
  it.each(Object.entries(DIAGRAM_CORPUS))('accepts diagram %s', (_, figure) => {
    expect(readSpec(diagramSpecSchema, figure.spec).issues).toBeUndefined()
  })
})

// The Phase 2 gate: each broken spec names the path and the fix, so an agent
// corrects it in one retry.
describe('chartSpecSchema, five broken specs', () => {
  it('names the x type a kind needs', () => {
    expect(issuesOf(chartSpecSchema, { ...chart, kind: 'scatter' })).toBe(
      'x.type: a scatter chart needs x.type number',
    )
  })
  it('points at the row and column of a value that is not a number', () => {
    const rows = [{ size: '1280 wide', png: '412', webp: 138 }, ...chart.rows.slice(1)]
    expect(issuesOf(chartSpecSchema, { ...chart, rows })).toBe(
      'rows[0].png: a series value must be a number or null',
    )
  })
  it('catches a misspelled column and lists the ones that exist', () => {
    const rows = [{ size: '1280 wide', png: 412, webP: 138 }, ...chart.rows.slice(1)]
    expect(issuesOf(chartSpecSchema, { ...chart, rows })).toBe(
      'rows[0].webP: unknown column; expected "size", "png", "webp"',
    )
  })
  it('refuses a fifth series by its limit', () => {
    const series = ['a', 'b', 'c', 'd', 'e'].map((key) => ({ key, label: key }))
    expect(issuesOf(chartSpecSchema, { ...chart, series })).toContain(
      `series: Too big: expected array to have <=${FIGURE_LIMITS.chart.series} items`,
    )
  })
  it('refuses rows that run backwards under a line', () => {
    const line = CHART_CORPUS.frameTimeByCount?.spec as ChartSpec
    const rows = [...line.rows].reverse()
    expect(issuesOf(chartSpecSchema, { ...line, rows, annotations: undefined })).toContain(
      'rows[1].count: rows must run in increasing x order',
    )
  })
})

describe('chartSpecSchema', () => {
  it('reports a repeated series key once, not once per row', () => {
    const series = [chart.series[0], chart.series[0]]
    const rows = [{ size: 'a', png: 'x' }]
    const message = issuesOf(chartSpecSchema, { ...chart, rows, series })
    expect(message).toContain('series[1].key: "png" repeats an earlier series key')
    expect(message.match(/rows\[0\]\.png/g)).toHaveLength(1)
  })
  it('refuses keys it does not know, so a typo is never silently dropped', () => {
    expect(issuesOf(chartSpecSchema, { ...chart, colour: 'red' })).toBe(
      'Unrecognized key: "colour"',
    )
  })
  it('caps a flood of issues and says how many it held back', () => {
    const rows = Array.from({ length: 40 }, (_, index) => ({ size: `s${index}`, png: 'x' }))
    expect(issuesOf(chartSpecSchema, { ...chart, rows })).toMatch(/; and \d+ more$/)
  })
  it('reads a spec that arrives as a JSON string', () => {
    expect(readSpec(chartSpecSchema, JSON.stringify(chart)).spec).toEqual(chart)
    expect(issuesOf(chartSpecSchema, '{')).toBe('is not valid JSON')
  })
})

describe('diagramSpecSchema', () => {
  it('points at an edge that names a node that does not exist', () => {
    const edges = [{ from: 'slot', to: 'nowhere' }]
    expect(issuesOf(diagramSpecSchema, { ...flow, edges })).toBe(
      'edges[0].to: "nowhere" is not a node id',
    )
  })
  it('lets a state return to itself and refuses the same loop in a flow', () => {
    const edges = [{ from: 'slot', to: 'slot' }]
    expect(issuesOf(diagramSpecSchema, { ...flow, edges })).toBe(
      'edges[0].to: a flow edge cannot loop back to its own node',
    )
    expect(readSpec(diagramSpecSchema, { ...flow, kind: 'state', edges }).issues).toBeUndefined()
  })
  it('ties a self message to a matching from and to', () => {
    const sequence = DIAGRAM_CORPUS.publishSequence?.spec as Extract<
      DiagramSpec,
      { kind: 'sequence' }
    >
    const messages = [{ from: 'editor', to: 'studio', label: 'Publish', style: 'self' }]
    expect(issuesOf(diagramSpecSchema, { ...sequence, messages })).toBe(
      'messages[0].style: style "self" and a matching from/to go together',
    )
  })
  it('keeps timeline events inside the range', () => {
    const timeline = DIAGRAM_CORPUS.studioTimeline?.spec as Extract<
      DiagramSpec,
      { kind: 'timeline' }
    >
    const events = [{ at: '2027-01-01', label: 'Late' }]
    expect(issuesOf(diagramSpecSchema, { ...timeline, events })).toBe(
      'events[0].at: 2027-01-01 falls outside range',
    )
  })
  it('names the kinds that exist when the kind is wrong', () => {
    expect(issuesOf(diagramSpecSchema, { specVersion: 1, kind: 'pie' })).toBe(
      'kind: kind must be one of flow, state, sequence, timeline',
    )
  })
  it('carries no coordinates: a position on a node is an unknown key', () => {
    const nodes = [{ ...flow.nodes[0], x: 10 }, ...flow.nodes.slice(1)]
    expect(issuesOf(diagramSpecSchema, { ...flow, nodes })).toBe('nodes[0]: Unrecognized key: "x"')
  })
})

describe('the JSON Schema handed to the admin editor and MCP', () => {
  it('carries the limits from the one place they are stated', () => {
    const chartSchema = chartSpecJsonSchema.schema as {
      properties: Record<string, { maxItems?: number }>
    }
    expect(chartSchema.properties.rows?.maxItems).toBe(FIGURE_LIMITS.chart.rows)
    expect(chartSchema.properties.series?.maxItems).toBe(FIGURE_LIMITS.chart.series)
    expect(JSON.stringify(diagramSpecJsonSchema.schema)).toContain(
      `"maxItems":${FIGURE_LIMITS.diagram.nodes}`,
    )
  })
  it('nests inside the collection schema without a second $schema keyword', () => {
    expect(chartSpecJsonSchema.schema).not.toHaveProperty('$schema')
  })
})
