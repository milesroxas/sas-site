'use client'

import { useId, useState } from 'react'
import type { BespokeFigureProps } from '../../registry/definitions'
import { FigureControl } from './control'

type Props = BespokeFigureProps<'streak-dash-anatomy-v1'>

const VIEW = { height: 220, width: 520 }
const DEFAULTS = { length: 220, tail: 0.42, thickness: 10 } satisfies Required<Props>
/** The dash is drawn enlarged so its parts can carry labels. */
const SCALE = 1.5

/** A dimension line with end ticks and a label: the drafting mark for "this distance". */
const Dimension = ({
  from,
  label,
  to,
  vertical = false,
}: {
  from: number
  label: string
  to: number
  vertical?: boolean
}) => {
  const at = vertical ? 60 : 168
  const mid = (from + to) / 2
  return (
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
      <text
        className="fill-muted-foreground stroke-none text-xs"
        textAnchor={vertical ? 'end' : 'middle'}
        x={vertical ? at - 10 : mid}
        y={vertical ? mid + 4 : at + 18}
      >
        {label}
      </text>
    </g>
  )
}

/**
 * Bespoke figure `streak-dash-anatomy-v1`: one streak drawn large, its
 * controls named on it. The drawing is a pure function of three numbers, so
 * the server render at the starting values is the static fallback: a reader
 * without JavaScript gets the labelled drawing. The sliders are in that first
 * render too, so hydrating never moves the page.
 */
export default function DashAnatomy({ props }: { props?: Props }) {
  const gradient = useId()
  const [length, setLength] = useState(props?.length ?? DEFAULTS.length)
  const [thickness, setThickness] = useState(props?.thickness ?? DEFAULTS.thickness)
  const [tail, setTail] = useState(props?.tail ?? DEFAULTS.tail)

  const height = thickness * SCALE
  const left = (VIEW.width - length) / 2
  const right = left + length
  const top = 96 - height / 2

  return (
    <div className="space-y-5">
      <svg
        aria-hidden="true"
        className="mx-auto block w-full font-sans"
        style={{ maxWidth: VIEW.width }}
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
          width={length}
          x={left}
          y={top}
        />
        <Dimension from={left} label="length (minLength to maxLength)" to={right} />
        <Dimension from={top} label="thickness" to={top + height} vertical />
        <text className="fill-muted-foreground text-xs" textAnchor="start" x={left} y={top - 14}>
          tail
        </text>
        <text className="fill-muted-foreground text-xs" textAnchor="end" x={right} y={top - 14}>
          head (cap rounds both ends)
        </text>
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
