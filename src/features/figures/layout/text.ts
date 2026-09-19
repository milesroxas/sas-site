/**
 * Text metrics without a browser. Layout runs on the server at save time, so a
 * label's box is estimated from its character count against the diagram type
 * size (14px Geist averages just over half an em per glyph). The estimate errs
 * wide: a box a few pixels generous reads fine, a clipped label does not.
 *
 * The wrapped lines are stored with the layout, so the renderer draws exactly
 * the lines the box was sized for, even after these numbers change.
 */
export const TEXT_METRICS = {
  /** Average advance of one glyph at the diagram label size, px. */
  charWidth: 7.4,
  /** Average advance at the smaller edge and tag label size, px. */
  smallCharWidth: 6.4,
  lineHeight: 20,
} as const

export const textWidth = (text: string, charWidth: number = TEXT_METRICS.charWidth): number =>
  Math.ceil(text.length * charWidth)

/**
 * Greedy word wrap to `maxChars`, at most `maxLines`. A word longer than a
 * line is split rather than overflowing its box; text past the last line is
 * cut with an ellipsis (the full label stays in the figure's list view).
 */
export function wrapLabel(text: string, maxChars: number, maxLines: number): string[] {
  const words = text
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) => word.match(new RegExp(`.{1,${maxChars}}`, 'gu')) ?? [])
  const lines: string[] = []
  for (const word of words) {
    const last = lines.at(-1)
    if (last !== undefined && last.length + 1 + word.length <= maxChars)
      lines[lines.length - 1] = `${last} ${word}`
    else lines.push(word)
  }
  if (lines.length <= maxLines) return lines
  const kept = lines.slice(0, maxLines)
  const tail = kept[maxLines - 1] ?? ''
  kept[maxLines - 1] = `${tail.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`
  return kept
}
