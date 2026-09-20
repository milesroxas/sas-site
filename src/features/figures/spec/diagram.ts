import { z } from 'zod'
import { FIGURE_LIMITS } from './limits'
import {
  duplicateIndexes,
  id,
  isoDate,
  label,
  type Report,
  reporter,
  specVersion,
} from './primitives'

/**
 * Diagram spec v1: what connects to what, never where it sits. A spec carries
 * no coordinates; positions are computed once when the document is saved
 * (`layout/`) and stored beside the spec, so an author cannot hand-place a
 * pixel and a diagram cannot shift between deploys.
 */

const LIMITS = FIGURE_LIMITS.diagram

const graph = z.strictObject({
  specVersion,
  kind: z.enum(['flow', 'state']),
  direction: z
    .enum(['LR', 'TD'])
    .describe(
      'LR reads left to right and re-lays out top down on narrow screens, so it always fits a phone. TD has no second layout: three or more nodes side by side, or wide groups, scroll sideways on a phone. Use LR for a chain; split a TD figure that fans out.',
    ),
  nodes: z
    .array(
      z.strictObject({
        id,
        label: label.describe(
          'A caption, not a sentence: it wraps at about four words a line and is cut after three lines.',
        ),
        shape: z
          .enum(['step', 'decision', 'terminal'])
          .optional()
          .describe('Default step. Shape is a second channel beside color, so use it.'),
        group: id.optional().describe('The id of an entry in groups.'),
        emphasis: z.boolean().optional().describe('The one or two nodes the figure is about.'),
      }),
    )
    .min(2)
    .max(LIMITS.nodes),
  edges: z
    .array(
      z.strictObject({
        from: id,
        to: id,
        label: label
          .optional()
          .describe('One line, never wrapped: a word or two ("yes", "on error").'),
        style: z.enum(['solid', 'dashed']).optional().describe('dashed: optional or async.'),
        animated: z.boolean().optional().describe('Marching dashes along a live data path.'),
      }),
    )
    .min(1)
    .max(LIMITS.edges),
  groups: z.array(z.strictObject({ id, label })).max(LIMITS.groups).optional(),
})

const sequence = z.strictObject({
  specVersion,
  kind: z.literal('sequence'),
  actors: z
    .array(z.strictObject({ id, label, role: z.enum(['person', 'system']).optional() }))
    .min(2)
    .max(LIMITS.actors)
    // Said once here, not on the label: the type generator unrolls a short
    // bounded array into tuples and would repeat a per-item description in each.
    .describe(
      'Up to four actors fit a phone with their lifelines intact; five or more scroll sideways there, so split the figure instead. Name each in one to three short words: a phone header holds two short lines and cuts the rest. role person draws the header as a pill.',
    ),
  messages: z
    .array(
      z.strictObject({
        from: id,
        to: id,
        label: label.describe(
          'A short phrase. It wraps to two lines, and a self message gets one line on a phone; the rest is cut.',
        ),
        style: z
          .enum(['call', 'reply', 'self'])
          .optional()
          .describe('Default call. reply draws dashed. self needs from and to to match.'),
      }),
    )
    .min(1)
    .max(LIMITS.messages),
})

const span = z.strictObject({ start: isoDate, end: isoDate })

const timeline = z.strictObject({
  specVersion,
  kind: z.literal('timeline'),
  range: span,
  eras: z.array(span.extend({ label })).max(LIMITS.eras).optional(),
  events: z
    .array(
      z.strictObject({
        at: isoDate,
        label,
        ref: label.optional().describe('A short tag under the label: a version, a commit, a PR.'),
      }),
    )
    .min(1)
    .max(LIMITS.events)
    .describe('An event label is a short phrase: it wraps to two lines and the rest is cut.'),
})

type Graph = z.infer<typeof graph>
type Sequence = z.infer<typeof sequence>
type Timeline = z.infer<typeof timeline>

const reportDuplicateIds = (items: readonly { id: string }[], path: string, report: Report) => {
  for (const index of duplicateIndexes(items, (item) => item.id))
    report([path, index, 'id'], `"${items[index]?.id}" repeats an earlier id`)
}

const checkGraph = (spec: Graph, report: Report) => {
  reportDuplicateIds(spec.nodes, 'nodes', report)
  reportDuplicateIds(spec.groups ?? [], 'groups', report)

  const nodes = new Set(spec.nodes.map((node) => node.id))
  const groups = new Set(spec.groups?.map((group) => group.id))
  spec.nodes.forEach((node, index) => {
    if (node.group && !groups.has(node.group))
      report(['nodes', index, 'group'], `"${node.group}" is not an id in groups`)
  })
  spec.edges.forEach((edge, index) => {
    for (const end of ['from', 'to'] as const)
      if (!nodes.has(edge[end])) report(['edges', index, end], `"${edge[end]}" is not a node id`)
    // A state can return to itself; a flow step that feeds itself is a drawing mistake.
    if (spec.kind === 'flow' && edge.from === edge.to)
      report(['edges', index, 'to'], 'a flow edge cannot loop back to its own node')
  })
}

const checkSequence = (spec: Sequence, report: Report) => {
  reportDuplicateIds(spec.actors, 'actors', report)
  const actors = new Set(spec.actors.map((actor) => actor.id))
  spec.messages.forEach((message, index) => {
    for (const end of ['from', 'to'] as const)
      if (!actors.has(message[end]))
        report(['messages', index, end], `"${message[end]}" is not an actor id`)
    if ((message.style === 'self') !== (message.from === message.to))
      report(['messages', index, 'style'], 'style "self" and a matching from/to go together')
  })
}

const checkTimeline = (spec: Timeline, report: Report) => {
  const { end, start } = spec.range
  // ISO calendar dates order the same as strings.
  if (start >= end) report(['range'], 'range.start must be before range.end')
  const outside = (date: string) => date < start || date > end
  spec.eras?.forEach((era, index) => {
    if (era.start >= era.end) report(['eras', index], 'an era must start before it ends')
    if (outside(era.start) || outside(era.end)) report(['eras', index], 'era falls outside range')
  })
  spec.events.forEach((event, index) => {
    if (outside(event.at)) report(['events', index, 'at'], `${event.at} falls outside range`)
  })
}

export const diagramSpecSchema = z.discriminatedUnion(
  'kind',
  [
    graph.superRefine((spec, ctx) => checkGraph(spec, reporter(ctx))),
    sequence.superRefine((spec, ctx) => checkSequence(spec, reporter(ctx))),
    timeline.superRefine((spec, ctx) => checkTimeline(spec, reporter(ctx))),
  ],
  { error: 'kind must be one of flow, state, sequence, timeline' },
)

export type DiagramSpec = z.infer<typeof diagramSpecSchema>
export type GraphSpec = Extract<DiagramSpec, { kind: 'flow' | 'state' }>
export type SequenceSpec = Extract<DiagramSpec, { kind: 'sequence' }>
export type TimelineSpec = Extract<DiagramSpec, { kind: 'timeline' }>
