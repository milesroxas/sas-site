import { useId } from 'react'
import { chartSpecSchema, readSpec } from '@/features/figures'
import { ChartFigure } from '@/features/figures/ui/chart/chart-figure'
import type { ChartBlock as ChartBlockData } from '@/payload-types'
import { frameProps } from '../frame-props'
import { FigureShell, FigureUnavailable } from '../Shell'

/**
 * `spec` is `unknown` on purpose. The generated type describes the column, but
 * the component trusts only what `readSpec` returns, so it accepts a stored
 * row and a `ChartSpec` alike.
 */
type ChartBlockProps = Omit<ChartBlockData, 'spec'> & { bare?: boolean; spec: unknown }

/**
 * The stored spec is parsed again here, never cast: the renderer draws only
 * what today's schema accepts, whatever an autosave or an older version left
 * in the column.
 */
export const ChartBlock = ({ bare, ...block }: ChartBlockProps) => {
  const frame = frameProps(block, useId())
  const { spec } = readSpec(chartSpecSchema, block.spec)
  return (
    <FigureShell bare={bare} theme={block.theme}>
      {spec ? <ChartFigure {...frame} spec={spec} /> : <FigureUnavailable {...frame} />}
    </FigureShell>
  )
}
