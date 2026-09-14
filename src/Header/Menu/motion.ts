/**
 * Shared motion primitives for the takeover-menu system: the dock geometry
 * (open/close in `index.tsx`) and the hero handoff (`heroHandoff.ts`) both
 * land a full-viewport element on a measured rect with the same uniform
 * scale + centered clip mask, so the math and the shared tunables live here
 * exactly once (docs/animations.md contract).
 */

import type { Theme } from '@/providers/Theme/types'
import { clipPathInset } from '@/shared/ui/hero-landing'
import type { MenuMedia } from '../getMenuContent'

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
 * Panel content staging. The cover is opaque and sits above the panel, so
 * nothing that happens under it is seen: the content's rise has to start on
 * the handoff frame or the user gets a blank wipe followed by a snap. It
 * starts exactly when the wipe ends and reads as the wipe continuing into
 * the panel: the transcript rises from the composer's edge while the
 * header, where the wipe just landed, fades in place. The window grows on
 * the same beat (CHAT_WINDOW_RESIZE_MS), so surface and content arrive
 * together and the press settles at 640ms.
 */
export const CHAT_STAGE_DELAY_MS = CHAT_WIPE_DURATION * 1000
export const CHAT_STAGE_DURATION_MS = 300

/**
 * Desktop window resize (Menu/PreviewSlot): the transcript grows the 16:9
 * window to the full slot on the staging beat and shrinks it back on exit.
 * The slot centers the window, so a height change moves top and bottom
 * edges together: the panel scales from the window's center both ways.
 * The exit runs it first, then returns the frame under the still-full cover
 * and retracts the cover: the entry (wipe, then grow) in reverse.
 */
export const CHAT_WINDOW_RESIZE_MS = CHAT_STAGE_DURATION_MS

/**
 * Panel exit on a phone. The frame comes back at once under the still-full
 * cover, so the transcript's top is occluded from the first frame while the
 * cover retracts (CHAT_UNWIPE_DURATION). The part of the panel below the
 * window, where it had grown into the nav's column, fades in place
 * (CHAT_PANEL_EXIT_MS); the column is released on the cover's beat
 * (CHAT_EXIT_RELEASE_MS), after the fade: the slot collapses, unseen, and
 * the nav fades back into the freed space. Content leaves, then chrome
 * returns: the entry in reverse. (Desktop shrinks the window in view
 * instead: CHAT_WINDOW_RESIZE_MS.)
 */
export const CHAT_PANEL_EXIT_MS = 150
export const CHAT_EXIT_RELEASE_MS = CHAT_UNWIPE_DURATION * 1000

/** Breakpoint where the phone stack becomes the three-column layout (Tailwind `md`). */
export const DESKTOP_MEDIA_QUERY = '(min-width: 768px)'
export const isDesktop = () => window.matchMedia(DESKTOP_MEDIA_QUERY).matches

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

/**
 * The hero media element the menu clones and the handoff lands on: the first
 * match that has a box, else the first match. A Streak Field slot renders one
 * poster per ground polarity and the theme hides the other (`display: none`,
 * zero rect), so "first match" alone could pick the hidden twin. `requireBox`
 * drops the fallback for callers that must measure (the handoff's landing).
 */
export const findHeroMediaElement = (
  root: ParentNode,
  { requireBox = false }: { requireBox?: boolean } = {},
): HTMLImageElement | HTMLVideoElement | null => {
  const matches = root.querySelectorAll<HTMLImageElement | HTMLVideoElement>(HERO_MEDIA_SELECTOR)
  for (const el of matches) {
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) return el
  }
  return requireBox ? null : (matches[0] ?? null)
}

/**
 * The ground a `MenuMedia` is shown on: its pinned polarity (a hero band's),
 * else the visitor's site theme at paint time.
 */
export const menuMediaGround = (media: Pick<MenuMedia, 'ground'>): Theme =>
  media.ground && media.ground !== 'site'
    ? media.ground
    : document.documentElement.dataset.theme === 'dark'
      ? 'dark'
      : 'light'

/**
 * The URL a `MenuMedia` paints with: a Streak Field poster carries a
 * light-ground twin and takes the one drawn for its ground; everything else
 * has one URL.
 */
export const menuMediaUrl = (media: Pick<MenuMedia, 'url' | 'lightUrl' | 'ground'>): string =>
  media.lightUrl && menuMediaGround(media) === 'light' ? media.lightUrl : media.url

/**
 * Marks a menu media element that paints its own ground (globals.css
 * "Takeover-menu media"): a poster with alpha would otherwise composite
 * over the page crop or the media it is replacing. The element carries the
 * ground's polarity as `data-theme`, so the site's own palette rules resolve
 * `--background` on it and no color is restated here.
 */
export const MENU_MEDIA_GROUND_ATTR = 'data-menu-media-ground'

/** Paint `ground` under a menu media element (see `MENU_MEDIA_GROUND_ATTR`). */
export const setMenuMediaGround = (el: HTMLElement, ground: Theme) => {
  el.setAttribute(MENU_MEDIA_GROUND_ATTR, '')
  el.dataset.theme = ground
}

/** A Streak Field poster still: one twin per ground, gated by the theme (globals.css "Visual posters"). */
const VISUAL_POSTER_ATTR = 'data-visual-poster'

/**
 * Clone the page's own hero media for the dissolve layer. Cloning (vs
 * re-rendering from data) guarantees the exact rendition already on screen:
 * images paint straight from cache, videos resume at the page's timestamp.
 *
 * A Streak Field poster needs two more things to survive the move. Its
 * theme gate (`data-visual-poster`) is dropped: the clone leaves the hero
 * band for the page frame, and a dark-ground twin cloned out of a dark band
 * would be `display: none` under a light site theme, leaving the window on
 * the page crop. And it paints the ground it was drawn on: the still has
 * alpha, and on the page the nearest palette pin (the band's `data-theme`,
 * else the document's) owns its color, so the clone carries that polarity.
 */
export const cloneHeroSource = (source: HTMLImageElement | HTMLVideoElement) => {
  const clone = source.cloneNode(true) as HTMLImageElement | HTMLVideoElement
  clone.removeAttribute('id')
  clone.removeAttribute('style')
  clone.removeAttribute('class')
  if (clone instanceof HTMLImageElement) {
    // Pin to the rendition the page already resolved so no new request fires.
    if (source instanceof HTMLImageElement && source.currentSrc) {
      clone.src = source.currentSrc
      clone.removeAttribute('srcset')
      clone.removeAttribute('sizes')
    }
    clone.loading = 'eager'
    clone.alt = ''
    if (source.hasAttribute(VISUAL_POSTER_ATTR)) {
      clone.removeAttribute(VISUAL_POSTER_ATTR)
      const pin = source.closest<HTMLElement>('[data-theme]')?.dataset.theme
      setMenuMediaGround(clone, pin === 'dark' ? 'dark' : 'light')
    }
  } else if (clone instanceof HTMLVideoElement) {
    clone.muted = true
    clone.loop = true
    clone.playsInline = true
    if (source instanceof HTMLVideoElement) clone.currentTime = source.currentTime
  }
  return clone
}

/**
 * Media readiness — the menu never dissolves *to* a hole.
 *
 * Every surface in this system replaces what the user is already looking at
 * (the page crop, the previous preview, the docked window) with a piece of
 * media. On a cold cache that media can be an element with no pixels yet, and
 * fading one in reads as the window breaking: the thing it covered vanishes,
 * nothing takes its place, then the image snaps in when it decodes. So the
 * rule is one line long — reveal only what can already paint, and until then
 * keep showing whatever is on screen.
 *
 * `isMediaReady` is the synchronous answer (used to decide, at build time,
 * whether the open timeline can own the dissolve); `onMediaReady` is the
 * asynchronous one for everything that can afford to wait.
 */
export const isMediaReady = (el: HTMLElement): boolean => {
  if (el instanceof HTMLImageElement) return el.complete && el.naturalWidth > 0
  if (el instanceof HTMLVideoElement) return el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
  // Anything else carries its own pixels (or none) — nothing to wait for.
  return true
}

/**
 * Resolve once `el` can paint. `ok` is false when it never will (decode or
 * network error) — callers use that to abandon the reveal rather than
 * dissolve to an empty box.
 *
 * Images go through `decode()`: `load` only says the bytes arrived, and the
 * decode it still owes lands as a dropped frame in the middle of the
 * cross-fade. Browsers without it (or that reject for a detached/odd case)
 * fall back to the completeness check.
 */
export const onMediaReady = (el: HTMLElement, done: (ok: boolean) => void) => {
  if (el instanceof HTMLImageElement) {
    if (typeof el.decode === 'function') {
      el.decode().then(
        () => done(true),
        () => done(isMediaReady(el)),
      )
      return
    }
    if (isMediaReady(el)) return done(true)
    el.addEventListener('load', () => done(true), { once: true })
    el.addEventListener('error', () => done(false), { once: true })
    return
  }
  if (el instanceof HTMLVideoElement) {
    if (isMediaReady(el)) return done(true)
    el.addEventListener('loadeddata', () => done(true), { once: true })
    el.addEventListener('error', () => done(false), { once: true })
    return
  }
  done(true)
}

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
  /**
   * The destination's media can paint *now*. The traveler is the only thing
   * on screen for most of the flight, so starting one around media that has
   * not arrived would expand a hole to full screen; the plain close is a
   * complete navigation and the honest fallback while the cache is cold.
   */
  mediaReady: boolean
}

/** Preconditions for starting the hero handoff on a nav click — every unmet
 *  one falls back to the plain close (see TakeoverMenu's onNavItemClick). */
export const canStartHeroHandoff = (gate: HeroHandoffGate): boolean =>
  gate.slotRect.width > 0 &&
  gate.slotRect.height > 0 &&
  !gate.reducedMotion &&
  !gate.handoffActive &&
  gate.mediaReady &&
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
