import gsap from 'gsap'
import {
  clipPathInset,
  type HeroLandingPlan,
  planHeroLanding,
  runHeroLanding,
} from '@/shared/ui/hero-landing'
import type { MenuMedia } from '../getMenuContent'
import {
  CARD_RADIUS_DESKTOP,
  CARD_RADIUS_MOBILE,
  DISSOLVE_DURATION,
  DISSOLVE_EASE,
  getCardMotion,
  getViewportWidth,
  HERO_MEDIA_SELECTOR,
  MENU_EASE,
  TRAVELER_Z,
} from './motion'

/**
 * Hero handoff: clicking a menu link whose destination has hero media does not
 * undock the menu — the docked window holds the destination's media while the
 * route commits underneath, then expands from the preview slot onto the new
 * page's `[data-hero-media]` element and dissolves into it. The user visually
 * holds the media across the whole navigation.
 *
 * The traveler is a fixed, viewport-sized element carrying the media. It
 * mounts with the same uniform-scale + centered-clip math as the menu dock
 * (`getCardMotion`), expands to full screen, then lands on the hero with
 * clip-path alone — transform + clip-path only, end to end.
 *
 * Sequence (each gate has a graceful fallback — see `fail`):
 *   1. Menu content fades out; the traveler cross-dissolves in over the
 *      docked window (on desktop the hover preview already shows the same
 *      pixels, so this reads as a hold).
 *   2. The traveler expands from the slot to FULL SCREEN (uniform scale —
 *      the slot is centered, so this is pure expansion, no lateral drift).
 *      Meanwhile the route commits (`routeChanged`, signalled by the menu's
 *      pathname effect): the frozen page frame is restored behind the
 *      still-opaque overlay, and the destination's hero media is polled for.
 *   3. At full screen the overlay is fully covered (hidden with a cut, no
 *      fade needed), and the shared hero landing takes over: hold, then a
 *      clip-only collapse onto the measured hero rect, one axis per step
 *      (`@/shared/ui/hero-landing` — the same landing the work-open view
 *      transition plays).
 *   4. Once the destination's own media has painted, the traveler dissolves
 *      away over it on the landing's settle timing (this dissolve also masks
 *      the crop delta the clip-only landing leaves vs the hero's own cover
 *      render).
 */

/* Handoff motion — every tunable lives here (docs/animations.md contract). */
/** Menu content exits immediately on click — faster than it entered. */
const MENU_OUT_DURATION = 0.3
const MENU_OUT_EASE = 'power2.in'
const MENU_OUT_STAGGER = 0.015
/** Slot-to-fullscreen expansion; same ease as the dock so open and handoff rhyme. */
const FULLSCREEN_DURATION = 0.6
const FALLBACK_EASE = 'power1.out'
/** How long the destination's media gets to paint before dissolving anyway. */
const SETTLE_MEDIA_TIMEOUT_MS = 1500
/** Abandon the handoff if the route never commits (offline, error page). */
const ROUTE_TIMEOUT_MS = 5000
/** …or if the committed page never mounts a measurable hero media element. */
const HERO_MOUNT_TIMEOUT_MS = 2500
/** Fallback exit: fade the overlay + traveler out over the finished page. */
const FALLBACK_FADE = 0.4

export type HeroHandoffOptions = {
  /** The destination's hero media, as the menu already previews it. */
  media: MenuMedia
  /** The menu overlay — stays opaque until the expansion reveals the page. */
  overlay: HTMLElement
  /** The frozen page frame; the destination hero is polled inside it. */
  frame: HTMLElement
  /** Menu content elements to fade out (`[data-menu-item]`). */
  items: HTMLElement[]
  /** The preview slot the window is docked on, measured at click time. */
  slotRect: DOMRect
  desktop: boolean
  /**
   * Unfreeze the page frame (clear dock props, inert, scroll lock).
   * `navigated` tells the owner which scroll contract applies: the new
   * route's top/anchor, or the offset frozen at open (route never committed).
   * Called exactly once, at the earliest of route commit / fallback / abort.
   */
  restoreFrame: (navigated: boolean) => void
  /** Final cleanup once the traveler is gone (owner clears overlay props). */
  onDone: () => void
}

export type HeroHandoff = {
  /** The route committed — called from the menu's pathname effect. A second
   *  commit mid-flight (fast back navigation) aborts. */
  routeChanged: () => void
  /** Tear down instantly: kill tweens, drop the traveler, restore the frame. */
  abort: () => void
  readonly active: boolean
}

/** Same-origin absolute URL, so DOM `video.src` (absolute) compares equal. */
const absoluteUrl = (url: string) => new URL(url, window.location.href).href

/** Bare presentational element for a MenuMedia — shared by the menu's hover
 *  previews (index.tsx) and the handoff traveler below. */
export const createMenuMediaElement = (media: MenuMedia): HTMLImageElement | HTMLVideoElement => {
  if (media.mime.startsWith('video/')) {
    const video = document.createElement('video')
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.src = media.url
    return video
  }
  const img = document.createElement('img')
  img.decoding = 'async'
  img.src = media.url
  img.alt = ''
  return img
}

const createMediaElement = (media: MenuMedia, frame: HTMLElement) => {
  const el = createMenuMediaElement(media)
  if (el instanceof HTMLVideoElement) {
    // Resume where the docked preview's copy is playing — the user holds one
    // continuous clip, not a restart.
    const src = absoluteUrl(media.url)
    const playing = Array.from(frame.querySelectorAll('video')).find((v) => v.src === src)
    if (playing) el.currentTime = playing.currentTime
  }
  return el
}

/** Resolve once the element has real pixels to show (or after a grace timeout,
 *  scheduled by the caller). */
const onMediaReady = (el: HTMLElement, done: () => void) => {
  if (el instanceof HTMLImageElement) {
    if (el.complete && el.naturalWidth > 0) return done()
    el.addEventListener('load', done, { once: true })
    el.addEventListener('error', done, { once: true })
  } else if (el instanceof HTMLVideoElement) {
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return done()
    el.addEventListener('loadeddata', done, { once: true })
    el.addEventListener('error', done, { once: true })
  } else {
    done()
  }
}

export const startHeroHandoff = (opts: HeroHandoffOptions): HeroHandoff => {
  let finished = false
  let routeCommitted = false
  let frameRestored = false
  let travelerReady = false
  let fullscreenReached = false
  let collapseStarted = false
  let heroTarget: HTMLElement | null = null
  let rafId = 0
  const timers = new Set<number>()
  const killables: { kill: () => void }[] = []

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id)
      fn()
    }, ms)
    timers.add(id)
  }
  const track = <T extends { kill: () => void }>(t: T): T => {
    killables.push(t)
    return t
  }

  const restoreFrameOnce = () => {
    if (frameRestored) return
    frameRestored = true
    opts.restoreFrame(routeCommitted)
  }

  const finish = () => {
    if (finished) return
    finished = true
    document.documentElement.removeAttribute('data-menu-handoff')
    cancelAnimationFrame(rafId)
    for (const id of timers) window.clearTimeout(id)
    timers.clear()
    for (const t of killables) t.kill()
    traveler.remove()
    restoreFrameOnce()
    opts.onDone()
  }

  /** Graceful exit for any pre-collapse gate that can't be met: finish the
   *  navigation state (frame restored, overlay gone) without the morph. */
  const fail = () => {
    if (finished || collapseStarted) return
    collapseStarted = true
    restoreFrameOnce()
    track(
      gsap.to([traveler, opts.overlay], {
        autoAlpha: 0,
        duration: FALLBACK_FADE,
        ease: FALLBACK_EASE,
        overwrite: 'auto',
        onComplete: finish,
      }),
    )
  }

  /** The landing's settle, gated on the destination's media actually having
   *  painted — the traveler is what covers for it until then. */
  const settle = (plan: HeroLandingPlan) => {
    if (finished || !heroTarget) return
    let settled = false
    const dissolve = () => {
      if (finished || settled) return
      settled = true
      track(
        gsap.to(traveler, {
          autoAlpha: 0,
          duration: plan.settle.duration,
          ease: plan.settle.ease,
          onComplete: finish,
        }),
      )
    }
    onMediaReady(heroTarget, dissolve)
    later(dissolve, SETTLE_MEDIA_TIMEOUT_MS)
  }

  /**
   * Fullscreen → hero rect: the shared hero landing, played on the traveler.
   * The transform never moves again — only the mask closes, one axis per step
   * — and the plan handles the degenerate cases (a full-bleed hero skips an
   * axis, a hero larger than the viewport clamps to fullscreen on it and lets
   * the settle dissolve take over).
   */
  const collapse = () => {
    if (finished || collapseStarted || !heroTarget) return
    collapseStarted = true
    const vw = getViewportWidth()
    const vh = window.innerHeight
    const plan = planHeroLanding({
      // The traveler is a fixed, full-bleed box, so its own coordinates and
      // the viewport's are the same and the mask starts uncropped.
      box: { left: 0, top: 0, width: vw, height: vh },
      viewport: { width: vw, height: vh },
      target: heroTarget.getBoundingClientRect(),
      // The destination's own corner treatment is the single source of truth.
      radius: Number.parseFloat(getComputedStyle(heroTarget).borderTopLeftRadius) || 0,
    })
    track(runHeroLanding(traveler, plan, () => settle(plan)))
  }

  /** Collapse needs both gates: traveler at full screen + hero measurable. */
  const maybeCollapse = () => {
    if (fullscreenReached && heroTarget) collapse()
  }

  /** Phase 2: slot → full screen. The slot is horizontally centered, so the
   *  uniform scale-up reads as pure expansion — no diagonal travel. */
  const goFullscreen = () => {
    track(
      gsap.to(traveler, {
        scale: 1,
        x: 0,
        y: 0,
        clipPath: clipPathInset(0, 0, 0, 0, 0),
        duration: FULLSCREEN_DURATION,
        ease: MENU_EASE,
        onComplete: () => {
          if (finished) return
          fullscreenReached = true
          // The traveler covers the viewport — the overlay can vanish with a
          // cut, and the collapse below reveals the destination page instead.
          gsap.set(opts.overlay, { autoAlpha: 0 })
          maybeCollapse()
        },
      }),
    )
  }

  /**
   * Unfreeze the frame and start measuring the destination hero. Runs only
   * once BOTH the route has committed and the traveler is fully opaque —
   * restoring earlier would drop the docked frame behind the overlay while
   * the traveler is still translucent, a visible pop at the slot.
   */
  const beginMeasure = () => {
    if (finished || !routeCommitted || !travelerReady) return
    restoreFrameOnce()
    pollHero()
  }

  const pollHero = () => {
    const deadline = performance.now() + HERO_MOUNT_TIMEOUT_MS
    const step = () => {
      if (finished) return
      const el = opts.frame.querySelector<HTMLElement>(HERO_MEDIA_SELECTOR)
      const rect = el?.getBoundingClientRect()
      if (el && rect && rect.width > 0 && rect.height > 0) {
        heroTarget = el
        maybeCollapse()
        return
      }
      if (performance.now() > deadline) {
        fail()
        return
      }
      rafId = requestAnimationFrame(step)
    }
    step()
  }

  // --- Phase 1: build the traveler docked on the slot; fade the menu out. ---
  // Marks the whole flight for view-transition.css: the traveler owns every
  // visible pixel of this navigation, so any view transition that starts
  // while the attribute is present must degrade to a hard cut. The inert
  // guard alone races this — the frame unfreezes at route commit, which is
  // exactly when a transition would be captured; this attribute holds until
  // `finish`, deterministically.
  document.documentElement.setAttribute('data-menu-handoff', '')
  const traveler = document.createElement('div')
  traveler.setAttribute('data-menu-hero-traveler', '')
  traveler.setAttribute('aria-hidden', 'true')
  const dock = getCardMotion(opts.slotRect, opts.desktop ? CARD_RADIUS_DESKTOP : CARD_RADIUS_MOBILE)
  gsap.set(traveler, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: getViewportWidth(),
    height: window.innerHeight,
    zIndex: TRAVELER_Z,
    pointerEvents: 'none',
    transformOrigin: '0 0',
    scale: dock.scale,
    x: dock.x,
    y: dock.y,
    clipPath: dock.clipPath,
    autoAlpha: 0,
  })
  const mediaEl = createMediaElement(opts.media, opts.frame)
  gsap.set(mediaEl, {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  })
  traveler.appendChild(mediaEl)
  document.body.appendChild(traveler)
  if (mediaEl instanceof HTMLVideoElement) void mediaEl.play().catch(() => {})

  // The menu is no longer interactive the moment the handoff starts.
  gsap.set(opts.overlay, { pointerEvents: 'none' })
  if (opts.items.length > 0) {
    track(
      gsap.to(opts.items, {
        autoAlpha: 0,
        y: -8,
        duration: MENU_OUT_DURATION,
        ease: MENU_OUT_EASE,
        stagger: MENU_OUT_STAGGER,
        overwrite: 'auto',
      }),
    )
  }
  // On desktop the hover preview already shows these pixels — the dissolve is
  // invisible and reads as a hold; on touch it completes the preview instead.
  track(
    gsap.to(traveler, {
      autoAlpha: 1,
      duration: DISSOLVE_DURATION,
      ease: DISSOLVE_EASE,
      onComplete: () => {
        travelerReady = true
        // Fullscreen starts now — it never waits on the route; if the route
        // is slow, the traveler simply holds full screen until it lands.
        goFullscreen()
        beginMeasure()
      },
    }),
  )

  later(() => {
    if (!routeCommitted) fail()
  }, ROUTE_TIMEOUT_MS)

  return {
    routeChanged: () => {
      if (finished) return
      if (routeCommitted) {
        // A second commit mid-flight (fast back/forward) — our target page is
        // gone; hard-cut to wherever the router landed.
        finish()
        return
      }
      routeCommitted = true
      // The frame now holds the new page; unfreeze and measure as soon as the
      // traveler can cover for it.
      beginMeasure()
    },
    abort: finish,
    get active() {
      return !finished
    },
  }
}
