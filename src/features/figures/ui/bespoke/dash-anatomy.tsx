'use client'

import { useId, useState } from 'react'
import type { BespokeFigureProps } from '../../registry/definitions'
import { canvasStyle } from '../canvas'
import { TextLines } from '../text-lines'
import { FigureControl } from './control'

type Props = BespokeFigureProps<'streak-dash-anatomy-v1'>

/**
 * The canvas is a phone's column, so the drawing is 1:1 where it is hardest to
 * fit and never scales up past it: its labels stay the size of the page's own
 * small type at every width (`canvasStyle`).
 */
const VIEW = { height: 176, width: 340 }
const DEFAULTS = { length: 220, tail: 0.42, thickness: 10 } satisfies Required<Props>
/**
 * Control values to canvas units. An anatomy, not a ruler: length is drawn
 * short so the longest dash still leaves its labels room, thickness is drawn
 * large so its parts can carry them.
 */
const DRAW = { length: 0.75, thickness: 1.5 }
/** Room left of the dash for the thickness dimension and its label. */
const GUTTER = 84
const ROWS = { ends: 46, dash: 84, cap: 122, length: 144 }
const LABEL = 'fill-muted-foreground text-xs'

/** A dimension line with end ticks: the drafting mark for "this distance". */
const Dimension = ({
  at,
  from,
  to,
  vertical = false,
}: {
  at: number
  from: number
  to: number
  vertical?: boolean
}) => (
  <g className="stroke-muted-foreground">
    {vertical ? (
      <>
        <line x1={at} x2={at} y1={from} y2={to} />
        <line x1={at - 4} x2={at + 4} y1={from} y2={from} />
        <line x1={at - 4} x2={at + 4} y1={to} y2={to} />
      </>
    ) : (
      <>
        <line x1={from} x2={to} y1={at} y2={at} />
        <line x1={from} x2={from} y1={at - 4} y2={at + 4} />
        <line x1={to} x2={to} y1={at - 4} y2={at + 4} />
      </>
    )}
  </g>
)

/**
 * Bespoke figure `streak-dash-anatomy-v1`: one streak drawn large, its
 * controls named on it. The drawing is a pure function of three numbers, so
 * the server render at the starting values is the static fallback: a reader
 * without JavaScript gets the labelled drawing. The sliders are in that first
 * render too, so hydrating never moves the page.
 *
 * The dash and its gutter centre as one group, which keeps the dash's middle
 * on one x at every length: the labels hung on that middle never move, and no
 * label can reach a canvas edge or another label at any slider position.
 */
export default function DashAnatomy({ props }: { props?: Props }) {
  const gradient = useId()
  const [length, setLength] = useState(props?.length ?? DEFAULTS.length)
  const [thickness, setThickness] = useState(props?.thickness ?? DEFAULTS.thickness)
  const [tail, setTail] = useState(props?.tail ?? DEFAULTS.tail)

  const width = length * DRAW.length
  const height = thickness * DRAW.thickness
  const left = (VIEW.width - GUTTER - width) / 2 + GUTTER
  const right = left + width
  const top = ROWS.dash - height / 2

  return (
    <div className="space-y-5">
      <svg
        aria-hidden="true"
        className="mx-auto block font-sans"
        style={canvasStyle(VIEW.width)}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      >
        <defs>
          {/* Head to tail: full ink at the leading end, fading by `tail` toward the trailing end. */}
          <linearGradient id={gradient} x1="1" x2="0" y1="0" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity={1} />
            <stop offset="1" stopColor="currentColor" stopOpacity={1 - tail} />
          </linearGradient>
        </defs>
        <rect
          fill={`url(#${gradient})`}
          height={height}
          rx={height / 2}
          width={width}
          x={left}
          y={top}
        />
        <TextLines anchor="start" className={LABEL} lines={['tail']} x={left} y={ROWS.ends} />
        <TextLines anchor="end" className={LABEL} lines={['head']} x={right} y={ROWS.ends} />
        <TextLines
          anchor="end"
          className={LABEL}
          lines={['cap (rounds both ends)']}
          x={right}
          y={ROWS.cap}
        />
        <Dimension at={left - 14} from={top} to={top + height} vertical />
        <TextLines
          anchor="end"
          className={LABEL}
          lines={['thickness']}
          x={left - 26}
          y={ROWS.dash}
        />
        <Dimension at={ROWS.length} from={left} to={right} />
        <TextLines
          className={LABEL}
          lines={['length (minLength to maxLength)']}
          x={(left + right) / 2}
          y={ROWS.length + 18}
        />
      </svg>

      <div className="mx-auto max-w-md space-y-3">
        <FigureControl
          format={(value) => `${Math.round(value)}px`}
          label="Length"
          max={320}
          min={80}
          onChange={setLength}
          step={1}
          value={length}
        />
        <FigureControl
          format={(value) => `${Math.round(value)}px`}
          label="Thickness"
          max={24}
          min={2}
          onChange={setThickness}
          step={1}
          value={thickness}
        />
        <FigureControl
          format={(value) => value.toFixed(2)}
          label="Tail"
          max={1}
          min={0}
          onChange={setTail}
          step={0.01}
          value={tail}
        />
      </div>
    </div>
  )
}
