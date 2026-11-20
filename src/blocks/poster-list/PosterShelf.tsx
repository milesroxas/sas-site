import type { CSSProperties } from 'react'

/**
 * The shelf over the start of the rail, stated once: the page colour under
 * the copy, then a progressive blur that clears over `fade` px and ends
 * exactly where a resting poster starts. A poster sliding left goes soft by
 * degrees and dissolves into the page; nothing is drawn, so at rest the shelf
 * is invisible.
 */
export const POSTER_SHELF = {
  /**
   * Width of the fade, px: the grid gap (2rem) plus the copy's inner margin
   * (4rem, `.poster-copy`), so the fade sits in empty space, never behind words.
   */
  fade: 96,
  /** Blur of each layer, px: each doubles the last, so the blur builds smoothly. */
  blurs: [1, 2, 4, 8, 16, 32],
} as const

/** Smootherstep: zero slope and curvature at both ends, so the fade has no start or stop. */
const gentle = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

/**
 * One blur layer's mask, measured from the shelf's right edge: an overlapping
 * band, each lower layer further from the edge, the strongest running on to
 * the solid part. Overlapping bands are what make the blur progressive with
 * no visible step between layers.
 */
const band = (i: number) => {
  const { fade, blurs } = POSTER_SHELF
  const step = fade / (blurs.length + 1)
  const at = (k: number) => `${(k * step).toFixed(1)}px`
  return i === blurs.length - 1
    ? `linear-gradient(to left, transparent ${at(i)}, black ${at(i + 1)})`
    : `linear-gradient(to left, transparent ${at(i)}, black ${at(i + 1)}, black ${at(i + 2)}, transparent ${at(i + 3)})`
}

/** The page colour: solid under the copy, easing out across the fade (17 stops: no banding). */
const tint = () => {
  const { fade } = POSTER_SHELF
  const stops = Array.from({ length: 17 }, (_, k) => k / 16).map(
    (t) =>
      `color-mix(in oklab, var(--background) ${((1 - gentle(t)) * 100).toFixed(1)}%, transparent) calc(100% - ${fade}px + ${(t * fade).toFixed(1)}px)`,
  )
  return `linear-gradient(to right, var(--background) 0, ${stops.join(', ')})`
}

export function PosterShelf() {
  return (
    <div aria-hidden="true" className="poster-shelf">
      {POSTER_SHELF.blurs.map((px, i) => (
        <i
          key={px}
          style={
            {
              backdropFilter: `blur(${px}px)`,
              WebkitBackdropFilter: `blur(${px}px)`,
              maskImage: band(i),
            } as CSSProperties
          }
        />
      ))}
      <i style={{ backgroundImage: tint() }} />
    </div>
  )
}
