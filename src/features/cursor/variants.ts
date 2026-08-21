/**
 * Custom cursor tuning contract, mirroring the immersive defaults/presets rule:
 * `CURSOR_DEFAULTS` is the single source of truth; variants are delta-only
 * overrides. Never restate a default inside a variant.
 *
 * ## Target styling contract (single source of truth for proximity)
 *
 * The provider computes proximity once and publishes it to every target:
 *
 * - `--cursor-proximity` (see `CURSOR_PROXIMITY_VAR`): 0–1, written while the
 *   pointer is within the variant's `proximityRadius`, removed at 0.
 * - `data-cursor-active` (see `CURSOR_ACTIVE_ATTR`): present on the target
 *   while it is truly hovered.
 *
 * Targets own their visual response entirely in CSS — derive scale, background,
 * shadow, etc. from `var(--cursor-proximity, 0)` (the `, 0` fallback keeps
 * touch/reduced-motion sessions at the base state). No JS or client boundary
 * at the call site; see `FeaturedCard` for the reference usage.
 */

export type CursorVariantTuning = {
  /** Px beyond the target's bounds where the cursor starts to materialize. */
  proximityRadius: number
  /** Ring opacity ceiling while approaching; full opacity is reserved for true hover. */
  proximityMaxOpacity: number
  /** Outer-ring scale multiplier while truly hovering the target. */
  hoverOuterScale: number
}

export const CURSOR_DEFAULTS = {
  /** Outer ring diameter, px. */
  outerSize: 64,
  /** Inner ring diameter, px. */
  innerSize: 10,
  /** Ring stroke width, px. */
  strokeWidth: 1,
  /** Seconds of positional lag on the outer ring (quickTo duration). */
  outerLag: 0.35,
  /** Seconds of positional lag on the inner ring — tighter than outer for depth. */
  innerLag: 0.15,
  /** Seconds for label/ring fade-in. */
  fadeIn: 0.18,
  /** Seconds for label fade-out. */
  fadeOut: 0.28,
  /** Gap between the outer ring's bottom edge and the label, px. */
  labelOffset: 14,
  /** Seconds for the label's scramble-in (shared scramble-text tween). */
  labelScrambleDuration: 0.35,
  /** Glyph churn rate for the label scramble (scramble-text `speed`). */
  labelScrambleSpeed: 1,
  /** Seconds of pointer stillness before the proximity tease fades out. */
  idleDelay: 0.3,
  /** Outer-ring scale at zero proximity — the resting seed size. */
  outerScaleMin: 0.45,
  /** Outer-ring scale at peak approach; hover pops past this to `hoverOuterScale`. */
  outerScaleMax: 0.85,
  /** Seconds smoothing the proximity-driven ring growth. */
  outerGrowLag: 0.3,
  /** Seconds for the hover lock-on pop (net ring scale → `hoverOuterScale`). */
  hoverPopDuration: 0.35,
  /** Overlay stacking level — above page chrome, below nothing interactive. */
  zIndex: 200,
  proximityRadius: 100,
  proximityMaxOpacity: 0.3,
  hoverOuterScale: 1.15,
} as const

/** Delta-only variant overrides on top of `CURSOR_DEFAULTS`. */
export const CURSOR_VARIANTS = {
  /** For elements worth drawing the eye to (e.g. the home hero card). */
  emphasize: {},
} satisfies Record<string, Partial<CursorVariantTuning>>

export type CursorVariantName = keyof typeof CURSOR_VARIANTS

export const CURSOR_ATTR = 'data-cursor'
export const CURSOR_LABEL_ATTR = 'data-cursor-label'
/** CSS custom property the provider writes on targets; consume with `var(--cursor-proximity, 0)`. */
export const CURSOR_PROXIMITY_VAR = '--cursor-proximity'
/** Attribute present on a target while it is truly hovered. */
export const CURSOR_ACTIVE_ATTR = 'data-cursor-active'

export function resolveCursorVariant(name: string | undefined): CursorVariantTuning {
  const overrides =
    name && name in CURSOR_VARIANTS ? CURSOR_VARIANTS[name as CursorVariantName] : undefined
  return {
    proximityRadius: CURSOR_DEFAULTS.proximityRadius,
    proximityMaxOpacity: CURSOR_DEFAULTS.proximityMaxOpacity,
    hoverOuterScale: CURSOR_DEFAULTS.hoverOuterScale,
    ...overrides,
  }
}

export type CursorTargetOptions = {
  variant?: CursorVariantName
  /** Text shown under the cursor while hovering the target. Omit for rings only. */
  label?: string
}

/**
 * Props to spread on any element (server components included) that should
 * activate the custom cursor. The provider discovers targets by attribute,
 * so no client boundary or ref wiring is needed at the call site.
 */
export function cursorTarget({
  variant = 'emphasize',
  label,
}: CursorTargetOptions = {}): Record<string, string> {
  return {
    [CURSOR_ATTR]: variant,
    ...(label ? { [CURSOR_LABEL_ATTR]: label } : {}),
  }
}
