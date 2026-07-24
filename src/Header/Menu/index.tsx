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
 * page-frame wrapper in (frontend)/layout.tsx — into a scaled-down card.
 * Desktop: docked left while menu items stagger in on the right.
 * Mobile: crops from the live viewport into a 16:9 window under the header.
 */
const PAGE_FRAME_SELECTOR = '[data-page-frame]'

const getPageFrame = () => document.querySelector<HTMLElement>(PAGE_FRAME_SELECTOR)

// --header-height is authored in rem, so convert against the root font size.
const mobileCardOffset = () => {
  const styles = getComputedStyle(document.documentElement)
  const headerRem = Number.parseFloat(styles.getPropertyValue('--header-height')) || 0
  return headerRem * Number.parseFloat(styles.fontSize) + 12
}

/** Final mobile page-preview card: padded 16:9 window under the header. */
const getMobileCardMetrics = () => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const padX = 20
  const width = vw - padX * 2
  const height = width * (9 / 16)
  return { vw, vh, padX, width, height, top: mobileCardOffset() }
}

const MOBILE_CARD_SHADOW = '0 0 0 1px oklch(50% 0 0 / 30%), 0 24px 64px oklch(0 0 0 / 35%)'

const clearFrameProps = (frame: HTMLElement) => {
  gsap.set(frame, { clearProps: 'all' })
  gsap.set(frame.children, {
    clearProps: 'transform,flexShrink,minHeight,opacity,visibility',
  })
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
      const footer = frame.querySelector<HTMLElement>('[data-site-footer]')
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

          let tl: gsap.core.Timeline
          if (!motionOK) {
            // Reduced motion: crossfade only — no scaling, no movement.
            tl = gsap.timeline({ paused: true, defaults: { duration: 0.2, ease: 'none' } })
            tl.set(overlay, { pointerEvents: 'auto' })
              .to(overlay, { autoAlpha: 1 }, 0)
              .fromTo(items, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)

            if (!desktop) {
              const { padX, width, height, top } = getMobileCardMetrics()
              tl.set(
                frame,
                {
                  width,
                  height,
                  top,
                  left: padX,
                  borderRadius: 20,
                  boxShadow: MOBILE_CARD_SHADOW,
                  overflow: 'hidden',
                },
                0,
              )
              if (footer) tl.set(footer, { autoAlpha: 0 }, 0)
            }
          } else if (desktop) {
            tl = gsap.timeline({
              paused: true,
              defaults: { ease: 'power4.inOut', duration: 0.7 },
            })
            tl.set(overlay, { pointerEvents: 'auto' })
              .to(overlay, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0)
              .to(
                frame,
                {
                  scale: 0.45,
                  x: 48,
                  transformOrigin: 'left center',
                  borderRadius: 24,
                  // Neutral hairline ring keeps the card edge legible on both themes.
                  boxShadow: '0 0 0 1px oklch(50% 0 0 / 30%), 0 32px 96px oklch(0 0 0 / 35%)',
                },
                0,
              )
              .fromTo(
                items,
                { autoAlpha: 0, y: 28 },
                { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.07 },
                0.22,
              )
          } else {
            // Mobile: the page frame is a clipping window. Width/height animate
            // from the live viewport aspect into a 16:9 card; overflow:hidden is
            // the mask. Inner content drifts slower than the crop for parallax.
            const { vw, vh, padX, width, height, top } = getMobileCardMetrics()
            const inner = gsap.utils
              .toArray<HTMLElement>(frame.children)
              .filter((el) => el !== footer)

            tl = gsap.timeline({
              paused: true,
              defaults: { ease: 'power4.inOut', duration: 0.65 },
            })
            tl.set(overlay, { pointerEvents: 'auto' })
              .to(overlay, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0)
              .fromTo(
                frame,
                {
                  width: vw,
                  height: vh,
                  top: 0,
                  left: 0,
                  borderRadius: 0,
                  boxShadow: '0 0 0 0 transparent',
                },
                {
                  width,
                  height,
                  top,
                  left: padX,
                  borderRadius: 20,
                  boxShadow: MOBILE_CARD_SHADOW,
                },
                0,
              )
              .fromTo(
                inner,
                { y: 0 },
                {
                  // Drift against the closing crop so the preview reads as a
                  // window sliding over the page, not a uniform shrink.
                  y: -(vh - height) * 0.28,
                  ease: 'power2.inOut',
                },
                0,
              )
            if (footer) {
              // Footer chrome belongs to the page chrome, not the preview window.
              tl.to(footer, { autoAlpha: 0, duration: 0.2, ease: 'power2.out' }, 0)
            }
            tl.fromTo(
              items,
              { autoAlpha: 0, y: 24 },
              { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.06 },
              0.16,
            )
          }

          tlRef.current = tl
          // Breakpoint or motion-preference change while open (e.g. phone
          // rotation crossing md): jump the rebuilt timeline to its end so the
          // menu stays open instead of stranding an inert, invisible page.
          if (openRef.current) tl.progress(1)
          return () => {
            tl.kill()
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
      // Freeze the page at its current scroll position inside a fixed,
      // clipped frame so the mask reads as a window over the current view.
      scrollYRef.current = window.scrollY
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      gsap.set(frame, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: viewportWidth,
        height: viewportHeight,
        // Override min-h-svh so the mobile height tween can crop the window.
        minHeight: 0,
        overflow: 'hidden',
        zIndex: 40,
        // Containing block for the fixed footer (same as a scale transform).
        transform: 'translate3d(0,0,0)',
      })
      // Keep in-flow children at viewport size so height animation masks
      // instead of flex-shrinking the page layout.
      gsap.set(
        Array.from(frame.children).filter((el) => !el.hasAttribute('data-site-footer')),
        { flexShrink: 0, minHeight: viewportHeight },
      )
      frame.scrollTop = scrollYRef.current
      frame.setAttribute('inert', '')
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
      // and clicks on the scaled page card land here — same as CLOSE.
      onClick={onClose}
    >
      <nav
        aria-label="Site menu"
        // Mobile: lower half of the screen, below the 16:9 page window;
        // scrollable when nav items outgrow short viewports.
        className="absolute inset-x-0 top-1/2 bottom-0 flex flex-col overflow-y-auto overscroll-contain px-8 pt-6 pb-8 md:inset-y-0 md:left-auto md:w-1/2 md:overflow-visible md:pt-0 md:pb-0 md:pr-[8vw]"
        onClick={(event) => event.stopPropagation()}
      >
        <ul className="my-auto flex flex-col gap-4 md:gap-5">
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
                className="font-heading text-2xl font-medium tracking-tight text-secondary-foreground transition-colors hover:text-primary md:text-4xl"
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
              className="group flex items-center gap-2 font-heading text-2xl font-medium tracking-tight text-secondary-foreground transition-colors hover:text-primary md:text-4xl"
            >
              Search
              <IconArrowUpRight className="size-5 opacity-40 transition-opacity group-hover:opacity-100 md:size-7" />
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
