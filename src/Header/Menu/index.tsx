'use client'

import { useGSAP } from '@gsap/react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import type { ChatTransport, UIMessage } from 'ai'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CMSLink } from '@/components/Link'
import { resolveCmsLinkHref } from '@/components/Link/resolve-href'
import { Button } from '@/components/ui/button'
import { Clock } from '@/Footer/Clock'
import { MenuAsk } from '@/features/ask/MenuAsk'
import { cursorTarget } from '@/features/cursor'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Header as HeaderType } from '@/payload-types'
import { suppressViewTransitions } from '@/shared/lib/view-transition/suppress'
import { cn } from '@/utilities/ui'
import type { MenuContent, MenuLink, MenuMedia } from '../getMenuContent'
import { focusForKeyboard, trackInputModality } from './focus'
import { createMenuMediaElement, type HeroHandoff, startHeroHandoff } from './heroHandoff'
import {
  CARD_RADIUS_DESKTOP,
  CARD_RADIUS_MOBILE,
  CHAT_COVER_FULL,
  CHAT_COVER_HIDDEN,
  CHAT_EXIT_RELEASE_MS,
  CHAT_UNWIPE_DURATION,
  CHAT_UNWIPE_EASE,
  CHAT_WIPE_DURATION,
  CHAT_WIPE_EASE,
  canStartHeroHandoff,
  DESKTOP_CARD_SHADOW,
  DISSOLVE_DURATION,
  DISSOLVE_EASE,
  FRAME_Z,
  getCardMotion,
  getViewportWidth,
  HERO_MEDIA_SELECTOR,
  isInAppNavClick,
  isMediaReady,
  MENU_EASE,
  MOBILE_CARD_SHADOW,
  onMediaReady,
} from './motion'
import { MenuPreviewSlot } from './PreviewSlot'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * The takeover menu animates the element carrying this attribute — the
 * page-frame wrapper in (frontend)/layout.tsx — into a preview window that
 * docks onto the menu's center slot (`[data-menu-preview-slot]`, rendered by
 * MenuAsk). Scale + clip-path run together (transform only — page layout stays
 * intact), with a slight timing offset so the crop lags the shrink and reads
 * as a parallax window sliding over the page.
 *
 * Geometry is measured, not computed: the slot's DOMRect is the single source
 * of truth for where the window lands, so CSS owns the layout at every width.
 */
const PAGE_FRAME_SELECTOR = '[data-page-frame]'
const SITE_FOOTER_SELECTOR = '[data-site-footer]'
const PREVIEW_SLOT_SELECTOR = '[data-menu-preview-slot]'
/**
 * On open, the first img/video inside the hero's `data-hero-media` region
 * (HERO_MEDIA_SELECTOR — see ./motion) is cloned into a dissolve layer
 * injected INTO the page frame, so the window's scale + clip mask crop it
 * exactly like the page — the cross-fade can never paint outside the
 * animating mask. The docking window dissolves from page to media; the
 * settled menu shows only the current page's media. Pages without hero media
 * keep the scaled page view.
 *
 * The layer itself is always visible and always empty-safe: it is a
 * transparent, mask-cropped box, and what fades is whatever it holds (the
 * base clone, the hover previews stacked above it, the chat cover). That is
 * what lets a cold cache degrade cleanly — a piece of media that cannot paint
 * yet simply stays at zero opacity, and the page crop underneath keeps the
 * window honest until it can.
 */
const HERO_LAYER_SELECTOR = '[data-menu-hero-media]'
/** The current page's own media inside the layer — the hover-preview resting state. */
const HERO_BASE_SELECTOR = '[data-menu-hero-base]'
/** Hover-preview elements stacked above the base inside the layer. */
const HOVER_ITEM_SELECTOR = '[data-menu-hover-item]'

/* Menu motion — every open/close tunable lives here; shared primitives (ease,
   dissolve, geometry) in ./motion, handoff tunables in ./heroHandoff
   (docs/animations.md contract). */
const FRAME_DURATION = 0.8
/** Clip mask trails the shrink slightly so the crop reads as a sliding window. */
const CLIP_LAG = 0.1
const OVERLAY_FADE_DURATION = 0.4
/** Content staggers in, in DOM order, once the window is halfway docked. */
const ITEMS_START = FRAME_DURATION / 2
const ITEM_DURATION = 0.45
const ITEM_STAGGER = 0.03
const ITEM_EASE = 'power2.out'
/** Footer bar fade-out: leaves immediately, independent of the window dock. */
const FOOTER_FADE_DURATION = 0.35
/**
 * The footer sits at z-30, under the frozen frame (FRAME_Z) and the overlay
 * (z-40), so its fade ran fully occluded on both ends of the dock and the bar
 * popped in when the undock released the frame. Lifted above both for the
 * timeline's life; `clearFrameProps` drops it with the fade. It never meets
 * the hero traveler (TRAVELER_Z, the same value): the handoff calls
 * `restoreFrame` at route commit, before the footer can be visible again.
 */
const FOOTER_TIMELINE_Z = FRAME_Z + 1
/** Page window dissolves into the page's hero media across the dock's back
 *  half, finishing exactly when the trailing clip mask settles. */
const HERO_DISSOLVE_START = ITEMS_START
const HERO_DISSOLVE_END = CLIP_LAG + FRAME_DURATION
const HERO_DISSOLVE_EASE = 'power1.inOut'
/** Grace before dissolving back to base — lets the pointer travel between
 *  adjacent links without flashing the resting state. */
const HOVER_CLEAR_DELAY_MS = 80

/** Breakpoint where the phone stack becomes the three-column layout. */
const DESKTOP_MEDIA_QUERY = '(min-width: 768px)'

/* Phone sub-views. Below `md` the editorial columns are hidden, so the primary
   nav carries a drill-in row per column (Expertise, Who We Help) whose list
   swaps in over the nav. A sub-view's items still carry `data-menu-item`: the
   hero handoff fades every visible item, and the open timeline cycles their
   inline state so nothing is stranded at zero. They hold no slot in the open
   cascade, though (see `buildTimeline`). */
type SubView = 'expertise' | 'audiences'
const SUB_VIEW_SELECTOR = '[data-menu-subview]'
const subViewId = (view: SubView) => `site-menu-${view}`

/**
 * Nav row type: 16px light with wide tracking (18px from `md`). Below `md`
 * the `::before` box grows each row's touch target to the list's 40px pitch
 * (the row's 24px line box + the 16px gap) without touching the rhythm, the
 * boxes meeting edge to edge; 40 is the compromise between Apple's 44pt and
 * a six-row list that has to share a phone with the window and the CTA. It
 * needs the control's own box to be its line: a button already is, and a
 * link gets `inline-block` for it (an inline anchor's box is the font's
 * content area, which would overrun the next row). The sub-view's 14px
 * links stand 19px tall, so their box grows by 10px a side and leaves a 1px
 * seam instead of overrunning.
 */
/**
 * Keyboard focus on a row: the header control's ring recipe (2px ring, 4px
 * off the text box) in place of the UA outline, which hugs the inline-flex
 * box and its chevron in an odd notched shape. Box-shadow, so `menu-row`
 * and `pressable` keep owning the transition list; the ring just appears.
 */
const ROW_FOCUS =
  'rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background'
const NAV_ROW = cn(
  'font-heading text-base/none font-light tracking-widest text-foreground transition-colors hover:text-primary md:text-lg/none',
  ROW_FOCUS,
)
const TOUCH_ROW = 'max-md:relative max-md:before:absolute max-md:before:inset-x-0'
const TOUCH_ROW_HIT = cn(TOUCH_ROW, 'max-md:before:-inset-y-3')
/** The nav's links: a button row's box is already its line, a link's needs `inline-block`. */
const NAV_LINK = cn(NAV_ROW, TOUCH_ROW_HIT, 'max-md:inline-block')
/** Sub-view links: one step down from the nav rows, as the desktop columns are. */
const SUB_VIEW_LINK = cn(
  'text-sm/snug text-foreground transition-colors hover:text-primary max-md:inline-block',
  ROW_FOCUS,
  TOUCH_ROW,
  'max-md:before:-inset-y-2.5',
)

/**
 * A scroll container clips at its padding edge, and `overflow-y: auto` makes
 * `overflow-x` clip too, so a row sitting on the column's edge loses the
 * outside half of its focus ring. Every scrolling column trades 8px of
 * margin for the same padding (ROW_FOCUS reaches 6px past the box): the
 * rows keep their place and the ring has room on all sides.
 */
const SCROLL_RING_ROOM = '-m-2 p-2'

/**
 * Sub-view stage (phone): the nav and its sub-views share one cell that is
 * the column's whole height, so a swap never changes the layout around it;
 * each panel scrolls on its own and sits its content at the bottom (thumb
 * zone, like the nav). From `md` both wrappers dissolve (`contents`) and the
 * nav list is the column's direct child again, exactly as before. A hidden
 * panel is `inert`, which takes it out of the tab order and the
 * accessibility tree at once (`visibility` would still read hidden on the
 * first frame of its own transition and refuse the focus move into the
 * arriving panel).
 */
const SUB_VIEW_STAGE =
  'max-md:grid max-md:min-h-0 max-md:flex-1 max-md:*:col-start-1 max-md:*:row-start-1 md:contents'
const SUB_VIEW_SCROLL = cn(
  'no-scrollbar max-md:flex max-md:min-h-0 max-md:flex-col max-md:overflow-y-auto max-md:overscroll-contain',
  SCROLL_RING_ROOM,
)

/**
 * Sub-view swap, row by row. Forward: the nav's rows clear to the left,
 * quick and close together, and the sub-view's rows follow from the right on
 * a longer settle, each a beat after the last, its title row first; back is
 * the same choreography run the other way, so the space stays consistent.
 * 12px of travel, not a push: both panels are the same kind of list, and a
 * heavy slide would only add distance. Exits are shorter than entries, and
 * the incoming rows wait out most of the outgoing ones so the two lists
 * never read as one crowd.
 *
 * Motion sits on each row's control, never on its `data-menu-item` wrapper:
 * the open cascade owns that one's inline opacity (see `chatHideable`). The
 * wrapper carries the row's timing as custom properties for the control's
 * `menu-row` utility (globals.css) to read, so the destination state, enter
 * or exit, brings its own duration and delay. The same utility gives the row
 * its press feedback (the site's press tokens, plus the hover color) on the
 * control itself: the hitbox pseudo paints above the label, so a press lands
 * on the control and nothing inside it. Reduced motion is the utility's.
 */
const SUB_VIEW_ENTER_MS = 250
const SUB_VIEW_ENTER_STAGGER_MS = 25
/** Lead before the first incoming row, while the outgoing rows clear. */
const SUB_VIEW_ENTER_DELAY_MS = 60
const SUB_VIEW_EXIT_MS = 150
const SUB_VIEW_EXIT_STAGGER_MS = 12
const SUB_VIEW_ROW = 'max-md:menu-row'
const subViewRowHidden = (offstage: 'start' | 'end') =>
  cn(
    'max-md:opacity-0',
    offstage === 'start' ? 'max-md:motion-safe:-translate-x-3' : 'max-md:motion-safe:translate-x-3',
  )
const subViewRowTiming = (index: number, visible: boolean): React.CSSProperties =>
  ({
    '--menu-row-duration': `${visible ? SUB_VIEW_ENTER_MS : SUB_VIEW_EXIT_MS}ms`,
    '--menu-row-delay': `${
      visible
        ? SUB_VIEW_ENTER_DELAY_MS + index * SUB_VIEW_ENTER_STAGGER_MS
        : index * SUB_VIEW_EXIT_STAGGER_MS
    }ms`,
  }) as React.CSSProperties

/** Chat swap — see the CHAT_* block in ./motion for the mask's full contract. */
const CHAT_COVER_SELECTOR = '[data-menu-chat-cover]'

const getPageFrame = () => document.querySelector<HTMLElement>(PAGE_FRAME_SELECTOR)
const getSiteFooter = () => document.querySelector<HTMLElement>(SITE_FOOTER_SELECTOR)

const clearFrameProps = (frame: HTMLElement) => {
  frame.querySelector(HERO_LAYER_SELECTOR)?.remove()
  // The chat-view swap may still be tweening the frame's opacity.
  gsap.killTweensOf(frame)
  gsap.set(frame, { clearProps: 'all' })
  const footer = getSiteFooter()
  if (footer) gsap.set(footer, { clearProps: 'opacity,visibility,zIndex' })
}

/**
 * Inject the dissolve layer into the page frame: a viewport-box overlay
 * holding a clone of the current page's hero media. Living inside the frame
 * means the dock's scale + clip mask crop it exactly like the page, so the
 * cross-fade stays inside the animating window. Cloning (vs re-rendering from
 * data) guarantees the exact rendition already on screen — images paint
 * straight from cache, videos resume at the page's timestamp.
 * The layer mounts even on pages without hero media — the hover previews
 * (showHoverMedia) stack inside it and need the same mask-cropped home; an
 * empty layer paints nothing, so the settled menu keeps the scaled page view.
 */
const mountHeroMedia = (frame: HTMLElement, scrollTop: number) => {
  frame.querySelector(HERO_LAYER_SELECTOR)?.remove()

  const layer = document.createElement('div')
  layer.setAttribute('data-menu-hero-media', '')
  layer.setAttribute('aria-hidden', 'true')
  // Inline styles (not utility classes) — runtime-assigned classes are
  // invisible to the Tailwind build. The frame freezes with its scroll
  // position restored, so the layer offsets to the visible box: it fills
  // exactly what the mask reveals, at any resize (height tracks the frame).
  gsap.set(layer, {
    position: 'absolute',
    top: scrollTop,
    left: 0,
    width: '100%',
    height: '100%',
    // Above any in-page stacking; the frame's transform scopes this context.
    zIndex: 100,
    pointerEvents: 'none',
  })

  const source = frame.querySelector<HTMLImageElement | HTMLVideoElement>(HERO_MEDIA_SELECTOR)
  if (source) {
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
    } else if (clone instanceof HTMLVideoElement) {
      clone.muted = true
      clone.loop = true
      clone.playsInline = true
      if (source instanceof HTMLVideoElement) clone.currentTime = source.currentTime
    }
    clone.setAttribute('data-menu-hero-base', '')
    gsap.set(clone, {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      // The dissolve raises this, not the layer — see the layer's note above.
      autoAlpha: 0,
    })
    layer.appendChild(clone)
  }

  frame.appendChild(layer)
  const video = layer.querySelector('video')
  if (video) void video.play().catch(() => {})
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Fit the chat cover to the docked window's visible box, in the frame's own
 * unscaled coordinates (the hero layer is already offset to that box, so these
 * are layer-local). Without a measured dock — detached render, unusable slot —
 * fall back to filling the layer.
 */
const setCoverBox = (cover: HTMLElement, motion: ReturnType<typeof getCardMotion> | null) => {
  if (!motion) {
    gsap.set(cover, { top: 0, left: 0, width: '100%', height: '100%' })
    return
  }
  const { insetT, insetL, clipW, clipH } = motion.crop
  gsap.set(cover, { top: insetT, left: insetL, width: clipW, height: clipH })
}

/**
 * Base open timeline for the non-animating paths (reduced motion, detached
 * render): instant overlay crossfade only. Overlay start values are explicit
 * (fromTo, never to/set): the timeline is rebuilt while OPEN on
 * resize/breakpoint change, and a `.to` initialized at progress(1) would
 * record the open state as its start — reversing it could then never restore
 * closed.
 */
const overlayFadeTimeline = (overlay: HTMLElement) =>
  gsap
    .timeline({ paused: true, defaults: { duration: 0.2, ease: 'none' } })
    .set(overlay, { pointerEvents: 'auto' })
    .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)

/**
 * Hover preview: dissolve the docked window's media to `media`, or back to
 * the resting state (the page's own hero / the scaled page view) on `null`.
 * The incoming element fades in above the stack and drops what it covers on
 * complete — outgoing media never fades under it, so the base can't ghost
 * through mid-dissolve. Reduced motion snaps.
 *
 * Nothing is revealed before it can paint. A preview whose bytes are still in
 * flight waits, invisible, at the top of the stack while the window keeps
 * showing what it was showing — the honest answer to "not loaded yet", and
 * the only one that never flashes a hole. If the pointer moves on first, the
 * waiting element is dropped where it stands, so a slow image can never
 * surface after the intent that asked for it is gone.
 */
const showHoverMedia = (media: MenuMedia | null) => {
  const layer = getPageFrame()?.querySelector<HTMLElement>(HERO_LAYER_SELECTOR)
  if (!layer) return
  const duration = prefersReducedMotion() ? 0 : DISSOLVE_DURATION
  const stack = Array.from(layer.querySelectorAll<HTMLElement>(HOVER_ITEM_SELECTOR))
  for (const el of stack) {
    if (el.dataset.menuHoverPending !== undefined) el.remove()
  }
  // Everything still on screen: what the incoming preview has to cover before
  // any of it may be dropped.
  const previous = stack.filter((el) => el.isConnected)

  if (!media) {
    for (const el of previous) {
      gsap.to(el, {
        autoAlpha: 0,
        duration,
        ease: DISSOLVE_EASE,
        overwrite: 'auto',
        onComplete: () => el.remove(),
      })
    }
    return
  }

  // Top of the stack is already this target — steer it (back) to visible
  // instead of stacking a duplicate; overwrite kills any in-flight fade-out
  // before its remove fires.
  const last = previous.at(-1)
  if (last?.dataset.menuHoverItem === media.url) {
    gsap.to(last, {
      autoAlpha: 1,
      duration,
      ease: DISSOLVE_EASE,
      overwrite: 'auto',
      onComplete: () => {
        for (const p of previous) {
          if (p !== last) p.remove()
        }
      },
    })
    return
  }

  const el = createMenuMediaElement(media)
  el.setAttribute('data-menu-hover-item', media.url)
  el.dataset.menuHoverPending = ''
  gsap.set(el, {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    autoAlpha: 0,
  })
  layer.appendChild(el)
  if (el instanceof HTMLVideoElement) void el.play().catch(() => {})
  onMediaReady(el, (ok) => {
    // Dropped while it loaded (pointer moved on, menu closed), or it will
    // never paint at all — either way the window keeps what it already has.
    if (!el.isConnected) return
    if (!ok) {
      el.remove()
      return
    }
    delete el.dataset.menuHoverPending
    gsap.to(el, {
      autoAlpha: 1,
      duration,
      ease: DISSOLVE_EASE,
      overwrite: 'auto',
      // Fully covered now — drop the outgoing stack beneath.
      onComplete: () => {
        for (const p of previous) p.remove()
      },
    })
  })
}

type NavItemLink = NonNullable<HeaderType['navItems']>[number]['link']

/** Mirror of CMSLink's href resolution — hover-preview lookup only. */
const navItemHref = (link: NavItemLink): string | null => resolveCmsLinkHref(link)

type TakeoverMenuProps = {
  data: HeaderType
  menuContent: MenuContent
  open: boolean
  onClose: () => void
  /** Focus returns here when the menu closes. */
  menuButtonRef: React.RefObject<HTMLButtonElement | null>
  /**
   * Site Info › Ask › Hide Ask: the composer and transcript leave the menu.
   * The preview slot stays, since the docked page frame lands on it.
   */
  askHidden?: boolean
  /** Ask transport override — stories/tests script the chat without /api/ask. */
  askTransport?: ChatTransport<UIMessage>
  askInitialMessages?: UIMessage[]
}

export const TakeoverMenu: React.FC<TakeoverMenuProps> = ({
  data,
  menuContent,
  open,
  onClose,
  menuButtonRef,
  askHidden = false,
  askTransport,
  askInitialMessages,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  // Chat-view tracking for layered dismissal: while the transcript is up,
  // Escape / backdrop clicks step back to the preview (via the exit action
  // MenuAsk registers); only the next dismissal closes the menu itself.
  // Refs, not state — MenuAsk owns the view swap and its transitions.
  const chatViewRef = useRef(false)
  const exitChatViewRef = useRef<(() => void) | null>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const rebuildTimelineRef = useRef<(() => gsap.core.Timeline) | null>(null)
  /** Last measured dock geometry — the chat cover sizes itself to its crop. */
  const cardMotionRef = useRef<ReturnType<typeof getCardMotion> | null>(null)
  const scrollYRef = useRef(0)
  const openRef = useRef(open)
  const navItems = data?.navItems || []
  const { expertise, audiences, works, pageMedia } = menuContent
  // CTA from the Header global; the original hardcoded button is the fallback
  // until an editor fills the field.
  const cta = data?.cta?.link
  const ctaHref = (cta && resolveCmsLinkHref(cta)) || '/contact'
  const ctaLabel = data?.cta?.label || 'Get in touch'
  // In-app CTA clicks are intercepted by onNavItemClick (untagged push under
  // the close/handoff), so no transitionTypes here — only new-tab needs props.
  const ctaLinkProps = cta?.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /**
   * A close has two exits with opposite scroll contracts. Dismissal (Escape,
   * backdrop, CLOSE button) returns to the same page, so the undock restores
   * the scroll position frozen at open. Navigation must NOT — restoring would
   * stamp the old page's offset onto the new route, overriding LenisRouteReset
   * (the undock reverse outlives the route commit, so this cleanup runs last).
   */
  const pendingNavRef = useRef(false)
  /** In-flight hero handoff (see ./heroHandoff) — owns the exit while active. */
  const handoffRef = useRef<HeroHandoff | null>(null)
  /**
   * Held while the plain undock close carries a navigation. React starts a
   * view transition on every route commit whatever the tagging says, and its
   * capture suspends rendering (and rAF) for as long as React holds the
   * update callback — up to 500ms on the incoming page's images — which
   * stalls the undock reverse mid-flight and snaps it forward. The handoff
   * holds its own token; see `suppressViewTransitions`.
   */
  const releaseViewTransitionsRef = useRef<(() => void) | null>(null)
  const pathname = usePathname()
  const lastPathnameRef = useRef(pathname)
  const router = useRouter()
  const hoverClearTimer = useRef(0)

  /** Unfreeze the frozen page frame. `navigated`: land on the new route's
   *  top/anchor; otherwise restore the offset frozen at open. */
  const restoreFrame = useCallback((navigated: boolean) => {
    // The undock is over by the time this runs on the plain-close path, so the
    // route swap can go back to being a normal view transition. (The handoff
    // calls this at route commit and keeps its own token until its traveler
    // is gone — it never sets this one.)
    releaseViewTransitionsRef.current?.()
    releaseViewTransitionsRef.current = null
    const frame = getPageFrame()
    if (!frame) return
    frame.removeAttribute('inert')
    clearFrameProps(frame)
    document.documentElement.style.overflow = ''
    if (navigated) {
      const anchor = window.location.hash
        ? document.getElementById(window.location.hash.slice(1))
        : null
      if (anchor) anchor.scrollIntoView()
      else window.scrollTo(0, 0)
    } else {
      window.scrollTo(0, scrollYRef.current)
    }
    // Anything that measured the page while the frame was frozen read a
    // fixed, scaled frame over a document collapsed to one viewport (scrollY
    // 0). A route that commits mid-dock mounts its scroll-driven effects in
    // exactly that state, so their start/end positions are scaled down and
    // the trigger sits past its end once the real page scrolls (the featured
    // work roll pinned on its last item). The frame is back in flow and the
    // scroll offset is final here, so re-measure once.
    ScrollTrigger.refresh()
  }, [])

  /** URLs the warm pass has decoded — see `warmMedia` below. */
  const warmedRef = useRef<Set<string>>(new Set())

  /**
   * Can this media paint the instant the handoff asks for it? Either the warm
   * pass decoded it, or a preview in the docked window is already holding
   * those exact pixels — the desktop path, where the pointer has been sitting
   * on the link that previews them. Anything else is cold, and the handoff
   * stands aside for the plain close rather than expanding an empty box to
   * full screen.
   */
  const isMenuMediaReady = useCallback((media: MenuMedia) => {
    if (warmedRef.current.has(media.url)) return true
    const layer = getPageFrame()?.querySelector<HTMLElement>(HERO_LAYER_SELECTOR)
    if (!layer) return false
    for (const el of layer.querySelectorAll<HTMLElement>(HOVER_ITEM_SELECTOR)) {
      if (el.dataset.menuHoverItem === media.url && isMediaReady(el)) return true
    }
    return false
  }, [])

  /**
   * Late base media (cold cache). The open timeline only owns a dissolve it
   * can play in both directions, so a clone with no pixels at build time was
   * left out of it and the window opened on the page crop — correct, and the
   * only honest thing to show. Bring the media in the moment it can paint, on
   * the hover-preview beat so it reads as the window settling rather than a
   * pop, and record that this opacity is ours and not the timeline's: the
   * close has to take it back out by hand.
   */
  const lateBaseRef = useRef(false)
  const revealLateHeroBase = useCallback(() => {
    const base = getPageFrame()?.querySelector<HTMLElement>(
      `${HERO_LAYER_SELECTOR} ${HERO_BASE_SELECTOR}`,
    )
    if (!base || isMediaReady(base)) return
    lateBaseRef.current = true
    onMediaReady(base, (ok) => {
      // Closed, or reopened onto a fresh layer, while it loaded — the resting
      // state is no longer ours to change.
      if (!ok || !openRef.current || !base.isConnected) return
      gsap.to(base, {
        autoAlpha: 1,
        duration: prefersReducedMotion() ? 0 : DISSOLVE_DURATION,
        ease: HERO_DISSOLVE_EASE,
        overwrite: 'auto',
      })
    })
  }, [])

  /**
   * Same-tab in-app link → this close is a navigation. When the destination
   * has hero media and the menu is fully open, the click starts the hero
   * handoff instead of the undock: the docked window holds the media and
   * expands to FULL SCREEN while the route pushes underneath, then collapses
   * clip-only onto the new page's hero — one axis at a time, never
   * diagonally. Every unmet precondition (no hero media, reduced motion,
   * mid-open click, …) falls back to the plain close, where the undock
   * reverse owns all visible motion (the frame scales back up already holding
   * the new route).
   *
   * Both pushes stay untagged AND suppress the platform view transition. The
   * tagging keeps `DirectionalTransition` silent, but it does not stop React
   * from starting a transition — the template remount always does — and a
   * started transition both freezes the GSAP motion during its capture and
   * paints snapshots at undocked geometry over the live menu (snapshots
   * ignore the dock's transform). Only removing the API for the flight covers
   * both; see `suppressViewTransitions`.
   */
  const onNavItemClick = useCallback(
    (media: MenuMedia | null) => (event: React.MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a')
      if (!isInAppNavClick(anchor, event)) {
        onClose()
        return
      }
      pendingNavRef.current = true

      const frame = getPageFrame()
      const overlay = overlayRef.current
      const slotRect = overlay
        ?.querySelector<HTMLElement>(PREVIEW_SLOT_SELECTOR)
        ?.getBoundingClientRect()
      const canHandoff =
        media &&
        frame &&
        overlay &&
        slotRect &&
        canStartHeroHandoff({
          slotRect,
          reducedMotion: prefersReducedMotion(),
          handoffActive: !!handoffRef.current?.active,
          timelineProgress: tlRef.current?.progress(),
          destinationPathname: anchor.pathname,
          currentPathname: window.location.pathname,
          mediaReady: isMenuMediaReady(media),
        })
      if (!canHandoff) {
        event.preventDefault()
        // The undock reverse owns every visible pixel of this navigation, so
        // the platform must not run a transition under it (released in
        // `restoreFrame`, at the end of the reverse).
        releaseViewTransitionsRef.current?.()
        releaseViewTransitionsRef.current = suppressViewTransitions()
        router.push(anchor.pathname + anchor.search + anchor.hash)
        onClose()
        return
      }

      event.preventDefault()
      window.clearTimeout(hoverClearTimer.current)
      // The handoff replaces both the open timeline's end state and its
      // reverse — freeze it so nothing else mutates the overlay or frame.
      tlRef.current?.kill()
      handoffRef.current = startHeroHandoff({
        media,
        overlay,
        frame,
        items: gsap.utils.toArray<HTMLElement>('[data-menu-item]', overlay),
        slotRect,
        desktop: window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
        restoreFrame,
        onDone: () => {
          handoffRef.current = null
          const ov = overlayRef.current
          if (ov) gsap.set(ov, { clearProps: 'all' })
          // Fresh paused timeline so the next open records pristine start values.
          rebuildTimelineRef.current?.()
        },
      })
      // Untagged push, with the platform transition suppressed for the whole
      // flight by `startHeroHandoff` — the traveler owns all visible motion.
      router.push(anchor.pathname + anchor.search + anchor.hash)
      onClose()
    },
    [onClose, restoreFrame, router, isMenuMediaReady],
  )

  // Route committed while the frame is still frozen (menu open or mid-undock):
  // it now holds the NEW page. During a hero handoff that commit is the signal
  // to unfreeze and measure; otherwise re-pin the frame to the top so the
  // undock reveals the new page from its start, and zero the restore target so
  // the cleanup's scroll restore agrees with LenisRouteReset.
  useEffect(() => {
    if (pathname === lastPathnameRef.current) return
    lastPathnameRef.current = pathname
    if (handoffRef.current?.active) {
      handoffRef.current.routeChanged()
      return
    }
    const frame = getPageFrame()
    if (!frame?.hasAttribute('inert')) return
    scrollYRef.current = 0
    frame.scrollTop = 0
    const heroLayer = frame.querySelector<HTMLElement>(HERO_LAYER_SELECTOR)
    if (heroLayer) gsap.set(heroLayer, { top: 0 })
  }, [pathname])

  // Hover preview wiring: entering a link dissolves the docked window to that
  // page's hero media; leaving all links dissolves back after a short grace.
  const hoverHandlers = useCallback(
    (media: MenuMedia | null) => ({
      onPointerEnter: (event: React.PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        window.clearTimeout(hoverClearTimer.current)
        showHoverMedia(media)
      },
      onPointerLeave: (event: React.PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        window.clearTimeout(hoverClearTimer.current)
        hoverClearTimer.current = window.setTimeout(
          () => showHoverMedia(null),
          HOVER_CLEAR_DELAY_MS,
        )
      },
    }),
    [],
  )

  /** Click + hover wiring for a menu item, keyed to one media source. */
  const itemHandlers = useCallback(
    (media: MenuMedia | null) => ({
      onClickCapture: onNavItemClick(media),
      ...hoverHandlers(media),
    }),
    [onNavItemClick, hoverHandlers],
  )

  const hoverMediaList = useMemo(() => {
    const byUrl = new Map<string, MenuMedia>()
    for (const item of [...expertise, ...audiences, ...works]) {
      if (item.media) byUrl.set(item.media.url, item.media)
    }
    for (const media of Object.values(pageMedia)) byUrl.set(media.url, media)
    return [...byUrl.values()]
  }, [expertise, audiences, works, pageMedia])

  /**
   * Cache warming. Every surface below refuses to reveal media it cannot
   * paint, so the way to make the menu feel instant is not to animate around
   * a cold cache — it is not to have one. The pass runs on the first *intent*
   * signal from the menu button (hover, focus, or the pointerdown that
   * precedes a tap) and, failing that, on the first open, which buys it the
   * whole open animation as head start.
   *
   * `warmedRef` records what actually finished decoding — the synchronous
   * answer the hero handoff needs at click time (`isMenuMediaReady`). Videos
   * are never warmed: pulling whole clips down ahead of an intent nobody has
   * expressed is the speculative cost this pass exists to avoid.
   */
  const preloadedRef = useRef(false)
  const warmMedia = useCallback(() => {
    if (preloadedRef.current) return
    preloadedRef.current = true
    for (const media of hoverMediaList) {
      if (!media.mime.startsWith('image/')) continue
      const img = new Image()
      // Cache warming must never compete with page-critical requests.
      img.fetchPriority = 'low'
      img.decoding = 'async'
      img.src = media.url
      onMediaReady(img, (ok) => {
        if (ok) warmedRef.current.add(media.url)
      })
    }
  }, [hoverMediaList])

  useEffect(() => {
    if (open) warmMedia()
  }, [open, warmMedia])

  // Input modality for every scripted focus move in this menu (see ./focus).
  useEffect(() => trackInputModality(), [])

  // Intent, one beat ahead of the open: reaching for the button is enough.
  useEffect(() => {
    const button = menuButtonRef.current
    if (!button) return
    // pointerdown covers touch, where there is no hover to read intent from.
    const events = ['pointerenter', 'pointerdown', 'focus'] as const
    for (const type of events) button.addEventListener(type, warmMedia)
    return () => {
      for (const type of events) button.removeEventListener(type, warmMedia)
    }
  }, [menuButtonRef, warmMedia])

  useGSAP(
    () => {
      const overlay = overlayRef.current
      const frame = getPageFrame()
      if (!overlay || !frame) return

      const items = gsap.utils.toArray<HTMLElement>('[data-menu-item]', overlay)
      const footer = getSiteFooter()
      const mm = gsap.matchMedia()

      mm.add(
        {
          desktop: DESKTOP_MEDIA_QUERY,
          motionOK: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { desktop, motionOK } = (context.conditions ?? {}) as {
            desktop: boolean
            motionOK: boolean
          }

          const buildTimeline = () => {
            const slotEl = overlay.querySelector<HTMLElement>(PREVIEW_SLOT_SELECTOR)
            const borderRadius = desktop ? CARD_RADIUS_DESKTOP : CARD_RADIUS_MOBILE
            const boxShadow = desktop ? DESKTOP_CARD_SHADOW : MOBILE_CARD_SHADOW
            // Overlay is visibility:hidden while closed but still laid out, so
            // the slot measures at its final open-state position.
            const slotRect = slotEl?.getBoundingClientRect()
            if (!slotRect || slotRect.width === 0 || slotRect.height === 0) {
              // No usable slot (e.g. detached render) — content-only fallback.
              cardMotionRef.current = null
              const tl = overlayFadeTimeline(overlay)
              tlRef.current = tl
              return tl
            }
            const motion = getCardMotion(slotRect, borderRadius)
            cardMotionRef.current = motion

            // Dissolve layer — injected into the frame by mountHeroMedia at
            // open time (so the animating mask crops it). The open dissolve
            // only wires up when the page contributed base media; a base-less
            // layer stays as the empty home for hover previews.
            const heroLayer = frame.querySelector<HTMLElement>(HERO_LAYER_SELECTOR)
            const heroBase = heroLayer?.querySelector<HTMLElement>(HERO_BASE_SELECTOR) ?? null
            // Only media that can paint *this frame* belongs in the timeline.
            // A clone whose bytes are still in flight would dissolve the page
            // crop away to nothing and then pop when it decodes; leave it out,
            // open on the page, and let `revealLateHeroBase` bring it in when
            // it is real. (The timeline also has to be able to take its own
            // dissolve back out on the reverse — hence the strict split.)
            const dissolveBase = heroBase && isMediaReady(heroBase) ? heroBase : null

            let tl: gsap.core.Timeline
            if (!motionOK) {
              // Reduced motion: crossfade + snap to the final window.
              tl = overlayFadeTimeline(overlay)
              tl.fromTo(items, { autoAlpha: 0 }, { autoAlpha: 1 }, 0).set(
                frame,
                {
                  transformOrigin: '0 0',
                  scale: motion.scale,
                  x: motion.x,
                  y: motion.y,
                  clipPath: motion.clipPath,
                  borderRadius,
                  boxShadow,
                  overflow: 'hidden',
                },
                0,
              )
              // Snap straight to the settled view: hero media fills the window.
              if (dissolveBase) tl.set(dissolveBase, { autoAlpha: 1 }, 0)
              if (footer) tl.set(footer, { autoAlpha: 0 }, 0)
            } else {
              // Scale + dock and the clip mask run in parallel; the mask starts
              // slightly later so it trails the shrink (parallax window).
              tl = gsap.timeline({
                paused: true,
                defaults: { ease: MENU_EASE },
              })
              // fromTo (not to) everywhere below that touches overlay/footer:
              // rebuilds happen while OPEN (resize, breakpoint change) and a
              // start value recorded at progress(1) would poison the reverse.
              tl.set(overlay, { pointerEvents: 'auto' })
                .set(frame, {
                  transformOrigin: '0 0',
                  clipPath: motion.openClipPath,
                })
                .fromTo(
                  overlay,
                  { autoAlpha: 0 },
                  { autoAlpha: 1, duration: OVERLAY_FADE_DURATION, ease: 'power1.out' },
                  0,
                )
                .fromTo(
                  frame,
                  {
                    scale: 1,
                    x: 0,
                    y: 0,
                    borderRadius: 0,
                    boxShadow: '0 0 0 0 transparent',
                  },
                  {
                    scale: motion.scale,
                    x: motion.x,
                    y: motion.y,
                    borderRadius,
                    boxShadow,
                    duration: FRAME_DURATION,
                    // No immediateRender: painting the from-values at build time
                    // stamps an identity transform on the frame, which makes it
                    // the containing block for every fixed descendant (demo
                    // shell sidebar) while the menu is still closed.
                    immediateRender: false,
                  },
                  0,
                )
                .fromTo(
                  frame,
                  { clipPath: motion.openClipPath },
                  {
                    clipPath: motion.clipPath,
                    duration: FRAME_DURATION,
                    immediateRender: false,
                  },
                  CLIP_LAG,
                )
              if (dissolveBase) {
                // Cross-fade dissolve: the page's own hero media fades in over
                // the page content inside the docking window, landing as the
                // clip mask settles. The layer is a frame child, so the mask
                // crops the fade at every step — nothing paints outside it.
                tl.fromTo(
                  dissolveBase,
                  { autoAlpha: 0 },
                  {
                    autoAlpha: 1,
                    duration: HERO_DISSOLVE_END - HERO_DISSOLVE_START,
                    ease: HERO_DISSOLVE_EASE,
                  },
                  HERO_DISSOLVE_START,
                )
              }
              if (footer) {
                // Footer chrome exits right away: it is page chrome, never a
                // participant in the window dock or the content cascade. It
                // fades above the frame (FOOTER_TIMELINE_Z), so the exit is
                // seen over the still-full page and the return over the
                // landing one, instead of behind both.
                tl.set(footer, { zIndex: FOOTER_TIMELINE_Z }, 0).fromTo(
                  footer,
                  { autoAlpha: 1 },
                  { autoAlpha: 0, duration: FOOTER_FADE_DURATION, ease: 'power1.out' },
                  0,
                )
              }
              // Content cascade begins at the window's halfway point. It
              // counts only what this breakpoint shows: items hidden at build
              // (the other breakpoint's columns, the phone sub-views behind
              // the nav) still cycle their state with the timeline, so
              // nothing is stranded at zero, but hold no slot. A phone's nav
              // is not kept waiting on the desktop columns, and the desktop
              // order is untouched by phone-only rows.
              const cascade = items.filter(
                (el) => (el.checkVisibility?.() ?? true) && !el.closest(SUB_VIEW_SELECTOR),
              )
              const offstage = items.filter((el) => !cascade.includes(el))
              tl.fromTo(
                cascade,
                { autoAlpha: 0, y: desktop ? 16 : 12 },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: ITEM_DURATION,
                  ease: ITEM_EASE,
                  stagger: ITEM_STAGGER,
                },
                ITEMS_START,
              )
              if (offstage.length > 0) {
                // `y: 0` also clears the lift a hero handoff leaves on them.
                tl.fromTo(
                  offstage,
                  { autoAlpha: 0, y: 0 },
                  { autoAlpha: 1, duration: ITEM_DURATION, ease: ITEM_EASE },
                  ITEMS_START,
                )
              }
            }

            tlRef.current = tl
            return tl
          }

          const tl = buildTimeline()
          // Breakpoint or motion-preference change while open (e.g. phone
          // rotation crossing md): jump the rebuilt timeline to its end so the
          // menu stays open instead of stranding an inert, invisible page.
          if (openRef.current) tl.progress(1)

          // Let the open effect rebuild with fresh metrics at open time —
          // mobile browser chrome (URL bar) changes innerHeight between mount
          // and open, and stale insets break the card's crop.
          rebuildTimelineRef.current = () => {
            tlRef.current?.kill()
            return buildTimeline()
          }

          // Keep the window docked on the slot while resizing. Only while
          // open: closed, the open effect rebuilds with fresh metrics anyway,
          // and killing here would strand an in-flight close reverse (its
          // onReverseComplete cleanup — inert, scroll lock — would never run).
          let resizeTimer = 0
          const onResize = () => {
            if (!openRef.current) return
            window.clearTimeout(resizeTimer)
            resizeTimer = window.setTimeout(() => {
              // Close may have started inside the debounce window.
              if (!openRef.current) return
              tlRef.current?.kill()
              const next = buildTimeline()
              // Re-freeze frame to the new viewport before snapping open.
              gsap.set(frame, {
                position: 'fixed',
                top: 0,
                left: 0,
                width: getViewportWidth(),
                height: window.innerHeight,
                minHeight: 0,
                overflow: 'hidden',
                zIndex: FRAME_Z,
              })
              // Reflow at the new width can clamp the scroll offset — re-pin
              // it and keep the hero dissolve layer over the visible box.
              frame.scrollTop = scrollYRef.current
              const heroLayer = frame.querySelector<HTMLElement>(HERO_LAYER_SELECTOR)
              if (heroLayer) gsap.set(heroLayer, { top: frame.scrollTop })
              // The cover is absolutely sized now, so it must be re-fitted to
              // the rebuilt dock's crop (buildTimeline above refreshed it).
              const cover = heroLayer?.querySelector<HTMLElement>(CHAT_COVER_SELECTOR)
              if (cover) setCoverBox(cover, cardMotionRef.current)
              next.progress(1)
            }, 80)
          }
          window.addEventListener('resize', onResize)

          return () => {
            window.clearTimeout(resizeTimer)
            window.removeEventListener('resize', onResize)
            rebuildTimelineRef.current = null
            tlRef.current?.kill()
            tlRef.current = null
          }
        },
      )
    },
    { scope: overlayRef },
  )

  useEffect(() => {
    openRef.current = open
    // A hero handoff owns the exit end-to-end; reopening mid-flight snaps it
    // finished first so the dock below starts from a clean, restored page.
    if (handoffRef.current?.active) {
      if (!open) return
      handoffRef.current.abort()
    }
    let tl = tlRef.current
    const frame = getPageFrame()
    const overlay = overlayRef.current
    if (!tl || !frame || !overlay) return

    if (open) {
      pendingNavRef.current = false
      // Insurance: a close that never reached `restoreFrame` (no timeline, no
      // frame) must not leave the document without view transitions.
      releaseViewTransitionsRef.current?.()
      releaseViewTransitionsRef.current = null
      // Rebuild from the current viewport before freezing: the timeline's clip
      // insets must match the frame size read below in the same tick, or the
      // crop is off by however much innerHeight drifted (mobile URL bar).
      // Skip mid-reverse re-opens — the in-flight timeline already matches.
      if (tl.progress() === 0 && rebuildTimelineRef.current) {
        // Inject this page's hero media into the frame first — the rebuilt
        // timeline wires the dissolve only when the layer exists.
        mountHeroMedia(frame, window.scrollY)
        tl = rebuildTimelineRef.current()
        // Fresh layer: whatever the previous open arranged is gone.
        lateBaseRef.current = false
        revealLateHeroBase()
      }
      // Freeze the page at its current scroll position inside a fixed
      // full-viewport frame. Scale + clip-path do the rest — no width/height
      // tween, so in-page layout stays intact.
      scrollYRef.current = window.scrollY
      gsap.set(frame, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: getViewportWidth(),
        height: window.innerHeight,
        minHeight: 0,
        overflow: 'hidden',
        zIndex: FRAME_Z,
      })
      frame.scrollTop = scrollYRef.current
      frame.setAttribute('inert', '')
      // Lock on html (same element as scrollbar-gutter). With Lenis
      // autoToggle, this overflow change stops Lenis — do not also call
      // lenis.stop(), which would set overflow:clip and drop the gutter.
      document.documentElement.style.overflow = 'hidden'

      tl.eventCallback('onComplete', () => {
        // Keyboard users land on the first *visible* menu control: a link, or
        // a phone drill-in row (never the composer's submit). The editorial
        // columns are hidden on mobile, the drill-in rows from md. Pointer
        // users keep the header button (see ./focus).
        const candidates = overlay.querySelectorAll<HTMLElement>(
          '[data-menu-item] :is(a, button[aria-controls])',
        )
        for (const el of candidates) {
          if (el.checkVisibility?.() ?? true) {
            focusForKeyboard(el)
            break
          }
        }
      })
      tl.play()
    } else if (tl.progress() > 0) {
      // Dissolve any hover preview back to the resting state before undocking —
      // on media-less pages the layer sits outside the timeline, so a preview
      // left behind (Escape while hovering) would ride the reverse and pop off.
      window.clearTimeout(hoverClearTimer.current)
      showHoverMedia(null)
      // A base the timeline never owned has to be dissolved back out by hand,
      // over the beat the reverse would have given it.
      if (lateBaseRef.current) {
        lateBaseRef.current = false
        const base = frame.querySelector<HTMLElement>(
          `${HERO_LAYER_SELECTOR} ${HERO_BASE_SELECTOR}`,
        )
        if (base) {
          gsap.to(base, {
            autoAlpha: 0,
            duration: prefersReducedMotion() ? 0 : HERO_DISSOLVE_END - HERO_DISSOLVE_START,
            ease: HERO_DISSOLVE_EASE,
            overwrite: 'auto',
          })
        }
      }
      // The Ask transcript may have faded the window out — restore it so the
      // undock animation has something to show.
      gsap.set(frame, { autoAlpha: 1 })
      tl.eventCallback('onReverseComplete', () => {
        // Navigation close never restores the old offset: if the route already
        // committed, LenisRouteReset put the page at the top (or its anchor) —
        // restoreFrame honors that instead of stamping a stale offset.
        restoreFrame(pendingNavRef.current)
        // Drop every GSAP inline style so the class-driven closed state
        // (invisible / opacity-0 / pointer-events-none) is the single source
        // of truth, and the next timeline records pristine start values.
        gsap.set(overlay, { clearProps: 'all' })
        focusForKeyboard(menuButtonRef.current)
      })
      tl.reverse()
    }
  }, [open, menuButtonRef, restoreFrame, revealLateHeroBase])

  /**
   * Phone sub-view in front of the nav (see the SUB_VIEW_* block above).
   * Every open starts on the nav. The reset waits for the open rather than
   * running at close, where the nav sliding back in would ride the undock;
   * at open the overlay is still transparent and every item sits at zero
   * until the cascade, so the swap back is never seen.
   */
  const [subView, setSubView] = useState<SubView | null>(null)
  const subViewTriggerRefs = useRef<Record<SubView, HTMLButtonElement | null>>({
    expertise: null,
    audiences: null,
  })
  const subViewBackRefs = useRef<Record<SubView, HTMLButtonElement | null>>({
    expertise: null,
    audiences: null,
  })
  /** The sub-view the last swap left, so a step back can return focus to its row. */
  const lastSubViewRef = useRef<SubView | null>(null)
  const resetSubView = useCallback(() => {
    lastSubViewRef.current = null
    setSubView(null)
  }, [])
  useEffect(() => {
    if (open) resetSubView()
  }, [open, resetSubView])
  // A sub-view is a phone-only layer: crossing to md (a tablet rotating)
  // lands on the three-column layout, where a lingering one would only
  // misroute Escape. The same flag keeps the nav's `inert` off the desktop
  // column, whose layout the sub-view classes never touch.
  const isMobile = useIsMobile()
  useEffect(() => {
    if (!isMobile) resetSubView()
  }, [isMobile, resetSubView])
  // Keyboard focus follows the swap: into the sub-view's back row (its first
  // control, which also names where the user is), and back onto the row that
  // opened it. A tap moves nothing (see ./focus).
  useEffect(() => {
    const previous = lastSubViewRef.current
    lastSubViewRef.current = subView
    if (subView) focusForKeyboard(subViewBackRefs.current[subView], { preventScroll: true })
    else if (previous)
      focusForKeyboard(subViewTriggerRefs.current[previous], { preventScroll: true })
  }, [subView])

  /** Phone drill-in views, one per editorial column; an empty column gets no row. */
  const subViewDefs: { key: SubView; title: string; items: MenuLink[] }[] = [
    { key: 'expertise', title: 'Expertise', items: expertise },
    { key: 'audiences', title: 'Who We Help', items: audiences },
  ]
  const subViews = subViewDefs.filter((view) => view.items.length > 0)

  // Escape steps back one layer at a time: transcript → preview, sub-view →
  // nav, then menu → page.
  // Safety-net cleanup if unmounted mid-open lives in the unmount effect below.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (chatViewRef.current && exitChatViewRef.current) exitChatViewRef.current()
      else if (subView) setSubView(null)
      else onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, subView])

  useEffect(
    () => () => {
      window.clearTimeout(hoverClearTimer.current)
      // Unmount mid-handoff: drop the traveler and restore the frame now.
      handoffRef.current?.abort()
      // …and never leave the document without view transitions.
      releaseViewTransitionsRef.current?.()
      releaseViewTransitionsRef.current = null
      const frame = getPageFrame()
      if (frame?.hasAttribute('inert')) {
        frame.removeAttribute('inert')
        clearFrameProps(frame)
        document.documentElement.style.overflow = ''
      }
    },
    [],
  )

  // Mirrors MenuAsk's chat-view state so the mobile layout can hand the nav's
  // space to the transcript (nav + CTA fade out, slot grows to fill).
  const [chatView, setChatView] = useState(false)

  // The media→chat mask (see the CHAT_* block in ./motion). Outside the GSAP
  // context on purpose — the frame outlives this component's scope, and
  // close/unmount always restores it via clearFrameProps (the cover lives
  // inside the hero layer, which clearFrameProps removes).
  // Exit releases the mobile layout only after the panel has faded
  // (CHAT_EXIT_RELEASE_MS): the nav must not return into a column the
  // transcript still occupies. Entry, menu close, and reduced motion flip at
  // once: the close fade (resp. no fade at all) covers the change.
  const layoutReleaseRef = useRef<number | null>(null)
  useEffect(() => () => window.clearTimeout(layoutReleaseRef.current ?? undefined), [])
  const handleChatViewChange = useCallback((next: boolean) => {
    chatViewRef.current = next
    window.clearTimeout(layoutReleaseRef.current ?? undefined)
    layoutReleaseRef.current = null
    if (next || !openRef.current || prefersReducedMotion()) {
      setChatView(next)
    } else {
      layoutReleaseRef.current = window.setTimeout(() => {
        layoutReleaseRef.current = null
        setChatView(false)
      }, CHAT_EXIT_RELEASE_MS)
    }
    const frame = getPageFrame()
    if (!frame) return
    const layer = frame.querySelector<HTMLElement>(HERO_LAYER_SELECTOR)
    const existing = layer?.querySelector<HTMLElement>(CHAT_COVER_SELECTOR) ?? null

    if (!next) {
      // No cover means no swap ever ran this open (e.g. the mount-time
      // effect) — nothing to restore.
      if (!existing) return
      // Restore the frame even mid-close: the undock reverse needs the page
      // visible, and the still-full cover makes the switch invisible.
      gsap.set(frame, { autoAlpha: 1 })
      gsap.to(existing, {
        clipPath: CHAT_COVER_HIDDEN,
        duration: prefersReducedMotion() ? 0 : CHAT_UNWIPE_DURATION,
        ease: CHAT_UNWIPE_EASE,
        overwrite: 'auto',
      })
      return
    }

    if (!layer || !openRef.current) return
    let cover = existing
    if (!cover) {
      cover = document.createElement('div')
      cover.setAttribute('data-menu-chat-cover', '')
      cover.setAttribute('aria-hidden', 'true')
      gsap.set(cover, {
        position: 'absolute',
        // Above any hover-preview items stacked in the layer.
        zIndex: 10,
        pointerEvents: 'none',
        backgroundColor: 'var(--color-popover)',
        clipPath: CHAT_COVER_HIDDEN,
      })
      layer.appendChild(cover)
    }
    setCoverBox(cover, cardMotionRef.current)
    gsap.to(cover, {
      clipPath: CHAT_COVER_FULL,
      duration: prefersReducedMotion() ? 0 : CHAT_WIPE_DURATION,
      ease: CHAT_WIPE_EASE,
      overwrite: 'auto',
      onComplete: () => {
        // Media fully covered — hand the window to the identical-colored
        // panel beneath. Skipped if the menu closed mid-wipe.
        if (openRef.current) gsap.set(frame, { autoAlpha: 0 })
      },
    })
  }, [])

  /**
   * Mobile chat view: nav chrome yields the column to the transcript. Fades
   * out first, then releases its layout space (`transition-discrete` flips
   * `display` at the fade's end). The return path is the mirror: `display`
   * comes back once the transcript has released the column (see
   * handleChatViewChange) and the chrome fades in from `@starting-style`.
   * Desktop keeps its three columns.
   */
  // Fade duration matches CHAT_STAGE_DELAY_MS (Menu/motion.ts): the space this
  // releases is the space the transcript panel starts growing into.
  const chatHideable = (extra?: string) =>
    cn(
      'max-md:transition-[opacity,display] max-md:transition-discrete max-md:duration-200 max-md:ease-out max-md:starting:opacity-0',
      chatView && 'max-md:hidden max-md:opacity-0 max-md:pointer-events-none',
      extra,
    )

  // Clicks on structural empty space (columns, the docked window over the
  // inert frame) collapse the transcript back to the preview — and nothing
  // more. They must NEVER close the menu itself: that happens only via the
  // header CLOSE button, Escape, or navigating a link (onClickCapture).
  const onBackdropClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).dataset.menuBackdrop === undefined) return
    if (chatViewRef.current && exitChatViewRef.current) exitChatViewRef.current()
  }

  // The closed overlay still intersects the viewport, so Next would prefetch every
  // menu route on page load (and, in the live preview iframe, on every draft
  // refresh). Prefetch only once the menu is open and the links are on screen.
  const menuLinkPrefetch = open ? undefined : false

  return (
    <div
      ref={overlayRef}
      id="site-menu"
      aria-hidden={!open}
      data-menu-backdrop
      // z-40: above the footer bar (z-30, later in DOM) so the fixed footer
      // never paints over the open menu; the docked frame sits at FRAME_Z (45),
      // the header stays on top at z-50.
      className="invisible fixed inset-0 z-40 bg-background text-foreground opacity-0 pointer-events-none"
      onClick={onBackdropClick}
    >
      <nav
        aria-label="Site menu"
        data-menu-backdrop
        // Mobile: two modules. Ask (preview + composer) holds the top; the
        // primary nav anchors to the bottom cluster with the utility strip
        // (clock + CTA, thumb zone), so any spare height reads as a deliberate
        // break between the modules rather than a void above the strip.
        // Desktop: three columns — editorial lists, centered window, nav.
        // Rows pin the side columns to the preview slot; ask + CTA sit below.
        className="absolute inset-0 flex flex-col gap-6 px-gutter pt-[calc(var(--header-bar-height)+0.75rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))] md:grid md:grid-cols-[1fr_minmax(18rem,28rem)_1fr] md:grid-rows-[minmax(0,1fr)_auto_auto] md:gap-x-12 md:gap-y-6 md:pt-[calc(var(--header-height)+2.5rem)] md:pb-10"
      >
        {/* Left column — editorial lists (desktop only). */}
        <div
          data-menu-backdrop
          data-lenis-prevent
          className={cn(
            'no-scrollbar hidden min-h-0 flex-col gap-12 overflow-y-auto overscroll-contain md:col-start-1 md:row-start-1 md:flex',
            SCROLL_RING_ROOM,
          )}
        >
          {expertise.length > 0 && (
            <section className="flex max-w-xs flex-col gap-6">
              <h3 data-menu-item className="font-mono text-xs/none text-muted-foreground">
                Expertise
              </h3>
              <ul className="flex flex-col gap-4">
                {expertise.map((item) => (
                  <li key={item.href} data-menu-item {...itemHandlers(item.media)}>
                    <Link
                      href={item.href}
                      prefetch={menuLinkPrefetch}
                      className="text-sm text-card-foreground transition-colors hover:text-primary"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {audiences.length > 0 && (
            <section className="flex max-w-xs flex-col gap-6">
              <h3 data-menu-item className="font-mono text-xs/none text-muted-foreground">
                Who We Help
              </h3>
              <ul className="flex flex-col gap-2">
                {audiences.map((item) => (
                  <li key={item.href} data-menu-item {...itemHandlers(item.media)}>
                    <Link
                      href={item.href}
                      prefetch={menuLinkPrefetch}
                      className="pressable block rounded-md bg-secondary p-3 text-sm text-secondary-foreground hover:text-primary"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Center column: slot + form are MenuAsk fragment children, so they
            sit on this grid (row 1 + 2). The CTA (row 3) renders after the
            right column, inside the utility strip, so the mobile flex stack
            pins it to the bottom.
            With Ask hidden only the slot renders: the frame still docks onto
            it, and row 2 stays empty on purpose, so the CTA keeps its place
            and the composer's absence reads as air under the window rather
            than a re-flow. */}
        {askHidden ? (
          <MenuPreviewSlot />
        ) : (
          <MenuAsk
            open={open}
            onViewChange={handleChatViewChange}
            exitChatViewRef={exitChatViewRef}
            transport={askTransport}
            initialMessages={askInitialMessages}
          />
        )}

        {/* Right column — recent work (desktop) + primary nav. Right-aligned to
            the outer gutter so it mirrors the left column instead of hugging
            the window (design: side columns sit at the gutters, window centered). */}
        <div
          data-menu-backdrop
          data-lenis-prevent
          className={chatHideable(
            cn(
              'no-scrollbar flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain md:col-start-3 md:row-start-1 md:max-w-xs md:flex-none md:justify-self-end md:justify-between',
              SCROLL_RING_ROOM,
            ),
          )}
        >
          {works.length > 0 && (
            <ul className="hidden flex-col gap-6 md:flex">
              {works.map((item) => (
                <li key={item.href} data-menu-item {...itemHandlers(item.media)}>
                  <Link
                    href={item.href}
                    prefetch={menuLinkPrefetch}
                    className="group flex flex-col gap-3"
                    {...cursorTarget({ label: 'View work' })}
                  >
                    {item.eyebrow && (
                      <span className="text-sm/none text-muted-foreground">{item.eyebrow}</span>
                    )}
                    <span className="text-lg/none text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {works.length > 0 && (
            <div data-menu-item className="hidden h-px w-10 bg-border md:block" />
          )}

          {/* Phone: the nav and its sub-views stack on SUB_VIEW_STAGE; from md
              both wrappers are `contents`, so the list is the column's direct
              child as before. */}
          <div className={SUB_VIEW_STAGE}>
            <div
              inert={isMobile && subView !== null}
              className={cn(
                SUB_VIEW_SCROLL,
                'md:contents',
                subView !== null && 'max-md:pointer-events-none',
              )}
            >
              {/* max-md:mt-auto (not justify-end) so the list stays scrollable
                  when it overflows: auto margins collapse to 0 inside overflow.
                  No padding below the list: the stack gap is the break before
                  the strip, and padding inside a scroll panel is scrollable
                  height, which on a short phone made a list that fit by eye
                  jiggle by exactly that much. */}
              <ul className="flex flex-col items-start gap-4 max-md:mt-auto md:gap-6">
                {/* Drill-in rows lead the nav (the offer, then the proof). The
                    chevron marks a deeper level; destinations carry none. */}
                {subViews.map(({ key, title }, index) => (
                  <li
                    key={key}
                    data-menu-item
                    className="md:hidden"
                    style={subViewRowTiming(index, subView === null)}
                  >
                    <button
                      ref={(el) => {
                        subViewTriggerRefs.current[key] = el
                      }}
                      type="button"
                      aria-expanded={subView === key}
                      aria-controls={subViewId(key)}
                      onClick={() => setSubView(key)}
                      className={cn(
                        NAV_ROW,
                        TOUCH_ROW_HIT,
                        SUB_VIEW_ROW,
                        'inline-flex items-center gap-1',
                        subView !== null && subViewRowHidden('start'),
                      )}
                    >
                      {title}
                      <IconChevronRight aria-hidden className="size-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
                {navItems.map(({ link }, i) => {
                  const href = navItemHref(link)
                  return (
                    <li
                      key={i}
                      data-menu-item
                      style={subViewRowTiming(subViews.length + i, subView === null)}
                      {...itemHandlers(href ? (pageMedia[href] ?? null) : null)}
                    >
                      <CMSLink
                        {...link}
                        appearance="inline"
                        className={cn(
                          NAV_LINK,
                          SUB_VIEW_ROW,
                          subView !== null && subViewRowHidden('start'),
                        )}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* The back row mirrors the row that opened the view (‹ Expertise
                for Expertise ›): the flipped chevron and the rows' arrival
                from the right say which way it goes. */}
            {subViews.map(({ key, title, items }) => {
              const active = subView === key
              return (
                <section
                  key={key}
                  id={subViewId(key)}
                  aria-label={title}
                  data-menu-subview={key}
                  inert={!active}
                  className={cn(
                    SUB_VIEW_SCROLL,
                    'md:hidden',
                    !active && 'max-md:pointer-events-none',
                  )}
                >
                  {/* gap-8 over the list's 16: the back row is the view's title,
                      not its first item. */}
                  <div className="mt-auto flex flex-col items-start gap-8">
                    <div data-menu-item style={subViewRowTiming(0, active)}>
                      <button
                        ref={(el) => {
                          subViewBackRefs.current[key] = el
                        }}
                        type="button"
                        onClick={() => setSubView(null)}
                        className={cn(
                          NAV_ROW,
                          TOUCH_ROW_HIT,
                          SUB_VIEW_ROW,
                          'inline-flex items-center gap-1',
                          !active && subViewRowHidden('end'),
                        )}
                      >
                        <IconChevronLeft aria-hidden className="size-4 text-muted-foreground" />
                        {title}
                        <span className="sr-only">, back to menu</span>
                      </button>
                    </div>
                    <ul className="flex flex-col items-start gap-4">
                      {items.map((item, i) => (
                        <li
                          key={item.href}
                          data-menu-item
                          style={subViewRowTiming(i + 1, active)}
                          {...itemHandlers(item.media)}
                        >
                          <Link
                            href={item.href}
                            prefetch={menuLinkPrefetch}
                            className={cn(
                              SUB_VIEW_LINK,
                              SUB_VIEW_ROW,
                              !active && subViewRowHidden('end'),
                            )}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )
            })}
          </div>
        </div>

        {/* Bottom of the mobile stack: the utility strip at the safe-area
            edge, studio clock left and the primary CTA right, so the CTA
            reads as chrome (the menu's own footer bar) rather than a seventh
            nav row. It lives outside the scrolling nav column so it holds
            position when the nav overflows; the stack gap is the break above
            it. Desktop dissolves the strip (`contents`): the clock goes
            back to the footer, and the CTA sits under the composer (row 3). */}
        {/* chatHideable sits on the wrapper, not on the data-menu-items: the
            open stagger leaves inline opacity on every item, which would beat
            the class-driven fade in both directions. */}
        <div className={chatHideable('flex items-center justify-between gap-6 md:contents')}>
          <div data-menu-item className="md:hidden">
            <Clock className="text-foreground" />
          </div>
          <div
            data-menu-item
            className="md:col-start-2 md:row-start-3 md:justify-self-center"
            {...itemHandlers(pageMedia[ctaHref] ?? null)}
          >
            <Button asChild variant="default" size="pill">
              <Link
                href={ctaHref}
                prefetch={menuLinkPrefetch}
                {...ctaLinkProps}
                {...cursorTarget()}
              >
                <span>{ctaLabel}</span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  )
}
