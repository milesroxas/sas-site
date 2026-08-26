import type { LightLeakProps } from './ui/light-leak'
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

/**
 * IndustryWork main-media hover, dialed in on /demo/immersive. A wide,
 * softly refracting edgeless warp with almost no chromatic split, a fine
 * high-frequency wobble and a moderate Y tilt of the whole plane toward the
 * cursor. The melt runs at a wavelength wider than the panel (`meltScale`
 * below 1) with a strong fine octave, so the silhouette pours slowly through
 * a wide bleed margin as organic fluid rather than a row of ripples. A faint
 * glass mesh stays partly visible on top.
 *
 * The mesh is a lens *on* the media, so `lensFade` keeps it inset: it dies as
 * its rim nears the panel's edge and is long gone by the time the cursor is
 * outside (the block pre-activates the panel from the cursor target's
 * proximity, so it would otherwise park on the border). The warp — refraction,
 * chroma, wobble, smear — and the melting silhouette are untouched by it and
 * still run edge to edge.
 */
export const INDUSTRY_WORK_MEDIA = {
  tilt: 9,
  bleed: 0.27,
  melt: 0.111,
  meltScale: 0.25,
  meltDetail: 0.95,
  meltSpeed: 0.1,
  meltBand: 0.07,
  meltFeather: 0.01,
  spread: 0.6,
  refraction: 0.12,
  chroma: 0.05,
  distortion: 0.001,
  noiseScale: 7.5,
  noiseSpeed: 0.4,
  smear: 0.1,
  lensVisibility: 0.4,
  lensSpread: 0.22,
  lensFade: 0.1,
  follow: 8.5,
  ease: 17,
} as const satisfies Partial<RefractionMediaProps>

/**
 * The light leak's amber cut, dialed in on /demo/immersive — the look the
 * effect shipped with before the cooler default replaced it.
 *
 * Where the default reads as blue shadow and cream highlight through a wide,
 * splayed slat fan, this one is hot gold over lilac with the fan pulled to a
 * razor at its top end, a denser cool bloom and a stronger hover flare. The
 * bars barely tighten on hover (`slatFrequencyExcite` 2 against the default's
 * 6.5), so the flare reads as light gathering rather than the blinds closing.
 *
 * Everything not listed falls through to `LIGHT_LEAK_DEFAULTS`.
 */
export const LIGHT_LEAK_AMBER = {
  hoverBloom: 0.36,
  coolTint: [0.79, 0.49, 1.1],
  warmTint: [2, 0.95, 0.1],
  blobCool: 0.69,
  slatAngle: -0.5,
  slatTopSpread: 0.01,
  slatBottomSpread: 0.84,
  slatFrequency: 24,
  slatFrequencyExcite: 2,
} as const satisfies Partial<LightLeakProps>
