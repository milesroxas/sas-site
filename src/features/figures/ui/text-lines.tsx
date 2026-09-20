import { cn } from '@/utilities/ui'
import { TEXT_METRICS } from '../layout/text'

/**
 * Shift from a line's centre to its baseline. Half the cap height, which is
 * where a line of Latin type looks centred. `dominant-baseline` would say the
 * same thing, but WebKit does not pass it from a `<text>` to its `<tspan>`s,
 * so every wrapped label sat a few pixels high in Safari. An explicit `dy`
 * reads the same in every engine.
 */
const CENTRE_DY = '0.35em'

/**
 * A halo in the ground color behind a label's glyphs (stroke painted first),
 * so a line that has to pass under a label breaks cleanly around it. Lighter
 * than a plate: no box appears where nothing crosses.
 */
const HALO = {
  className: 'stroke-background',
  paintOrder: 'stroke',
  strokeLinejoin: 'round',
  strokeWidth: 5,
} as const

/**
 * The one way a figure's SVG sets wrapped type: a block of pre-wrapped lines centred on
 * `y`, one `<tspan>` a line. The layout decides the lines and the point; this
 * only draws them, so no renderer carries its own baseline arithmetic.
 */
export const TextLines = ({
  anchor = 'middle',
  className,
  halo = false,
  lineHeight = TEXT_METRICS.lineHeight,
  lines,
  x,
  y,
}: {
  anchor?: 'end' | 'middle' | 'start'
  className: string
  halo?: boolean
  /** Defaults to the node label leading the graph layout sizes boxes for. */
  lineHeight?: number
  lines: readonly string[]
  x: number
  /** The vertical centre of the whole block. */
  y: number
}) => {
  const first = y - ((lines.length - 1) * lineHeight) / 2
  return (
    <text
      {...(halo ? HALO : null)}
      className={cn(className, halo && HALO.className)}
      textAnchor={anchor}
    >
      {lines.map((line, index) => (
        <tspan dy={CENTRE_DY} key={index} x={x} y={first + index * lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  )
}
