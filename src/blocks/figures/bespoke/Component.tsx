import { useId } from 'react'
import { isBespokeFigureId } from '@/features/figures'
import { BespokeFigure } from '@/features/figures/ui/bespoke/bespoke-figure'
import type { BespokeFigureBlock as BespokeFigureBlockData } from '@/payload-types'
import { frameProps } from '../frame-props'
import { FigureShell } from '../Shell'

type BespokeFigureBlockProps = BespokeFigureBlockData & { bare?: boolean }

/**
 * An id the registry no longer holds renders nothing: removing a figure is a
 * content change (`registry/definitions`), and a missing one has no words of
 * its own to fall back on beyond what the page already says.
 */
export const BespokeFigureBlock = ({ bare, ...block }: BespokeFigureBlockProps) => {
  const frame = frameProps(block, useId())
  if (!isBespokeFigureId(block.figure)) return null
  return (
    <FigureShell bare={bare} theme={block.theme}>
      <BespokeFigure {...frame} figure={block.figure} props={block.props} />
    </FigureShell>
  )
}
