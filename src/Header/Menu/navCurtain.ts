import gsap from 'gsap'
import { rootMs } from '@/shared/lib/view-transition/root-ms'
import { suppressViewTransitions } from '@/shared/lib/view-transition/suppress'
import { HERO_MEDIA_SELECTOR, isMediaReady, onMediaReady, TRAVELER_Z } from './motion'

/**
 * Navigation curtain: the plain-close navigation (a menu link whose
 * destination has no hero to hand off to, or whose hero is still cold) keeps
 * showing the media the docked window was showing, all the way through the
 * undock, and then masks the new page in over it.
 *
 * Without it the undock reverse also reverses the open dissolve: the window's
 * media fades OUT, uncovering the page crop beneath, which is still the old
 * page until the route commits and then snaps to the new one mid-undock; the
 * new page's entrances start playing inside the still-scaling frame on top.
 * A fade that blends two different pages, then a hard cut: both off-grammar
 * (docs/route-transitions-roadmap.md §4).
 *
 * Sequence:
 *   1. Click: the held media (the window's base and any settled hover
 *      preview, in stacking order) is taken out of the open timeline's hands
 *      and pinned opaque; the undock reverse then expands it with the frame
 *      to full screen, exactly as the hero handoff's traveler does. The route
 *      commits underneath, unseen.
 *   2. Undock done (`raise`): the media moves into a fixed full-viewport
 *      curtain above the page, in the same task the frame is restored, so
 *      the switch is pixel-identical.
 *   3. Route committed and painted (`routeChanged`, then the destination's
 *      hero media decoded if it has one, else a two-frame paint cushion):
 *      the curtain lifts with the site's default reveal — the lateral
 *      top-down mask, `--vt-duration-reveal` / `--vt-ease-reveal` from
 *      `view-transition.css`, played as a CSS animation on `[data-lift]` —
 *      uncovering the new page. No fade: the two surfaces are different
 *      content.
 *
 * The platform view transition is suppressed for the whole flight (the
 * curtain owns the visible motion; see `suppressViewTransitions`). Every gate
 * has a timeout, so the page can never stay covered.
 */

/** Abandon the hold if the route never commits (offline, error page). */
const ROUTE_TIMEOUT_MS = 5000
/** How long the destination's hero media gets to paint before lifting anyway. */
const PAINT_TIMEOUT_MS = 1500
/** Belt for the CSS lift: if no animation registers, drop the curtain after
 *  the reveal's own duration plus a pad, so the page is never left covered. */
const LIFT_FALLBACK_PAD_MS = 250

export const NAV_CURTAIN_ATTR = 'data-menu-nav-curtain'
/** Chrome handed to the curtain rides just above it, still under the header. */
export const NAV_CURTAIN_CHROME_Z = TRAVELER_Z + 1
export const NAV_CURTAIN_LIFT_ATTR = 'data-lift'

/**
 * The media the docked window is showing right now, bottom to top, or `[]`
 * when nothing on screen is opaque and able to paint: a mid-dissolve stack, a
 * cold base that never decoded, or a media-less page. The hold needs one
 * fully opaque, ready element somewhere in the stack; everything ready above
 * and below it comes along so the stack stays exactly what the user sees.
 * Pending previews (bytes still in flight) are left behind.
 */
export const collectHeldMedia = (layer: HTMLElement): HTMLElement[] => {
  const stack = Array.from(layer.children).filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement &&
      (el.hasAttribute('data-menu-hero-base') || el.hasAttribute('data-menu-hover-item')) &&
      el.dataset.menuHoverPending === undefined &&
      isMediaReady(el),
  )
  const opaque = stack.some((el) => Number(gsap.getProperty(el, 'opacity')) >= 1)
  return opaque ? stack : []
}

export type NavCurtainOptions = {
  /** The held media, in stacking order (see `collectHeldMedia`). */
  media: HTMLElement[]
  /** The page frame; the destination's hero media is polled inside it. */
  frame: HTMLElement
  /**
   * Persistent chrome to keep above the curtain (the footer bar: it sits
   * under the traveler layer and would vanish at raise and pop back at the
   * lift's end; the header already clears it). Lifted for the curtain's
   * life, cleared with it.
   */
  chrome?: HTMLElement[]
  /** Final cleanup once the curtain is gone. */
  onDone: () => void
}

export type NavCurtain = {
  /** The route committed — called from the menu's pathname effect. */
  routeChanged: () => void
  /**
   * The undock reverse finished: move the media out of the frame into the
   * curtain. Call in the same task as the frame restore, after it: the
   * restore drops the layer (and its chrome z-index), and nothing paints
   * before the media is re-homed here.
   */
  raise: () => void
  /** Tear down instantly: drop the curtain, release the platform transition. */
  abort: () => void
  readonly active: boolean
}

export const startNavCurtain = (opts: NavCurtainOptions): NavCurtain => {
  const releaseViewTransitions = suppressViewTransitions()
  let finished = false
  let routeCommitted = false
  let raised = false
  let lifting = false
  let curtain: HTMLElement | null = null
  let rafId = 0
  const timers = new Set<number>()

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id)
      fn()
    }, ms)
    timers.add(id)
  }

  // Pin the stack opaque and take it away from every tween that could move
  // it: the open timeline's base dissolve (whose reverse is the fade this
  // curtain exists to prevent), the late-base reveal, a hover fade.
  gsap.killTweensOf(opts.media)
  gsap.set(opts.media, { autoAlpha: 1 })

  const finish = () => {
    if (finished) return
    finished = true
    releaseViewTransitions()
    cancelAnimationFrame(rafId)
    for (const id of timers) window.clearTimeout(id)
    timers.clear()
    curtain?.remove()
    curtain = null
    if (opts.chrome?.length) gsap.set(opts.chrome, { clearProps: 'zIndex' })
    opts.onDone()
  }

  /** The new page has painted beneath: mask it in. */
  const lift = () => {
    if (finished || lifting || !curtain) return
    lifting = true
    curtain.setAttribute(NAV_CURTAIN_LIFT_ATTR, '')
    const animations = curtain.getAnimations?.() ?? []
    if (animations.length === 0) {
      // Reduced motion, or no CSS animation support: instant.
      finish()
      return
    }
    void Promise.allSettled(animations.map((a) => a.finished)).then(finish)
    later(
      finish,
      rootMs(getComputedStyle(document.documentElement), '--vt-duration-reveal') +
        LIFT_FALLBACK_PAD_MS,
    )
  }

  /**
   * Lift only once the destination can be seen whole: its hero media decoded
   * when it mounts one (a cold hero would otherwise be uncovered as a hole),
   * else after the page has had two frames to paint.
   */
  const liftWhenPainted = () => {
    if (finished || lifting) return
    const hero = opts.frame.querySelector<HTMLElement>(HERO_MEDIA_SELECTOR)
    if (hero && !isMediaReady(hero)) {
      onMediaReady(hero, lift)
      later(lift, PAINT_TIMEOUT_MS)
      return
    }
    rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(lift)
    })
  }

  const maybeLift = () => {
    if (raised && routeCommitted) liftWhenPainted()
  }

  later(() => {
    // The route never committed: uncover whatever the router left, rather
    // than holding the media forever. If the undock is somehow still running
    // the frame restore will raise and lift on its own.
    routeCommitted = true
    maybeLift()
  }, ROUTE_TIMEOUT_MS)

  return {
    routeChanged: () => {
      if (finished || routeCommitted) return
      routeCommitted = true
      maybeLift()
    },
    raise: () => {
      if (finished || raised) return
      raised = true
      curtain = document.createElement('div')
      curtain.setAttribute(NAV_CURTAIN_ATTR, '')
      curtain.setAttribute('aria-hidden', 'true')
      gsap.set(curtain, {
        position: 'fixed',
        inset: 0,
        zIndex: TRAVELER_Z,
        pointerEvents: 'none',
        overflow: 'hidden',
        // Explicit start for the lift keyframe.
        clipPath: 'inset(0)',
      })
      // The media keeps its layer styles (absolute, full box, cover), so the
      // pixels are identical before and after the move.
      curtain.append(...opts.media)
      document.body.appendChild(curtain)
      for (const el of opts.media) {
        if (el instanceof HTMLVideoElement) void el.play().catch(() => {})
      }
      if (opts.chrome?.length) gsap.set(opts.chrome, { zIndex: NAV_CURTAIN_CHROME_Z })
      maybeLift()
    },
    abort: finish,
    get active() {
      return !finished
    },
  }
}
