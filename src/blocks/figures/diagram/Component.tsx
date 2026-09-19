import { useId } from 'react'
import { currentLayout, type DiagramSpec, diagramSpecSchema, readSpec } from '@/features/figures'
import { DiagramFigure } from '@/features/figures/ui/diagram/diagram-figure'
import type { FigureFrameProps } from '@/features/figures/ui/figure-frame'
import type { DiagramBlock as DiagramBlockData } from '@/payload-types'
import { frameProps } from '../frame-props'
import { FigureShell, FigureUnavailable } from '../Shell'

/** `spec` and `geometry` are `unknown` on purpose: both are read back through their schemas, never cast. */
type DiagramBlockProps = Omit<DiagramBlockData, 'geometry' | 'spec'> & {
  bare?: boolean
  geometry?: unknown
  spec: unknown
}

/**
 * Takes the stored layout only if it was computed from this exact spec by this
 * layout version (`currentLayout`). A stale one is dropped, never drawn:
 * geometry for a different set of nodes is worse than the list view the figure
 * falls back to. No layout engine runs here. Async for the spec hash, which is
 * why it sits apart from the block: `useId` belongs to the sync component.
 */
const Drawing = async ({
  frame,
  layout,
  spec,
}: {
  frame: Omit<FigureFrameProps, 'children'>
  layout: unknown
  spec: DiagramSpec
}) => <DiagramFigure {...frame} layout={await currentLayout(spec, layout)} spec={spec} />

/**
 * The stored spec is parsed again here, never cast: the renderer draws only
 * what today's schema accepts, whatever an autosave or an older version left
 * in the column.
 */
export const DiagramBlock = ({ bare, ...block }: DiagramBlockProps) => {
  const frame = frameProps(block, useId())
  const { spec } = readSpec(diagramSpecSchema, block.spec)
  return (
    <FigureShell bare={bare} theme={block.theme}>
      {spec ? (
        <Drawing frame={frame} layout={block.geometry} spec={spec} />
      ) : (
        <FigureUnavailable {...frame} />
      )}
    </FigureShell>
  )
}
