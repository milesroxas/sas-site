import type { FigureFrameProps } from '@/features/figures/ui/figure-frame'
import type { ChartBlock } from '@/payload-types'

/** The frame fields every figure block stores (`figureFrameFields`), as any of the three block types carries them. */
type FrameData = Pick<ChartBlock, 'caption' | 'dataSource' | 'title' | 'width'> & {
  /** Required on a chart and a diagram, optional on a bespoke figure (the registry stands in). */
  textAlternative?: null | string
}

/** A block's stored frame fields as `FigureFrame` props. `fallbackId` stands in for a row not saved yet. */
export const frameProps = (
  block: FrameData & { id?: null | string },
  fallbackId: string,
): Omit<FigureFrameProps, 'children'> => ({
  blockId: block.id ?? fallbackId,
  caption: block.caption,
  source: block.dataSource,
  textAlternative: block.textAlternative ?? '',
  title: block.title,
  width: block.width,
})
