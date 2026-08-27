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

/**
 * The light leak over a pale ground — the shipped look for the site's light
 * theme, against `LIGHT_LEAK_DEFAULTS`' dark-ground look. Re-tune it on
 * /demo/immersive with the window's own light/dark button set to light.
 *
 * `blendMode: 'multiply'` is the load-bearing delta: the default screen-like
 * blend adds light, and light added to white is still white, so the effect is
 * simply absent on a light page. Multiplying flips the shader's composite to
 * its absorptive tail, where the frame reads as shade on paper rather than
 * light on film — everything below is the art direction that follows.
 *
 * The brief for that art direction is a **warm shadow, not coloured beams**.
 * Two things make an absorptive frame read as colour rather than shade, and
 * both come down here. Dispersion is the first: it fringes every edge into six
 * wavelengths, which over a dark ground is spectral bloom and over paper is a
 * rainbow smear, so it drops to a quarter of the default. The cool/warm tint
 * pair is the second: the shader keeps the field's own hue through the stain,
 * so the default's blue lows printed as a violet cast across the sheet. Both
 * tints are pulled to the warm side of neutral — the "cool" end is now only
 * *less* warm — which leaves the whole sheet in one warm grey and the hot core
 * in tan. Saturation and `LIGHT_LEAK_DEFAULTS`' `inkChroma` carry what warmth
 * is left; the shadow's weight is `inkDensity` and gain.
 *
 * The blobs come up and the slat fan stays soft (its sharpness is the default)
 * so the composition is a broad cast with rays in it, rather than a row of
 * bars. Gain still runs above the default to compensate the field being read
 * through `exp()` instead of added straight, but only part way: on paper gain
 * is the stain's weight, so the same value that reads as a lit frame on film
 * reads as a heavy smudge here. The excite response is damped too —
 * `gainEnergy`, `saturationExcite` and `hoverBloom` all below their defaults —
 * because a hard scroll or a hover *darkens* the page, and an undamped one
 * turned the shadow into a blot.
 *
 * Grain runs at roughly three times its default amplitude, for a structural
 * reason rather than a stylistic one. The stain's chroma term reads only the
 * *differences* between channels, and film grain is added to all three
 * equally, so that term is blind to it — only `inkDensity` carries grain into
 * an absorptive frame, and it is 0.32. Scaled back up, the speckle measures
 * the same on paper as it does on film.
 *
 * Copy sits under this overlay and multiply can only darken, so legibility is
 * the constraint the tuning is bounded by: the lowered gain leaves more
 * headroom than the ~12.6:1 near-black contrast the heavier cut measured at
 * rest, and the damping is what keeps a scroll flick and a hover stacked on
 * top of it close to that.
 */
export const LIGHT_LEAK_PAPER = {
  blendMode: 'multiply',
  dispersion: 0.01,
  dispersionEnergy: 0.018,
  gain: 0.4,
  gainEnergy: 0.7,
  saturation: 0.5,
  saturationExcite: 0.1,
  hoverBloom: 0.1,
  grain: 0.1,
  grainLuminance: 0.13,
  coolTint: [1.08, 0.82, 0.58],
  warmTint: [1.45, 0.98, 0.6],
  amber: [0.26, 0.09, 0],
  blobWarm: 0.6,
  streak: 0.25,
  blobCool: 0.4,
  slats: 0.34,
} as const satisfies Partial<LightLeakProps>
