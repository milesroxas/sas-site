import type { CSSProperties } from 'react'

/**
 * How a drawn figure answers its frame, stated once for every SVG a figure
 * draws (diagrams and bespoke drawings alike). A drawing is authored at the
 * size its type reads at, so it fills the frame up to 1:1 and never past it,
 * and it stops shrinking while that type is still legible.
 */

/** How far a drawing may shrink: 14px labels stay above 11px. Past this it swaps form or scrolls. */
const MIN_SCALE = 0.8

/** The narrowest frame a drawing of this natural width still reads in. */
export const minReadableWidth = (width: number): number => Math.ceil(width * MIN_SCALE)

/** Sizing for a drawn layout: fill the frame up to 1:1, and stop shrinking while type is still readable. */
export const canvasStyle = (width: number): CSSProperties => ({
  height: 'auto',
  maxWidth: width,
  minWidth: minReadableWidth(width),
  width: '100%',
})
