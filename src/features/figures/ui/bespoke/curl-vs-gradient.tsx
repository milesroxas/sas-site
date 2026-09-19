'use client'

import { useState } from 'react'
import type { BespokeFigureProps } from '../../registry/definitions'
import { FigureControl } from './control'

type Props = BespokeFigureProps<'streak-curl-vs-gradient-v1'>

/** A square lattice; the dash is shorter than the pitch so neighbours never touch and the flow reads. */
const PANEL = { cols: 14, rows: 14, size: 280 }
/** Half the dash length: 12px dashes on a 20px pitch. */
const TICK = 6

/**
 * The height map both panels read: a few sines, smooth enough to have clear
 * hills and saddles. Analytic, so its slope is exact and the figure needs no
 * noise library. Returns the gradient (dh/dx, dh/dy) at a point in 0..1.
 */
const slope = (u: number, v: number): [number, number] => {
  const x = u * 6
  const y = v * 6
  return [
    1.3 * Math.cos(1.3 * x + 0.5) * Math.cos(1.1 * y) + 0.42 * Math.cos(0.7 * x - 1.7 * y + 1.2),
    -1.1 * Math.sin(1.3 * x + 0.5) * Math.sin(1.1 * y) - 1.02 * Math.cos(0.7 * x - 1.7 * y + 1.2),
  ]
}

/** Dash centres and the two field angles at each, fixed for the life of the module. */
const FIELD = Array.from({ length: PANEL.cols * PANEL.rows }, (_, index) => {
  const col = index % PANEL.cols
  const row = Math.floor(index / PANEL.cols)
  const [dx, dy] = slope((col + 0.5) / PANEL.cols, (row + 0.5) / PANEL.rows)
  return {
    // The curl of a height map is its gradient turned a quarter: along the contour, never up it.
    curl: Math.atan2(-dx, dy),
    gradient: Math.atan2(dy, dx),
    x: ((col + 0.5) / PANEL.cols) * PANEL.size,
    y: ((row + 0.5) / PANEL.rows) * PANEL.size,
  }
})

const Panel = ({
  field,
  orient,
  title,
}: {
  field: 'curl' | 'gradient'
  orient: number
  title: string
}) => (
  <div className="min-w-0 flex-1">
    <p className="mb-2 text-sm text-muted-foreground">{title}</p>
    <svg
      aria-hidden="true"
      className="block w-full stroke-foreground"
      strokeLinecap="round"
      strokeWidth={1.5}
      viewBox={`0 0 ${PANEL.size} ${PANEL.size}`}
    >
      {FIELD.map((dash, index) => {
        // `orient` leans each dash from lying on its row (0) to facing the field (1).
        const angle = dash[field] * orient
        const dx = Math.cos(angle) * TICK
        const dy = Math.sin(angle) * TICK
        return (
          <line key={index} x1={dash.x - dx} x2={dash.x + dx} y1={dash.y - dy} y2={dash.y + dy} />
        )
      })}
    </svg>
  </div>
)

/**
 * Bespoke figure `streak-curl-vs-gradient-v1`: the same height map read two
 * ways. Left, dashes follow its curl and run along the contours; right, they
 * follow its gradient and climb. One slider turns both from flat rows to the
 * full field, which is the Streak Field `orient` control.
 */
export default function CurlVsGradient({ props }: { props?: Props }) {
  const [orient, setOrient] = useState(props?.orient ?? 1)
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-6 sm:flex-row">
        <Panel field="curl" orient={orient} title="curl: along the contours" />
        <Panel field="gradient" orient={orient} title="gradient: up the slope" />
      </div>
      <div className="mx-auto max-w-md">
        <FigureControl
          format={(value) => value.toFixed(2)}
          label="Orient"
          max={1}
          min={0}
          onChange={setOrient}
          step={0.01}
          value={orient}
        />
      </div>
    </div>
  )
}
