'use client'

import { useGSAP } from '@gsap/react'
import { IconArrowUpRight } from '@tabler/icons-react'
import gsap from 'gsap'
import Link from 'next/link'
import type React from 'react'
import { useEffect, useRef } from 'react'
import { CMSLink } from '@/components/Link'
import { Clock } from '@/Footer/Clock'
import type { Header as HeaderType } from '@/payload-types'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition'
import { ThemeToggle } from '../ThemeToggle'

gsap.registerPlugin(useGSAP)

/**
 * The takeover menu animates the element carrying this attribute — the
 * page-frame wrapper in (frontend)/layout.tsx — into a 16:9 preview window.
 *
 * Scale + clip-path run together (transform only — page layout stays intact),
 * with a slight timing offset so the crop lags the shrink and reads as a
 * parallax window sliding over the page.
 *
 * Desktop: preview + nav share one layout resolver (no overlap across widths).
 * Mobile: preview under the header; nav fills the lower half.
 */
const PAGE_FRAME_SELECTOR = '[data-page-frame]'
const SITE_FOOTER_SELECTOR = '[data-site-footer]'

const getPageFrame = () => document.querySelector<HTMLElement>(PAGE_FRAME_SELECTOR)
const getSiteFooter = () => document.querySelector<HTMLElement>(SITE_FOOTER_SELECTOR)

/** Layout viewport width — excludes classic scrollbar / `scrollbar-gutter: stable`. */
const getViewportWidth = () => document.documentElement.clientWidth

const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value))

// --header-height is authored in rem, so convert against the root font size.
const mobileCardOffset = () => {
  const styles = getComputedStyle(document.documentElement)
  const headerRem = Number.parseFloat(styles.getPropertyValue('--header-height')) || 0
  return headerRem * Number.parseFloat(styles.fontSize) + 12
}

type PageCardMetrics = {
  vw: number
  vh: number
  left: number
  width: number
  height: number
  top: number
}

type DesktopMenuLayout = PageCardMetrics & {
  navLeft: number
  navWidth: number
  padX: number
}

/** Largest 16:9 rect that fits inside the viewport, in local (unscaled) px.
 *  Insets are centered so the mask closes from all sides toward the middle. */
const getViewportCrop = (vw: number, vh: number) => {
  const targetAspect = 16 / 9
  if (vw / vh > targetAspect) {
    // Viewport wider than 16:9 — crop the sides equally.
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

/** Final mobile page-preview card: padded 16:9 window under the header. */
const getMobileCardMetrics = (): PageCardMetrics => {
  const vw = getViewportWidth()
  const vh = window.innerHeight
  const left = 20
  const width = vw - left * 2
  const height = width * (9 / 16)
  return { vw, vh, left, width, height, top: mobileCardOffset() }
}

/**
 * Desktop split: one resolver owns preview + nav so they cannot overlap.
 *
 *   [ padX | preview (16:9) | equal space | nav | equal space ]
 *
 * Nav is centered in the strip between the page window and the right edge,
 * so left/right gaps in that band stay equal as the viewport changes.
 */
const getDesktopMenuLayout = (): DesktopMenuLayout => {
  const vw = getViewportWidth()
  const vh = window.innerHeight

  const padX = clamp(24, vw * 0.04, 80)
  const padY = clamp(40, vh * 0.08, 72)
  const minSide = clamp(24, vw * 0.03, 48)
  // Enough for display links; shrinks on mid widths, caps so it doesn't dominate.
  const navWidth = clamp(220, vw * 0.28, 400)

  const maxHeight = Math.max(0, vh - padY * 2)
  // Leave room for nav + equal minimum side gaps beside it.
  const previewColumnWidth = Math.max(0, vw - padX - navWidth - minSide * 2)
  const width = Math.min(previewColumnWidth, maxHeight * (16 / 9))
  const height = width * (9 / 16)
  const left = padX
  const top = (vh - height) / 2

  // Center nav between the page window and the right edge of the screen.
  const previewRight = left + width
  const remaining = vw - previewRight
  const navLeft = previewRight + (remaining - navWidth) / 2

  return { vw, vh, left, width, height, top, navLeft, navWidth, padX }
}

const applyDesktopNavVars = (el: HTMLElement, layout: DesktopMenuLayout) => {
  el.style.setProperty('--menu-nav-left', `${layout.navLeft}px`)
  el.style.setProperty('--menu-nav-width', `${layout.navWidth}px`)
}

const clearDesktopNavVars = (el: HTMLElement) => {
  el.style.removeProperty('--menu-nav-left')
  el.style.removeProperty('--menu-nav-width')
}

const MOBILE_CARD_SHADOW = '0 0 0 1px oklch(50% 0 0 / 30%), 0 24px 64px oklch(0 0 0 / 35%)'
const DESKTOP_CARD_SHADOW = '0 0 0 1px oklch(50% 0 0 / 30%), 0 32px 96px oklch(0 0 0 / 35%)'

/** Transform + clip-path values that land the frame on the final 16:9 card. */
const getCardMotion = (metrics: PageCardMetrics, borderRadius: number) => {
  const { vw, vh, left, width, top } = metrics
  const crop = getViewportCrop(vw, vh)
  // Scale from the crop width so the masked window matches the card size.
  const scale = width / crop.clipW
  return {
    scale,
    // Origin top-left so x/y map 1:1 to the card's viewport position.
    x: left - crop.insetL * scale,
    y: top - crop.insetT * scale,
    clipPath: clipPathInset(crop.insetT, crop.insetR, crop.insetB, crop.insetL, borderRadius),
    openClipPath: clipPathInset(0, 0, 0, 0, 0),
  }
}

const clearFrameProps = (frame: HTMLElement) => {
  gsap.set(frame, { clearProps: 'all' })
  const footer = getSiteFooter()
  if (footer) gsap.set(footer, { clearProps: 'opacity,visibility' })
}

type TakeoverMenuProps = {
  data: HeaderType
  open: boolean
  onClose: () => void
  /** Focus returns here when the menu closes. */
  menuButtonRef: React.RefObject<HTMLButtonElement | null>
}

export const TakeoverMenu: React.FC<TakeoverMenuProps> = ({
  data,
  open,
  onClose,
  menuButtonRef,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const scrollYRef = useRef(0)
  const openRef = useRef(open)
  const navItems = data?.navItems || []

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
            const layout = desktop ? getDesktopMenuLayout() : getMobileCardMetrics()
            if (desktop) applyDesktopNavVars(overlay, layout as DesktopMenuLayout)
            else clearDesktopNavVars(overlay)

            const borderRadius = desktop ? 24 : 20
            const boxShadow = desktop ? DESKTOP_CARD_SHADOW : MOBILE_CARD_SHADOW
            const motion = getCardMotion(layout, borderRadius)

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
              if (footer) tl.set(footer, { autoAlpha: 0 }, 0)
            } else {
              // Scale + dock and 16:9 clip run in parallel; clip starts slightly
              // later so the mask trails the shrink (parallax window).
              tl = gsap.timeline({
                paused: true,
                defaults: { ease: 'power2.inOut' },
              })
              tl.set(overlay, { pointerEvents: 'auto' })
                .set(frame, {
                  transformOrigin: '0 0',
                  clipPath: motion.openClipPath,
                })
                .to(overlay, { autoAlpha: 1, duration: 0.55, ease: 'power1.out' }, 0)
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
                    duration: 0.95,
                  },
                  0,
                )
                .fromTo(
                  frame,
                  { clipPath: motion.openClipPath },
                  {
                    clipPath: motion.clipPath,
                    duration: 1,
                  },
                  0.12,
                )
              if (footer) {
                // Footer chrome belongs to the page chrome, not the preview window.
                tl.to(footer, { autoAlpha: 0, duration: 0.35, ease: 'power1.out' }, 0)
              }
              tl.fromTo(
                items,
                { autoAlpha: 0, y: desktop ? 16 : 12 },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.7,
                  ease: 'power2.out',
                  stagger: 0.05,
                },
                0.35,
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

          // Keep preview + nav aligned while resizing within the desktop band.
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
                  zIndex: 40,
                })
                next.progress(1)
              }
            }, 80)
          }
          window.addEventListener('resize', onResize)

          return () => {
            window.clearTimeout(resizeTimer)
            window.removeEventListener('resize', onResize)
            clearDesktopNavVars(overlay)
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
    const tl = tlRef.current
    const frame = getPageFrame()
    const overlay = overlayRef.current
    if (!tl || !frame || !overlay) return

    if (open) {
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
        zIndex: 40,
      })
      frame.scrollTop = scrollYRef.current
      frame.setAttribute('inert', '')
      // Lock on html (same element as scrollbar-gutter). With Lenis
      // autoToggle, this overflow change stops Lenis — do not also call
      // lenis.stop(), which would set overflow:clip and drop the gutter.
      document.documentElement.style.overflow = 'hidden'

      tl.eventCallback('onComplete', () => {
        overlay.querySelector<HTMLElement>('[data-menu-item] a')?.focus()
      })
      tl.play()
    } else if (tl.progress() > 0) {
      tl.eventCallback('onReverseComplete', () => {
        frame.removeAttribute('inert')
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
      const frame = getPageFrame()
      if (frame?.hasAttribute('inert')) {
        frame.removeAttribute('inert')
        clearFrameProps(frame)
        document.documentElement.style.overflow = ''
      }
    },
    [],
  )

  return (
    <div
      ref={overlayRef}
      id="site-menu"
      aria-hidden={!open}
      className="invisible fixed inset-0 z-30 bg-secondary opacity-0 pointer-events-none"
      // The page frame is inert while open, so it is skipped for hit-testing
      // and clicks on the page window land here — same as CLOSE.
      onClick={onClose}
    >
      <nav
        aria-label="Site menu"
        data-lenis-prevent
        // Mobile: lower half below the preview. Desktop: column from the shared
        // layout resolver (--menu-nav-*); link block centered in the column,
        // items left-aligned within the block.
        className="absolute inset-x-0 top-1/2 bottom-0 flex flex-col overflow-y-auto overscroll-contain px-8 pt-6 pb-8 md:inset-y-0 md:left-(--menu-nav-left) md:right-auto md:w-(--menu-nav-width) md:items-center md:justify-center md:overflow-visible md:px-0 md:pt-0 md:pb-0"
        onClick={(event) => event.stopPropagation()}
      >
        <ul className="my-auto flex flex-col items-start gap-4 md:my-0 md:w-max md:gap-5">
          {navItems.map(({ link }, i) => (
            <li
              key={i}
              data-menu-item
              className="flex items-baseline gap-4"
              onClickCapture={onClose}
            >
              <span className="font-mono text-[0.625rem] tracking-widest text-secondary-foreground/50">
                {String(i + 1).padStart(2, '0')}
              </span>
              <CMSLink
                {...link}
                appearance="inline"
                className="font-heading text-2xl font-medium tracking-tight text-secondary-foreground transition-colors hover:text-primary md:text-[clamp(1.75rem,2.6vw,2.25rem)]"
              />
            </li>
          ))}
          <li data-menu-item className="flex items-baseline gap-4" onClickCapture={onClose}>
            <span className="font-mono text-[0.625rem] tracking-widest text-secondary-foreground/50">
              {String(navItems.length + 1).padStart(2, '0')}
            </span>
            <Link
              href="/search"
              transitionTypes={[...lateralNavTransitionTypes]}
              className="group flex items-center gap-2 font-heading text-2xl font-medium tracking-tight text-secondary-foreground transition-colors hover:text-primary md:text-[clamp(1.75rem,2.6vw,2.25rem)]"
            >
              Search
              <IconArrowUpRight className="size-5 opacity-40 transition-opacity group-hover:opacity-100 md:size-6 lg:size-7" />
            </Link>
          </li>
        </ul>

        <div data-menu-item className="mt-8 flex items-center justify-between md:hidden">
          <Clock className="text-secondary-foreground" />
          <ThemeToggle className="text-secondary-foreground" />
        </div>
      </nav>
    </div>
  )
}
