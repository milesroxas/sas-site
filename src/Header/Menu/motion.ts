/**
 * Shared motion primitives for the takeover-menu system: the dock geometry
 * (open/close in `index.tsx`) and the hero handoff (`heroHandoff.ts`) both
 * land a full-viewport element on a measured rect with the same uniform
 * scale + centered clip mask, so the math and the shared tunables live here
 * exactly once (docs/animations.md contract).
 */

import { clipPathInset } from '@/shared/ui/hero-landing'

/** Fast ease-in-out shared by the window dock, its clip mask, and the handoff expansion. */
export const MENU_EASE = 'power2.inOut'

/** Cross-dissolve used for the hover previews and the handoff traveler fade-in. */
export const DISSOLVE_DURATION = 0.35
export const DISSOLVE_EASE = 'power2.out'

/**
 * Ask transcript swap. The transcript panel lives in the menu overlay (z-40)
 * and can never paint above the docked frame (FRAME_Z 45), so the mask runs
 * *inside* the frame instead: an opaque cover (popover-colored, cropped by the
 * dock's own clip mask) wipes up over the window's media, from the composer's
 * edge, then the frame hides in a same-color switch to the panel waiting fully
 * drawn beneath (MenuAsk). The cover is sized to the dock's visible crop, not
 * to the frame, so its percentage wipe maps to the window at every breakpoint.
 * Both halves live in different files, so the numbers they must agree on live
 * here.
 */
export const CHAT_WIPE_DURATION = 0.34
export const CHAT_WIPE_EASE = 'power3.out'
/** Exit: the frame returns instantly (still fully covered — same color, no
 *  visible change), then the cover retracts downward, unmasking the media. */
export const CHAT_UNWIPE_DURATION = 0.2
export const CHAT_UNWIPE_EASE = 'power1.in'
/** Cover parked at the window's bottom edge: the wipe rises from the composer
 *  that was just pressed, matching the panel content's own rise. */
export const CHAT_COVER_HIDDEN = 'inset(100% 0% 0% 0%)'
export const CHAT_COVER_FULL = 'inset(0% 0% 0% 0%)'
/**
 * Panel content staging. The panel is occluded for the whole wipe, so its
 * content starts before the handoff for free: at 200ms + 300ms on a strong
 * ease-out it is ~95% drawn when the switch happens (the switch stays
 * invisible) and settles at 500ms rather than 640ms.
 */
export const CHAT_STAGE_DELAY_MS = 200
export const CHAT_STAGE_DURATION_MS = 300

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
    // The visible window in the element's own (unscaled) coordinates. Anything
    // overlaid inside the frame must be sized to this, not to the frame's full
    // viewport box, or percentage-based motion spends most of its travel in
    // masked-off area (a full-height cover inside a phone's 16:9 crop is
    // visible for barely a tenth of its wipe).
    crop,
  }
}
