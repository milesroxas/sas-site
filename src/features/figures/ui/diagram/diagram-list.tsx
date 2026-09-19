import { formatDate } from '../../layout/timeline'
import type { DiagramSpec, GraphSpec, SequenceSpec, TimelineSpec } from '../../spec/diagram'

/**
 * A diagram as ordered lists, in server HTML: what a screen reader, a crawler
 * and a reader without the drawing get. Every label appears here in full,
 * including any the drawing had to wrap or cut.
 */

const SHAPE_NOTE = { decision: 'decision', step: null, terminal: 'start or end' } as const

const GraphList = ({ spec }: { spec: GraphSpec }) => {
  const labels = new Map(spec.nodes.map((node) => [node.id, node.label]))
  const groups = new Map(spec.groups?.map((group) => [group.id, group.label]))
  return (
    <>
      <ol className="list-decimal space-y-1 pl-5">
        {spec.nodes.map((node) => {
          const notes = [SHAPE_NOTE[node.shape ?? 'step'], node.group && groups.get(node.group)]
            .filter(Boolean)
            .join(', ')
          return (
            <li key={node.id}>
              {node.label}
              {notes ? <span className="text-muted-foreground"> ({notes})</span> : null}
            </li>
          )
        })}
      </ol>
      <p className="font-medium">Connections</p>
      <ul className="list-disc space-y-1 pl-5">
        {spec.edges.map((edge, index) => (
          <li key={index}>
            {labels.get(edge.from)} to {labels.get(edge.to)}
            {edge.label ? `: ${edge.label}` : ''}
            {edge.style === 'dashed' ? (
              <span className="text-muted-foreground"> (optional or async)</span>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  )
}

const SequenceList = ({ spec }: { spec: SequenceSpec }) => {
  const labels = new Map(spec.actors.map((actor) => [actor.id, actor.label]))
  return (
    <ol className="list-decimal space-y-1 pl-5">
      {spec.messages.map((message, index) => (
        <li key={index}>
          {message.from === message.to
            ? `${labels.get(message.from)}, to itself`
            : `${labels.get(message.from)} to ${labels.get(message.to)}`}
          : {message.label}
          {message.style === 'reply' ? (
            <span className="text-muted-foreground"> (reply)</span>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

const TimelineList = ({ spec }: { spec: TimelineSpec }) => (
  <>
    {spec.eras?.length ? (
      <ul className="list-disc space-y-1 pl-5">
        {spec.eras.map((era, index) => (
          <li key={index}>
            {era.label}: {formatDate(era.start)} to {formatDate(era.end)}
          </li>
        ))}
      </ul>
    ) : null}
    <ol className="list-decimal space-y-1 pl-5">
      {[...spec.events]
        .sort((a, b) => a.at.localeCompare(b.at))
        .map((event, index) => (
          <li key={index}>
            {formatDate(event.at)}: {event.label}
            {event.ref ? <span className="text-muted-foreground"> ({event.ref})</span> : null}
          </li>
        ))}
    </ol>
  </>
)

export const DiagramList = ({ spec }: { spec: DiagramSpec }) => {
  if (spec.kind === 'sequence') return <SequenceList spec={spec} />
  if (spec.kind === 'timeline') return <TimelineList spec={spec} />
  return <GraphList spec={spec} />
}

/** What the list view is called in the disclosure, per kind. */
export const DIAGRAM_LIST_LABEL: Record<DiagramSpec['kind'], string> = {
  flow: 'steps',
  sequence: 'messages',
  state: 'states',
  timeline: 'events',
}
