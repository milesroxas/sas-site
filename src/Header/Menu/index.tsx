'use client'

import { useGSAP } from '@gsap/react'
import { IconArrowUpRight } from '@tabler/icons-react'
import gsap from 'gsap'
import Link from 'next/link'
import type React from 'react'
import { useEffect, useRef } from 'react'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition'

gsap.registerPlugin(useGSAP)

/**
 * The takeover menu animates the element carrying this attribute — the
 * page-frame wrapper in (frontend)/layout.tsx — into a scaled-down card.
 * Desktop: docked left while menu items stagger in on the right.
 * Mobile: docked top-center below the header while items fill the lower half.
 */
const PAGE_FRAME_SELECTOR = '[data-page-frame]'

const getPageFrame = () => document.querySelector<HTMLElement>(PAGE_FRAME_SELECTOR)

// --header-height is authored in rem, so convert against the root font size.
const mobileCardOffset = () => {
  const styles = getComputedStyle(document.documentElement)
  const headerRem = Number.parseFloat(styles.getPropertyValue('--header-height')) || 0
  return headerRem * Number.parseFloat(styles.fontSize) + 12
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
            // Mobile: the page docks as a card under the header instead of
            // beside the menu — a side-by-side card can't fit a phone width.
            // Radius/shadow are set once rather than tweened so per-frame work
            // stays transform-only; the shadow starts outside the viewport, so
            // there is no visible pop.
            tl = gsap.timeline({
              paused: true,
              defaults: { ease: 'power4.inOut', duration: 0.6 },
            })
            tl.set(overlay, { pointerEvents: 'auto' })
              .set(frame, {
                borderRadius: 20,
                boxShadow: '0 0 0 1px oklch(50% 0 0 / 30%), 0 24px 64px oklch(0 0 0 / 35%)',
              })
              .to(overlay, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0)
              .to(frame, { scale: 0.35, y: mobileCardOffset, transformOrigin: 'center top' }, 0)
              .fromTo(
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
      // clipped frame so the scale transform reads as a card of the
      // current view rather than the whole document.
      scrollYRef.current = window.scrollY
      gsap.set(frame, { position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 40 })
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
        gsap.set(frame, { clearProps: 'all' })
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
        gsap.set(frame, { clearProps: 'all' })
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
    >
      <nav
        aria-label="Site menu"
        // Mobile: lower half of the screen, below the docked page card;
        // scrollable when nav items outgrow short viewports.
        className="absolute inset-x-0 top-1/2 bottom-0 flex flex-col overflow-y-auto overscroll-contain px-8 pt-6 pb-8 md:inset-y-0 md:left-auto md:w-1/2 md:overflow-visible md:pt-0 md:pb-0 md:pr-[8vw]"
      >
        <ul className="my-auto flex flex-col gap-5">
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
                className="font-heading text-3xl font-medium tracking-tight text-secondary-foreground transition-colors hover:text-primary md:text-4xl"
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
              className="group flex items-center gap-2 font-heading text-3xl font-medium tracking-tight text-secondary-foreground transition-colors hover:text-primary md:text-4xl"
            >
              Search
              <IconArrowUpRight className="size-7 opacity-40 transition-opacity group-hover:opacity-100" />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
