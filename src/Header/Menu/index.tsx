'use client'

import { useGSAP } from '@gsap/react'
import { IconArrowUpRight } from '@tabler/icons-react'
import gsap from 'gsap'
import Link from 'next/link'
import type React from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import { Clock } from '@/Footer/Clock'
import { MenuAsk } from '@/features/ask/MenuAsk'
import { cursorTarget } from '@/features/cursor'
import type { Header as HeaderType } from '@/payload-types'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition'
import type { MenuContent, MenuMedia } from '../getMenuContent'
import { ThemeToggle } from '../ThemeToggle'

gsap.registerPlugin(useGSAP)

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
 * Hero-media contract: each hero marks its media region with `data-hero-media`
 * (see src/heros/*). On open, the first img/video inside it is cloned into a
 * dissolve layer injected INTO the page frame, so the window's scale + clip
 * mask crop it exactly like the page — the cross-fade can never paint outside
 * the animating mask. The docking window dissolves from page to media; the
 * settled menu shows only the current page's media. Pages without hero media
 * keep the scaled page view.
 */
const HERO_MEDIA_SELECTOR = '[data-hero-media] img, [data-hero-media] video'
const HERO_LAYER_SELECTOR = '[data-menu-hero-media]'
/** The current page's own media inside the layer — the hover-preview resting state. */
const HERO_BASE_SELECTOR = '[data-menu-hero-base]'
/** Hover-preview elements stacked above the base inside the layer. */
const HOVER_ITEM_SELECTOR = '[data-menu-hover-item]'

/* Menu motion — every tunable lives here (docs/animations.md contract). */
/** Fast ease-in-out shared by the window dock and its clip mask. */
const MENU_EASE = 'power2.inOut'
const FRAME_DURATION = 0.8
/** Clip mask trails the shrink slightly so the crop reads as a sliding window. */
const CLIP_LAG = 0.1
const OVERLAY_FADE_DURATION = 0.4
/** Content staggers in, in DOM order, once the window is halfway docked. */
const ITEMS_START = FRAME_DURATION / 2
const ITEM_DURATION = 0.45
const ITEM_STAGGER = 0.03
const ITEM_EASE = 'power2.out'
/** Preview window fade when the Ask transcript takes its place. */
const CHAT_SWAP_FADE = 0.3
/** Footer bar fade-out — leaves immediately, independent of the window dock. */
const FOOTER_FADE_DURATION = 0.35
/** Page window dissolves into the page's hero media across the dock's back
 *  half, finishing exactly when the trailing clip mask settles. */
const HERO_DISSOLVE_START = ITEMS_START
const HERO_DISSOLVE_END = CLIP_LAG + FRAME_DURATION
const HERO_DISSOLVE_EASE = 'power1.inOut'
/** Hovering a menu link cross-dissolves the window to that page's hero media;
 *  leaving all links dissolves back to the current page. Fast ease-out. */
const HOVER_DISSOLVE_DURATION = 0.35
const HOVER_DISSOLVE_EASE = 'power2.out'
/** Grace before dissolving back to base — lets the pointer travel between
 *  adjacent links without flashing the resting state. */
const HOVER_CLEAR_DELAY_MS = 80

/** Docked page frame stacking: above the overlay (z-40), below the header (z-50). */
const FRAME_Z = 45

const getPageFrame = () => document.querySelector<HTMLElement>(PAGE_FRAME_SELECTOR)
const getSiteFooter = () => document.querySelector<HTMLElement>(SITE_FOOTER_SELECTOR)

/** Layout viewport width — excludes classic scrollbar / `scrollbar-gutter: stable`. */
const getViewportWidth = () => document.documentElement.clientWidth

/** Largest rect of the slot's aspect that fits the viewport, in local (unscaled)
 *  px. Insets are centered so the mask closes from all sides toward the middle. */
const getViewportCrop = (vw: number, vh: number, targetAspect: number) => {
  if (vw / vh > targetAspect) {
    // Viewport wider than the slot — crop the sides equally.
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

const clipPathInset = (
  insetT: number,
  insetR: number,
  insetB: number,
  insetL: number,
  radius: number,
) => `inset(${insetT}px ${insetR}px ${insetB}px ${insetL}px round ${radius}px)`

const MOBILE_CARD_SHADOW = '0 0 0 1px oklch(50% 0 0 / 30%), 0 24px 64px oklch(0 0 0 / 35%)'
const DESKTOP_CARD_SHADOW = '0 0 0 1px oklch(50% 0 0 / 30%), 0 32px 96px oklch(0 0 0 / 35%)'

/** Transform + clip-path values that land the frame on the measured slot. */
const getCardMotion = (slot: DOMRect, borderRadius: number) => {
  const vw = getViewportWidth()
  const vh = window.innerHeight
  const crop = getViewportCrop(vw, vh, slot.width / slot.height)
  // Scale from the crop width so the masked window matches the slot size.
  const scale = slot.width / crop.clipW
  return {
    scale,
    // Origin top-left so x/y map 1:1 to the slot's viewport position.
    x: slot.left - crop.insetL * scale,
    y: slot.top - crop.insetT * scale,
    clipPath: clipPathInset(crop.insetT, crop.insetR, crop.insetB, crop.insetL, borderRadius),
    openClipPath: clipPathInset(0, 0, 0, 0, 0),
  }
}

const clearFrameProps = (frame: HTMLElement) => {
  frame.querySelector(HERO_LAYER_SELECTOR)?.remove()
  gsap.set(frame, { clearProps: 'all' })
  const footer = getSiteFooter()
  if (footer) gsap.set(footer, { clearProps: 'opacity,visibility' })
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
    autoAlpha: 0,
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
    })
    layer.appendChild(clone)
  } else {
    // No base to dissolve to — the timeline skips the open dissolve, so the
    // layer must be visible from the start for hover previews to show.
    gsap.set(layer, { autoAlpha: 1 })
  }

  frame.appendChild(layer)
  const video = layer.querySelector('video')
  if (video) void video.play().catch(() => {})
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Hover preview: dissolve the docked window's media to `media`, or back to
 * the resting state (the page's own hero / the scaled page view) on `null`.
 * The incoming element fades in above the stack and drops what it covers on
 * complete — outgoing media never fades under it, so the base can't ghost
 * through mid-dissolve. Reduced motion snaps.
 */
const showHoverMedia = (media: MenuMedia | null) => {
  const layer = getPageFrame()?.querySelector<HTMLElement>(HERO_LAYER_SELECTOR)
  if (!layer) return
  const duration = prefersReducedMotion() ? 0 : HOVER_DISSOLVE_DURATION
  const previous = Array.from(layer.querySelectorAll<HTMLElement>(HOVER_ITEM_SELECTOR))

  if (!media) {
    for (const el of previous) {
      gsap.to(el, {
        autoAlpha: 0,
        duration,
        ease: HOVER_DISSOLVE_EASE,
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
      ease: HOVER_DISSOLVE_EASE,
      overwrite: 'auto',
      onComplete: () => {
        for (const p of previous) {
          if (p !== last) p.remove()
        }
      },
    })
    return
  }

  let el: HTMLImageElement | HTMLVideoElement
  if (media.mime.startsWith('video/')) {
    const video = document.createElement('video')
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.src = media.url
    el = video
  } else {
    const img = document.createElement('img')
    img.decoding = 'async'
    img.src = media.url
    img.alt = ''
    el = img
  }
  el.setAttribute('data-menu-hover-item', media.url)
  gsap.set(el, {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    autoAlpha: 0,
  })
  layer.appendChild(el)
  gsap.to(el, {
    autoAlpha: 1,
    duration,
    ease: HOVER_DISSOLVE_EASE,
    overwrite: 'auto',
    // Fully covered now — drop the outgoing stack beneath.
    onComplete: () => {
      for (const p of previous) p.remove()
    },
  })
  if (el instanceof HTMLVideoElement) void el.play().catch(() => {})
}

type NavItemLink = NonNullable<HeaderType['navItems']>[number]['link']

/** Mirror of CMSLink's href resolution — hover-preview lookup only. */
const navItemHref = (link: NavItemLink): string | null => {
  if (link.type === 'reference' && typeof link.reference?.value === 'object') {
    const { relationTo } = link.reference
    const slug = link.reference.value.slug
    if (slug) return `${relationTo !== 'pages' ? `/${relationTo}` : ''}/${slug}`
  }
  return link.url ?? null
}

type TakeoverMenuProps = {
  data: HeaderType
  menuContent: MenuContent
  open: boolean
  onClose: () => void
  /** Focus returns here when the menu closes. */
  menuButtonRef: React.RefObject<HTMLButtonElement | null>
}

export const TakeoverMenu: React.FC<TakeoverMenuProps> = ({
  data,
  menuContent,
  open,
  onClose,
  menuButtonRef,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const rebuildTimelineRef = useRef<(() => gsap.core.Timeline) | null>(null)
  const scrollYRef = useRef(0)
  const openRef = useRef(open)
  const navItems = data?.navItems || []
  const { expertise, audiences, works, pageMedia } = menuContent

  // Hover preview wiring: entering a link dissolves the docked window to that
  // page's hero media; leaving all links dissolves back after a short grace.
  const hoverClearTimer = useRef(0)
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

  const hoverMediaList = useMemo(() => {
    const byUrl = new Map<string, MenuMedia>()
    for (const item of [...expertise, ...audiences, ...works]) {
      if (item.media) byUrl.set(item.media.url, item.media)
    }
    for (const media of Object.values(pageMedia)) byUrl.set(media.url, media)
    return [...byUrl.values()]
  }, [expertise, audiences, works, pageMedia])

  // Warm the image cache on first open so a hover dissolve never pops in
  // half-loaded. Videos stream on demand — preloading them would be wasteful.
  const preloadedRef = useRef(false)
  useEffect(() => {
    if (!open || preloadedRef.current) return
    preloadedRef.current = true
    for (const media of hoverMediaList) {
      if (media.mime.startsWith('image/')) {
        const img = new Image()
        // Cache warming must never compete with page-critical requests.
        img.fetchPriority = 'low'
        img.decoding = 'async'
        img.src = media.url
      }
    }
  }, [open, hoverMediaList])

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
          desktop: '(min-width: 768px)',
          motionOK: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { desktop, motionOK } = (context.conditions ?? {}) as {
            desktop: boolean
            motionOK: boolean
          }

          const buildTimeline = () => {
            const slotEl = overlay.querySelector<HTMLElement>(PREVIEW_SLOT_SELECTOR)
            const borderRadius = desktop ? 24 : 20
            const boxShadow = desktop ? DESKTOP_CARD_SHADOW : MOBILE_CARD_SHADOW
            // Overlay is visibility:hidden while closed but still laid out, so
            // the slot measures at its final open-state position.
            const slotRect = slotEl?.getBoundingClientRect()
            if (!slotRect || slotRect.width === 0 || slotRect.height === 0) {
              // No usable slot (e.g. detached render) — content-only fallback.
              const tl = gsap.timeline({ paused: true, defaults: { duration: 0.2, ease: 'none' } })
              tl.set(overlay, { pointerEvents: 'auto' }).to(overlay, { autoAlpha: 1 }, 0)
              tlRef.current = tl
              return tl
            }
            const motion = getCardMotion(slotRect, borderRadius)

            // Dissolve layer — injected into the frame by mountHeroMedia at
            // open time (so the animating mask crops it). The open dissolve
            // only wires up when the page contributed base media; a base-less
            // layer stays visible as the empty home for hover previews.
            const heroLayer = frame.querySelector<HTMLElement>(HERO_LAYER_SELECTOR)
            const heroBase = heroLayer?.querySelector(HERO_BASE_SELECTOR)

            let tl: gsap.core.Timeline
            if (!motionOK) {
              // Reduced motion: crossfade + snap to the final window.
              tl = gsap.timeline({ paused: true, defaults: { duration: 0.2, ease: 'none' } })
              tl.set(overlay, { pointerEvents: 'auto' })
                .to(overlay, { autoAlpha: 1 }, 0)
                .fromTo(items, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
                .set(
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
              if (heroLayer) tl.set(heroLayer, { autoAlpha: 1 }, 0)
              if (footer) tl.set(footer, { autoAlpha: 0 }, 0)
            } else {
              // Scale + dock and the clip mask run in parallel; the mask starts
              // slightly later so it trails the shrink (parallax window).
              tl = gsap.timeline({
                paused: true,
                defaults: { ease: MENU_EASE },
              })
              tl.set(overlay, { pointerEvents: 'auto' })
                .set(frame, {
                  transformOrigin: '0 0',
                  clipPath: motion.openClipPath,
                })
                .to(
                  overlay,
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
                  },
                  0,
                )
                .fromTo(
                  frame,
                  { clipPath: motion.openClipPath },
                  {
                    clipPath: motion.clipPath,
                    duration: FRAME_DURATION,
                  },
                  CLIP_LAG,
                )
              if (heroLayer && heroBase) {
                // Cross-fade dissolve: the page's own hero media fades in over
                // the page content inside the docking window, landing as the
                // clip mask settles. The layer is a frame child, so the mask
                // crops the fade at every step — nothing paints outside it.
                tl.fromTo(
                  heroLayer,
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
                // Footer chrome exits right away — it is page chrome, never a
                // participant in the window dock or the content cascade.
                tl.to(
                  footer,
                  { autoAlpha: 0, duration: FOOTER_FADE_DURATION, ease: 'power1.out' },
                  0,
                )
              }
              // Content cascade begins at the window's halfway point.
              tl.fromTo(
                items,
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

          // Keep the window docked on the slot while resizing.
          let resizeTimer = 0
          const onResize = () => {
            window.clearTimeout(resizeTimer)
            resizeTimer = window.setTimeout(() => {
              const wasOpen = openRef.current
              tlRef.current?.kill()
              const next = buildTimeline()
              if (wasOpen) {
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
                next.progress(1)
              }
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
    let tl = tlRef.current
    const frame = getPageFrame()
    const overlay = overlayRef.current
    if (!tl || !frame || !overlay) return

    if (open) {
      // Rebuild from the current viewport before freezing: the timeline's clip
      // insets must match the frame size read below in the same tick, or the
      // crop is off by however much innerHeight drifted (mobile URL bar).
      // Skip mid-reverse re-opens — the in-flight timeline already matches.
      if (tl.progress() === 0 && rebuildTimelineRef.current) {
        // Inject this page's hero media into the frame first — the rebuilt
        // timeline wires the dissolve only when the layer exists.
        mountHeroMedia(frame, window.scrollY)
        tl = rebuildTimelineRef.current()
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
        // First *visible* menu link — the editorial columns are hidden on mobile.
        const candidates = overlay.querySelectorAll<HTMLElement>('[data-menu-item] a')
        for (const el of candidates) {
          if (el.checkVisibility?.() ?? true) {
            el.focus()
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
      // The Ask transcript may have faded the window out — restore it so the
      // undock animation has something to show.
      gsap.set(frame, { autoAlpha: 1 })
      tl.eventCallback('onReverseComplete', () => {
        frame.removeAttribute('inert')
        // Also removes the injected dissolve layer.
        clearFrameProps(frame)
        document.documentElement.style.overflow = ''
        window.scrollTo(0, scrollYRef.current)
        menuButtonRef.current?.focus()
      })
      tl.reverse()
    }
  }, [open, menuButtonRef])

  // Escape closes; safety-net cleanup if unmounted mid-open.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(
    () => () => {
      window.clearTimeout(hoverClearTimer.current)
      const frame = getPageFrame()
      if (frame?.hasAttribute('inert')) {
        frame.removeAttribute('inert')
        clearFrameProps(frame)
        document.documentElement.style.overflow = ''
      }
    },
    [],
  )

  // The transcript replaces the docked window: fade the frozen page frame
  // under it. Outside the GSAP context on purpose — the frame outlives this
  // component's scope and close/unmount always restores it via clearFrameProps.
  const handleChatViewChange = useCallback((chatView: boolean) => {
    const frame = getPageFrame()
    if (!frame || !openRef.current) return
    gsap.to(frame, {
      autoAlpha: chatView ? 0 : 1,
      duration: CHAT_SWAP_FADE,
      ease: 'power1.inOut',
      overwrite: 'auto',
    })
  }, [])

  // Clicks on structural empty space (columns, the docked window over the
  // inert frame) dismiss the menu — interactive children never carry the marker.
  const onBackdropClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).dataset.menuBackdrop !== undefined) onClose()
  }

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
        // Mobile: preview on top, primary nav scrolls, composer + CTA pinned.
        // Desktop: three columns — editorial lists, centered window, nav.
        className="absolute inset-0 flex flex-col gap-6 px-gutter pt-[calc(var(--header-bar-height)+0.75rem)] pb-6 md:grid md:grid-cols-[1fr_minmax(18rem,28rem)_1fr] md:gap-x-12 md:pt-[calc(var(--header-height)+2.5rem)] md:pb-10"
      >
        {/* Left column — editorial lists (desktop only). */}
        <div
          data-menu-backdrop
          data-lenis-prevent
          className="hidden min-h-0 flex-col gap-12 overflow-y-auto overscroll-contain md:flex"
        >
          {expertise.length > 0 && (
            <section className="flex max-w-xs flex-col gap-6">
              <h3 data-menu-item className="font-mono text-xs/none text-muted-foreground">
                Expertise
              </h3>
              <ul className="flex flex-col gap-4">
                {expertise.map((item) => (
                  <li
                    key={item.href}
                    data-menu-item
                    onClickCapture={onClose}
                    {...hoverHandlers(item.media)}
                  >
                    <Link
                      href={item.href}
                      transitionTypes={[...lateralNavTransitionTypes]}
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
                  <li
                    key={item.href}
                    data-menu-item
                    onClickCapture={onClose}
                    {...hoverHandlers(item.media)}
                  >
                    <Link
                      href={item.href}
                      transitionTypes={[...lateralNavTransitionTypes]}
                      className="block rounded-md bg-secondary p-3 text-sm text-secondary-foreground transition-colors hover:text-primary"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Center column — docked page window, Ask pill, contact CTA. */}
        <div
          data-menu-backdrop
          className="flex shrink-0 flex-col items-center gap-6 md:min-h-0 md:shrink"
        >
          <MenuAsk open={open} onViewChange={handleChatViewChange} />
          <div
            data-menu-item
            onClickCapture={onClose}
            {...hoverHandlers(pageMedia['/contact'] ?? null)}
          >
            <Button asChild variant="default" size="pill">
              <Link
                href="/contact"
                transitionTypes={[...lateralNavTransitionTypes]}
                {...cursorTarget()}
              >
                <span>Get in touch</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Right column — recent work (desktop) + primary nav. */}
        <div
          data-menu-backdrop
          data-lenis-prevent
          className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain md:flex-none md:justify-between md:overflow-visible"
        >
          {works.length > 0 && (
            <ul className="hidden flex-col gap-6 md:flex">
              {works.map((item) => (
                <li
                  key={item.href}
                  data-menu-item
                  onClickCapture={onClose}
                  {...hoverHandlers(item.media)}
                >
                  <Link
                    href={item.href}
                    transitionTypes={[...lateralNavTransitionTypes]}
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

          <ul className="flex flex-col items-start gap-5 md:gap-6">
            {navItems.map(({ link }, i) => {
              const href = navItemHref(link)
              return (
                <li
                  key={i}
                  data-menu-item
                  onClickCapture={onClose}
                  {...hoverHandlers(href ? (pageMedia[href] ?? null) : null)}
                >
                  <CMSLink
                    {...link}
                    appearance="inline"
                    className="font-heading text-xl/none font-light tracking-widest text-foreground transition-colors hover:text-primary md:text-lg/none"
                  />
                </li>
              )
            })}
            <li
              data-menu-item
              onClickCapture={onClose}
              {...hoverHandlers(pageMedia['/search'] ?? null)}
            >
              <Link
                href="/search"
                transitionTypes={[...lateralNavTransitionTypes]}
                className="group flex items-center gap-2 font-heading text-xl/none font-light tracking-widest text-foreground transition-colors hover:text-primary md:text-lg/none"
              >
                Search
                <IconArrowUpRight className="size-5 opacity-40 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          </ul>

          <div data-menu-item className="mt-auto flex items-center justify-between md:hidden">
            <Clock className="text-foreground" />
            <ThemeToggle className="text-foreground" />
          </div>
        </div>
      </nav>
    </div>
  )
}
