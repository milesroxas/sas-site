import gsap from 'gsap'

/**
 * Hero landing — the closing half of a full-screen media takeover, owned once
 * and played by every surface that runs one (docs/animations.md contract).
 *
 * A takeover always ends the same way: the media is holding the whole
 * viewport and has to *land* on the destination's own media element. The
 * landing is clip-path only — the media never moves or resizes again, so it
 * can neither travel diagonally nor drift under the reader's eye. The mask
 * closes ONE axis at a time (horizontal, then vertical) until the window is
 * the destination's rect, revealing the page around it; the destination's own
 * media then dissolves in, which also hides the crop delta a clip-only
 * landing leaves against the destination's `cover` render.
 *
 * Two surfaces play it, on different substrates:
 *   - the takeover menu's hero handoff (`src/Header/Menu/heroHandoff.ts`) —
 *     a fixed GSAP traveler landing on the destination page's
 *     `[data-hero-media]`;
 *   - the work-open view transition (`../view-transition/work-image-morph.ts`)
 *     — the `morph-hero` group pseudo landing on the case-study hero.
 *
 * So the plan is engine-neutral: `planHeroLanding` turns geometry + tuning
 * into ordered clip-path steps, `runHeroLanding` plays them with GSAP, and
 * the view-transition side plays the same steps with WAAPI (its curves
 * translated by `cssEasing`). Tune it on `/demo/transitions` → "Hero landing".
 */

export type HeroLandingTuning = {
  /** Beat at full screen before the collapse, so the takeover registers (s). */
  hold: number
  /** Collapse duration per clip axis — horizontal, then vertical (s). */
  axisDuration: number
  /** Curve both axis steps close on. Same shape as the menu dock's ease. */
  collapseEase: string
  /** Below this travel (px) an axis is already home — skip its step entirely. */
  minAxisTravel: number
  /** Dissolve into the destination's real media (s). */
  settleDuration: number
  settleEase: string
}

/** The landing, tuned once. Never restate these at a call site. */
export const HERO_LANDING = {
  hold: 0.15,
  axisDuration: 0.45,
  collapseEase: 'power2.inOut',
  minAxisTravel: 1,
  settleDuration: 0.35,
  settleEase: 'power1.inOut',
} as const satisfies HeroLandingTuning

/** Viewport-space box. `DOMRect` satisfies it, so measured rects pass straight in. */
export type HeroLandingBox = { left: number; top: number; width: number; height: number }

export type HeroLandingGeometry = {
  /**
   * The animated element's own box, in viewport coordinates — clip-path
   * insets are relative to a border box, not to the screen. A viewport-sized
   * traveler passes `{0, 0, vw, vh}`; the view transition's group is bigger
   * than the viewport (its expansion overshoots on one axis) and offset.
   */
  box: HeroLandingBox
  viewport: { width: number; height: number }
  /** Where the media has to land, in viewport coordinates. */
  target: HeroLandingBox
  /** The destination's own corner treatment; the mask closes into it. */
  radius: number
}

export type HeroLandingStep = {
  /** Which pair of edges this step closes — the order is always x, then y. */
  axis: 'horizontal' | 'vertical'
  /** The mask at the end of this step, in the animated element's coordinates. */
  clipPath: string
  /** Seconds from the landing's start — the hold is baked into the first step. */
  at: number
  duration: number
  ease: string
}

export type HeroLandingPlan = {
  /**
   * The mask at the landing's start: the box cropped to the viewport, which
   * is a no-op crop for a viewport-sized box. Square corners — the takeover
   * is full-bleed until the collapse rounds it into the destination's radius.
   */
  from: string
  /** Horizontal step, then vertical. An axis already home is left out. */
  steps: HeroLandingStep[]
  /** The dissolve into the destination's real media, once the mask is home. */
  settle: { at: number; duration: number; ease: string }
}

export const clipPathInset = (
  insetT: number,
  insetR: number,
  insetB: number,
  insetL: number,
  radius: number,
) => `inset(${insetT}px ${insetR}px ${insetB}px ${insetL}px round ${radius}px)`

/**
 * Geometry + tuning → the ordered mask steps of one landing.
 *
 * Insets are measured from the animated box, and the mask starts at whatever
 * of that box the viewport actually shows: a box larger than the viewport
 * must not animate its offscreen edges inward, or the collapse spends its
 * first frames invisible and reads as a late, shortened move. A destination
 * edge outside the viewport clamps to the start mask — that axis stays
 * full-bleed and the dissolve takes it from there.
 */
export const planHeroLanding = (
  { box, viewport, target, radius }: HeroLandingGeometry,
  tuning: HeroLandingTuning = HERO_LANDING,
): HeroLandingPlan => {
  const fromT = Math.max(0, -box.top)
  const fromR = Math.max(0, box.left + box.width - viewport.width)
  const fromB = Math.max(0, box.top + box.height - viewport.height)
  const fromL = Math.max(0, -box.left)
  const toT = Math.max(fromT, target.top - box.top)
  const toR = Math.max(fromR, box.left + box.width - (target.left + target.width))
  const toB = Math.max(fromB, box.top + box.height - (target.top + target.height))
  const toL = Math.max(fromL, target.left - box.left)

  const steps: HeroLandingStep[] = []
  let at = tuning.hold
  const step = (axis: HeroLandingStep['axis'], clipPath: string) => {
    steps.push({ axis, clipPath, at, duration: tuning.axisDuration, ease: tuning.collapseEase })
    at += tuning.axisDuration
  }
  if (toL - fromL >= tuning.minAxisTravel || toR - fromR >= tuning.minAxisTravel) {
    step('horizontal', clipPathInset(fromT, toR, fromB, toL, radius))
  }
  if (toT - fromT >= tuning.minAxisTravel || toB - fromB >= tuning.minAxisTravel) {
    step('vertical', clipPathInset(toT, toR, toB, toL, radius))
  }
  // Both axes home (a full-bleed destination) leaves no steps at all: the
  // landing is the hold and then the dissolve.
  return {
    from: clipPathInset(fromT, fromR, fromB, fromL, 0),
    steps,
    settle: { at, duration: tuning.settleDuration, ease: tuning.settleEase },
  }
}

/**
 * Plays a plan on a real element with GSAP. The returned timeline completes
 * when the mask is home — hand the dissolve in as `onComplete`, since each
 * surface dissolves differently (the traveler fades out over the page's own
 * hero; the view transition fades its hero snapshot in). A plan with no steps
 * completes straight into it.
 */
export const runHeroLanding = (
  target: gsap.TweenTarget,
  plan: HeroLandingPlan,
  onComplete?: () => void,
) => {
  const timeline = gsap.timeline({ onComplete })
  for (const step of plan.steps) {
    timeline.to(
      target,
      { clipPath: step.clipPath, duration: step.duration, ease: step.ease },
      step.at,
    )
  }
  return timeline
}

/** Resolution of the sampled `linear()` curves below — smooth past the eye. */
const EASING_SAMPLES = 32

/**
 * A GSAP ease, spelled for CSS/WAAPI. The landing runs on two substrates, so
 * each curve is named once — as a GSAP ease, in `HERO_LANDING` — and sampled
 * into a `linear()` easing for the other side rather than restated as a
 * hand-matched `cubic-bezier` that would drift from it. `linear()` is Chrome
 * 113+, so the view-transition consumer checks for it before sequencing and
 * keeps its CSS fallback on anything older.
 */
export const cssEasing = (ease: string, samples = EASING_SAMPLES) => {
  const curve = gsap.parseEase(ease)
  if (!curve) return 'linear'
  const points = Array.from({ length: samples + 1 }, (_, index) =>
    Number(curve(index / samples).toFixed(4)),
  )
  return `linear(${points.join(',')})`
}
