'use client'

import dynamic from 'next/dynamic'
import { useRef } from 'react'
import { useNearViewport } from '@/hooks/use-near-viewport'
import { cn } from '@/utilities/ui'
import type { ChartSpec } from '../../spec/chart'
import { chartBox, chartModel } from './model'

/**
 * The chart library in its own chunk, requested when the figure comes within
 * a screen of the viewport. A page with no chart never downloads it, and a
 * long article pays for each chart as the reader approaches it.
 */
const ChartCanvas = dynamic(() => import('./chart-canvas'), { ssr: false })

/** How far ahead of the viewport to start loading: about one screen, so the chart is there on arrival. */
const LOAD_MARGIN = '100% 0px'

/**
 * Reserves the chart's box from its kind before anything loads, so the canvas
 * replaces the placeholder without moving the page. The placeholder is a bare
 * hairline baseline: a skeleton that imitates bars would promise a shape the
 * data may not have.
 */
export function LazyChart({
  describedBy,
  label,
  labelledBy,
  spec,
}: {
  describedBy: string
  /** Names the chart when the figure has no title to point `labelledBy` at. */
  label: string
  labelledBy?: string
  spec: ChartSpec
}) {
  const ref = useRef<HTMLDivElement>(null)
  const near = useNearViewport(ref, LOAD_MARGIN, { once: true })
  const box = chartBox(chartModel(spec))
  return (
    // A group, not an image: the canvas inside is keyboard operable (arrow
    // keys walk the points), and an image role would hide that from a reader.
    // biome-ignore lint/a11y/useSemanticElements: a fieldset is for form controls; this groups a chart.
    <div
      aria-describedby={describedBy}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      className={cn('relative w-full border-b border-border', box.className)}
      ref={ref}
      role="group"
      style={box.height ? { height: box.height } : undefined}
    >
      {near ? <ChartCanvas spec={spec} /> : null}
    </div>
  )
}
