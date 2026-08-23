/**
 * Shared motion primitives for the takeover-menu system: the dock geometry
 * (open/close in `index.tsx`) and the hero handoff (`heroHandoff.ts`) both
 * land a full-viewport element on a measured rect with the same uniform
 * scale + centered clip mask, so the math and the shared tunables live here
 * exactly once (docs/animations.md contract).
 */

/** Fast ease-in-out shared by the window dock, its clip mask, and the handoff expansion. */
export const MENU_EASE = 'power2.inOut'

/** Cross-dissolve used for the hover previews and the handoff traveler fade-in. */
export const DISSOLVE_DURATION = 0.35
export const DISSOLVE_EASE = 'power2.out'

/** Docked-window card chrome, per breakpoint. */
export const CARD_RADIUS_DESKTOP = 24
export const CARD_RADIUS_MOBILE = 20
export const MOBILE_CARD_SHADOW = '0 0 0 1px oklch(50% 0 0 / 30%), 0 24px 64px oklch(0 0 0 / 35%)'
export const DESKTOP_CARD_SHADOW = '0 0 0 1px oklch(50% 0 0 / 30%), 0 32px 96px oklch(0 0 0 / 35%)'

/**
 * Stacking: menu overlay z-40 < docked page frame < handoff traveler < header z-50.
 * The traveler must cover the docked frame and the overlay, and still pass
 * under the fixed header exactly like the destination page's own hero does.
 */
export const FRAME_Z = 45
export const TRAVELER_Z = 46

/**
 * Hero-media contract: each hero marks its media region with `data-hero-media`
 * (see src/heros/*). The menu clones the first img/video inside it into its
 * dissolve layer; the handoff measures the same element on the destination
 * page as the expansion target.
 */
export const HERO_MEDIA_SELECTOR = '[data-hero-media] img, [data-hero-media] video'

/** Layout viewport width — excludes classic scrollbar / `scrollbar-gutter: stable`. */
export const getViewportWidth = () => document.documentElement.clientWidth

/**
 * Same-tab, unmodified click on a same-origin anchor — a navigation the app
 * router handles in place. New-tab targets and modified clicks (cmd/ctrl/
 * shift/alt) pass through to the browser untouched.
 */
export const isInAppNavClick = (
  anchor: HTMLAnchorElement | null,
  event: Pick<MouseEvent, 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>,
): anchor is HTMLAnchorElement =>
  !!anchor &&
  anchor.origin === window.location.origin &&
  anchor.target !== '_blank' &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey

export type HeroHandoffGate = {
  /** Preview slot must be laid out with real pixels to measure from. */
  slotRect: Pick<DOMRect, 'width' | 'height'>
  reducedMotion: boolean
  /** A handoff already in flight owns the exit end-to-end. */
  handoffActive: boolean
  /** Fully open only (progress 1) — a mid-open click reverses the dock instead. */
  timelineProgress: number | undefined
  /** Same-page links re-land where they are; nothing to hand off to. */
  destinationPathname: string
  currentPathname: string
}

/** Preconditions for starting the hero handoff on a nav click — every unmet
 *  one falls back to the plain close (see TakeoverMenu's onNavItemClick). */
export const canStartHeroHandoff = (gate: HeroHandoffGate): boolean =>
  gate.slotRect.width > 0 &&
  gate.slotRect.height > 0 &&
  !gate.reducedMotion &&
  !gate.handoffActive &&
  gate.timelineProgress === 1 &&
  gate.destinationPathname !== gate.currentPathname

/** Largest rect of the target's aspect that fits the viewport, in local (unscaled)
 *  px. Insets are centered so the mask closes from all sides toward the middle. */
export const getViewportCrop = (vw: number, vh: number, targetAspect: number) => {
  if (vw / vh > targetAspect) {
    // Viewport wider than the target — crop the sides equally.
    const clipH = vh
    const clipW = vh * targetAspect
    const insetX = (vw - clipW) / 2
    return { clipW, clipH, insetT: 0, insetR: insetX, insetB: 0, insetL: insetX }
  }
  // Viewport taller — crop top and bottom equally toward center.
  const clipW = vw
  const clipH = vw / targetAspect
  const insetY = (vh - clipH) / 2
  return { clipW, clipH, insetT: insetY, insetR: 0, insetB: insetY, insetL: 0 }
}

export const clipPathInset = (
  insetT: number,
  insetR: number,
  insetB: number,
  insetL: number,
  radius: number,
) => `inset(${insetT}px ${insetR}px ${insetB}px ${insetL}px round ${radius}px)`

/**
 * Transform + clip-path values that land a full-viewport, top-left-origin
 * element on the measured rect. The uniform scale + centered clip keep any
 * `object-fit: cover` media inside it correctly center-cropped at every step,
 * so the same math serves both the menu dock and the hero handoff.
 */
export const getCardMotion = (target: DOMRect, borderRadius: number) => {
  const vw = getViewportWidth()
  const vh = window.innerHeight
  const crop = getViewportCrop(vw, vh, target.width / target.height)
  // Scale from the crop width so the masked window matches the target size.
  const scale = target.width / crop.clipW
  return {
    scale,
    // Origin top-left so x/y map 1:1 to the target's viewport position.
    x: target.left - crop.insetL * scale,
    y: target.top - crop.insetT * scale,
    clipPath: clipPathInset(crop.insetT, crop.insetR, crop.insetB, crop.insetL, borderRadius),
    openClipPath: clipPathInset(0, 0, 0, 0, 0),
  }
}
