import type { CSSProperties } from 'react'

/**
 * Geometry helpers the three diagram renderers share. Pure string math: the
 * renderers are server components and draw stored or arithmetic layouts, so
 * nothing here measures or routes.
 */

type Point = readonly [number, number]

/** Reading-order steps past this share one beat, so a 40-node graph still lands inside a second. */
const MAX_STEP = 12

/** The `--i` a figure element staggers on (globals.css, "Diagram entrance"). */
export const stepStyle = (step: number) => ({ '--i': Math.min(step, MAX_STEP) }) as CSSProperties

const CORNER = 8

/**
 * An orthogonal route as a path with its corners eased. Each bend is cut back
 * by the corner radius (never more than half a segment, so short doglegs stay
 * valid) and joined with a quadratic through the original vertex.
 */
export function roundedPath(points: readonly Point[]): string {
  const [first, ...rest] = points
  if (!first) return ''
  let d = `M${first[0]},${first[1]}`
  rest.forEach((point, index) => {
    const next = rest[index + 1]
    if (!next) {
      d += `L${point[0]},${point[1]}`
      return
    }
    const previous = index === 0 ? first : (rest[index - 1] ?? first)
    const into = Math.hypot(point[0] - previous[0], point[1] - previous[1])
    const out = Math.hypot(next[0] - point[0], next[1] - point[1])
    const r = Math.min(CORNER, into / 2, out / 2)
    if (r < 1) {
      d += `L${point[0]},${point[1]}`
      return
    }
    const ax = point[0] - ((point[0] - previous[0]) / into) * r
    const ay = point[1] - ((point[1] - previous[1]) / into) * r
    const bx = point[0] + ((next[0] - point[0]) / out) * r
    const by = point[1] + ((next[1] - point[1]) / out) * r
    d += `L${ax},${ay}Q${point[0]},${point[1]} ${bx},${by}`
  })
  return d
}

const ARROW = { length: 9, width: 7 }

/**
 * A filled arrowhead at the end of a route, pointing along its last segment.
 * Drawn as its own polygon rather than an SVG marker so it takes `currentColor`
 * everywhere and can arrive on its own beat, after the line has drawn.
 */
export function arrowHead(points: readonly Point[]): string {
  const tip = points.at(-1)
  const from = points.at(-2)
  if (!tip || !from) return ''
  const length = Math.hypot(tip[0] - from[0], tip[1] - from[1]) || 1
  const ux = (tip[0] - from[0]) / length
  const uy = (tip[1] - from[1]) / length
  const baseX = tip[0] - ux * ARROW.length
  const baseY = tip[1] - uy * ARROW.length
  const half = ARROW.width / 2
  return [
    `${tip[0]},${tip[1]}`,
    `${baseX - uy * half},${baseY + ux * half}`,
    `${baseX + uy * half},${baseY - ux * half}`,
  ].join(' ')
}
