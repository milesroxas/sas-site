import type { RefractionMediaProps } from './ui/refraction-media'

/**
 * Named, shipped looks for the immersive effects — the single source of truth
 * for tuning that appears anywhere on the site. Each preset holds only the
 * props that differ from the component's exported `*_DEFAULTS`; everything
 * else falls through to those defaults, so a preset never restates them.
 *
 * Promote a tuning here once it ships (or is used in more than one place);
 * keep one-off experiments inline at their call site.
 */

/**
 * Home hero backdrop lens, dialed in on /demo/immersive. The screen-space
 * warp runs alone as a soft ringed lens — wide spread, full feather, strong
 * refraction and chroma with a slow low-frequency wobble and a faint rim
 * highlight. `lensVisibility: 0` keeps the glass mesh optically absent, so
 * its parameters stay at the component defaults.
 */
export const HERO_LENS = {
  spread: 0.6,
  edge: 0.2,
  feather: 1,
  refraction: 0.5,
  chroma: 1,
  distortion: 0.024,
  noiseScale: 2,
  noiseSpeed: 0.15,
  smear: 0.05,
  highlight: 0.02,
  lensVisibility: 0,
  follow: 4,
  ease: 3,
} as const satisfies Partial<RefractionMediaProps>
