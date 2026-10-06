/**
 * The trend chart's geometry, kept apart from React so it can be tested and
 * so the component only decides what to draw, never how a bar is cut.
 */

/**
 * A count axis that ends on a round number: 0, 5, 10, 15 rather than 0, 4.3,
 * 8.6, stepping by whole numbers only (a tick at 7.5 visitors is a number
 * nobody can have).
 */
export function niceScale(max: number, intervals = 5) {
  if (!(max > 0)) return { top: 4, ticks: niceTicks(1, 4) }
  const rough = max / intervals
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = Math.max(
    1,
    [1, 2, 5, 10].map((multiple) => multiple * magnitude).find((candidate) => candidate >= rough) ??
      10 * magnitude,
  )
  const count = Math.max(1, Math.ceil(max / step - 1e-9))
  return { top: step * count, ticks: niceTicks(step, count) }
}

const niceTicks = (step: number, count: number) =>
  Array.from({ length: count + 1 }, (_, index) => step * index)

const round = (value: number) => Math.round(value * 100) / 100

/**
 * One day's column: square at the baseline, its top corners rounded. The
 * radius shrinks with a short bar so a count of one is still a bar, not a pill.
 */
export function barPath(x: number, top: number, width: number, baseline: number, radius = 2) {
  const height = baseline - top
  if (!(height > 0) || !(width > 0)) return ''
  const r = Math.min(radius, width / 2, height)
  const right = x + width
  return `M${round(x)},${round(baseline)}V${round(top + r)}Q${round(x)},${round(top)} ${round(x + r)},${round(top)}H${round(right - r)}Q${round(right)},${round(top)} ${round(right)},${round(top + r)}V${round(baseline)}Z`
}

/** The day under a horizontal position: each day owns an equal band of the plot. */
export const bandIndex = (x: number, left: number, band: number, length: number) =>
  Math.min(length - 1, Math.max(0, Math.floor((x - left) / (band || 1))))
