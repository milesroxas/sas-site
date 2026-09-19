import type { ChartKind } from '../../spec/chart'
import type { ChartSlot } from './model'

/**
 * The key mirrors the mark: a block for bars and areas, a stroke for lines, a
 * dot for scatter. Labels wear text tokens, never the series color; identity
 * comes from the mark beside them. Server HTML, so it is there before the
 * chart loads and is never color alone (the table view carries the rest).
 */
const Key = ({ color, kind }: { color: string; kind: ChartKind }) => {
  if (kind === 'line')
    return <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: color }} />
  if (kind === 'scatter')
    return <span aria-hidden className="size-2 rounded-full" style={{ background: color }} />
  return <span aria-hidden className="size-2.5 rounded-xs" style={{ background: color }} />
}

export const ChartLegend = ({ kind, slots }: { kind: ChartKind; slots: ChartSlot[] }) => (
  <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
    {slots.map((slot) => (
      <li className="flex items-center gap-2" key={slot.key}>
        <Key color={slot.color} kind={kind} />
        {slot.label}
      </li>
    ))}
  </ul>
)
