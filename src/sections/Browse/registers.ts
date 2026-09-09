/**
 * The work index's three mono registers, shared with every surface that
 * renders an index row (the related-work list on segment pages reads the same
 * row). Each carries a real lead rather than `leading-none`: the strip wraps at
 * narrow widths and the row facts line runs long, and wide tracking on a
 * collapsed lead closes up the moment it wraps.
 */

/** Section labels: `Filter`, `Sort`, the row's facts line, the related-work filter label. */
export const LABEL = 'font-mono text-xs/4 tracking-widest uppercase'
/** Values the reader acts on: dropdown text and the sort options. */
export const CONTROL = 'font-mono text-xs/4 uppercase'
/** Figures: the index count and the row numbers sit one step larger. */
export const FIGURE = 'font-mono text-sm/none uppercase'

/** Row numbers read `01`, `02`: the index is a numbered list, never a count from zero. */
export const padIndex = (index: number) => String(index + 1).padStart(2, '0')
