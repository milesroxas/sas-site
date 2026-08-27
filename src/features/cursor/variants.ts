/**
 * Custom cursor tuning contract, mirroring the immersive defaults/presets rule:
 * `CURSOR_DEFAULTS` is the single source of truth; variants are delta-only
 * overrides. Never restate a default inside a variant.
 *
 * One exception, deliberately: press *timing* is not a cursor value. It comes
 * from the site's `--press-*` tokens (globals.css), the same source the
 * `pressable` utility uses, so a ring and the surface under it compress on one
 * cadence — see press-tuning.ts. Only the ring's press amplitude
 * (`pressScale`) lives here.
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
 *
 * Imperative consumers (WebGL scenes on a demand frameloop) subscribe to the
 * same signal in JS via `subscribeCursorProximity` / `useCursorProximitySource`
 * (see proximity.ts); the IndustryWork media panel is the reference usage.
 */

export type CursorVariantTuning = {
  /** Px beyond the target's bounds where the cursor starts to materialize. */
  proximityRadius: number
  /** Ring opacity ceiling while approaching; full opacity is reserved for true hover. */
  proximityMaxOpacity: number
  /** Outer-ring scale multiplier while truly hovering the target. */
  hoverOuterScale: number
  /** Outer-ring scale multiplier while the pointer is held on a pressable target. */
  pressScale: number
  /**
   * The target is dragged rather than clicked. Press applies whether or not the
   * element is clickable, and the grab latches for the whole gesture.
   */
  grabbable: boolean
}

export type CursorLabelActivation = 'hover' | 'proximity'
export type CursorLabelPlacement = 'below' | 'center'

export type CursorVariantDefinition = CursorVariantTuning & {
  /** Provider-owned fallback copy; a target data attribute can still override it. */
  label?: string
  /** Whether the label appears only over the target or while approaching it. */
  labelActivation: CursorLabelActivation
  /** Label position relative to the outer ring. */
  labelPlacement: CursorLabelPlacement
  /** Gap between the outer ring's bottom edge and a `below` label, px. */
  labelOffset: number
  /** Outer ring diameter for this presentation, in px. */
  outerSize: number
  /** Whether the small ring around the pointer remains visible. */
  showInnerRing: boolean
  /** Replace the system cursor while this presentation is active. */
  hideNativeCursor: boolean
  /** Existing semantic DOM marker that opts matching elements in automatically. */
  selector?: string
}

export const CURSOR_DEFAULTS = {
  /** Outer ring diameter, px. */
  outerSize: 52,
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
  /** Label opacity while approaching a proximity-activated target (full opacity is hover). */
  labelTeaseOpacity: 0.7,
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
  /** Outer-ring opacity ceiling (hover and approach both scale into this). */
  outerOpacity: 0.3,
  /** Overlay stacking level — always above page content (it remains pointer-events none). */
  zIndex: 2147483647,
  proximityRadius: 100,
  proximityMaxOpacity: 0.3,
  hoverOuterScale: 1.15,
  /**
   * Ring compression under a held pointer. Every variant presses — the provider
   * gates it on the target actually being pressable (see
   * `resolveCursorPressScale`). Deeper than the surface's `--press-scale` (0.97)
   * because a thin ~60px outline moving 3% would shift its edge under a pixel;
   * the cadence is shared with the surface via the `--press-*` tokens
   * (see press-tuning.ts).
   */
  pressScale: 0.94,
  /** Only the carousel is dragged rather than clicked. */
  grabbable: false,
  labelActivation: 'hover',
  labelPlacement: 'below',
  showInnerRing: true,
  hideNativeCursor: false,
} as const

/** Delta-only variant overrides on top of `CURSOR_DEFAULTS`. */
export const CURSOR_VARIANTS = {
  /** For elements worth drawing the eye to (e.g. the home hero card, menu). */
  emphasize: {
    // Tighter ring→label gap so the label reads as part of the cursor.
    labelOffset: 8,
    outerSize: 40,
  },
  /**
   * Clickable media panels that open into an entry (work, case study). The
   * wide radius doubles as the activation zone for call-site effects driven
   * off the same proximity signal (`useCursorProximitySource`), so the ring
   * and the panel's WebGL response materialize together on approach.
   */
  view: {
    label: 'VIEW',
    proximityRadius: 180,
    labelActivation: 'proximity',
    labelPlacement: 'center',
    // Ring stays at the default outerSize: a media panel wants the site's
    // base cursor scale, not drag's oversized carousel viewfinder.
    // Native cursor is replaced while approaching, so the custom cursor
    // must stay fully opaque — the default tease (0.3) would vanish.
    proximityMaxOpacity: 1,
    showInnerRing: false,
    hideNativeCursor: true,
  },
  /** Automatically discovered carousel affordance; no call-site cursor styling. */
  drag: {
    label: 'DRAG',
    labelActivation: 'proximity',
    labelPlacement: 'center',
    outerSize: 50,
    // The ring carries this press alone — the carousel surface has no
    // `pressable` compression of its own — so it contracts well past the
    // clickable default to read as taking hold of the track.
    pressScale: 0.82,
    grabbable: true,
    // Native cursor is replaced while approaching, so the custom cursor
    // must stay fully opaque — the default tease (0.3) would vanish.
    proximityMaxOpacity: 1,
    showInnerRing: false,
    hideNativeCursor: true,
    selector: '[data-slot="carousel"]',
  },
} satisfies Record<string, Partial<CursorVariantDefinition>>

export type CursorVariantName = keyof typeof CURSOR_VARIANTS

export const CURSOR_ATTR = 'data-cursor'
export const CURSOR_LABEL_ATTR = 'data-cursor-label'
/** Applied to `<html>` while a variant replaces the system cursor. */
export const CURSOR_NATIVE_HIDDEN_ATTR = 'data-cursor-native-hidden'
/** CSS custom property the provider writes on targets; consume with `var(--cursor-proximity, 0)`. */
export const CURSOR_PROXIMITY_VAR = '--cursor-proximity'
/** Attribute present on a target while it is truly hovered. */
export const CURSOR_ACTIVE_ATTR = 'data-cursor-active'

export function resolveCursorVariant(name: string | undefined): CursorVariantDefinition {
  const overrides =
    name && name in CURSOR_VARIANTS ? CURSOR_VARIANTS[name as CursorVariantName] : undefined
  return {
    proximityRadius: CURSOR_DEFAULTS.proximityRadius,
    proximityMaxOpacity: CURSOR_DEFAULTS.proximityMaxOpacity,
    hoverOuterScale: CURSOR_DEFAULTS.hoverOuterScale,
    pressScale: CURSOR_DEFAULTS.pressScale,
    grabbable: CURSOR_DEFAULTS.grabbable,
    labelActivation: CURSOR_DEFAULTS.labelActivation,
    labelPlacement: CURSOR_DEFAULTS.labelPlacement,
    labelOffset: CURSOR_DEFAULTS.labelOffset,
    outerSize: CURSOR_DEFAULTS.outerSize,
    showInnerRing: CURSOR_DEFAULTS.showInnerRing,
    hideNativeCursor: CURSOR_DEFAULTS.hideNativeCursor,
    ...overrides,
  }
}

/**
 * What a pointer can actually press. Kept to elements that are clickable by
 * semantics (which is what every cursor target is today) — a div with a click
 * handler and no role reads as inert to the ring, as it does to a keyboard.
 */
export const CURSOR_CLICKABLE_SELECTOR =
  'a[href],button:not([disabled]),summary,[role="button"]:not([aria-disabled="true"]),[role="link"]'

/**
 * The variant's press amplitude when the target can be pressed, `1` (no
 * response) when it can't — a decorative target must not fake a click. Grabbable
 * variants press regardless: a carousel is dragged, not clicked.
 */
export function resolveCursorPressScale(
  element: Element,
  variant: CursorVariantDefinition,
): number {
  if (variant.grabbable) return variant.pressScale
  return element.closest(CURSOR_CLICKABLE_SELECTOR) ? variant.pressScale : 1
}

const automaticTargets = Object.entries(CURSOR_VARIANTS).flatMap(([variant, definition]) =>
  'selector' in definition && definition.selector
    ? [{ selector: definition.selector, variant: variant as CursorVariantName }]
    : [],
)

/** One live-query selector for explicit targets plus provider-owned automatic targets. */
export const CURSOR_TARGET_SELECTOR = [
  `[${CURSOR_ATTR}]`,
  ...automaticTargets.map(({ selector }) => selector),
].join(',')

/** Explicit target variants win over automatic semantic matches. */
export function resolveCursorTargetVariant(element: Element): string | undefined {
  return (
    element.getAttribute(CURSOR_ATTR) ??
    automaticTargets.find(({ selector }) => element.matches(selector))?.variant
  )
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
