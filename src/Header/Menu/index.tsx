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
 * page-frame wrapper in (frontend)/layout.tsx — into a scaled-down card
 * docked to the left of the viewport while menu items stagger in on the right.
 */
const PAGE_FRAME_SELECTOR = '[data-page-frame]'

const getPageFrame = () => document.querySelector<HTMLElement>(PAGE_FRAME_SELECTOR)

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
  const navItems = data?.navItems || []

  useGSAP(
    () => {
      const overlay = overlayRef.current
      const frame = getPageFrame()
      if (!overlay || !frame) return

      const items = gsap.utils.toArray<HTMLElement>('[data-menu-item]', overlay)
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
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
        tlRef.current = tl
        return () => {
          tl.kill()
          tlRef.current = null
        }
      })

      // Reduced motion: crossfade only — no scaling, no movement.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        const tl = gsap.timeline({ paused: true, defaults: { duration: 0.2, ease: 'none' } })
        tl.set(overlay, { pointerEvents: 'auto' })
          .to(overlay, { autoAlpha: 1 }, 0)
          .fromTo(items, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
        tlRef.current = tl
        return () => {
          tl.kill()
          tlRef.current = null
        }
      })
    },
    { scope: overlayRef },
  )

  useEffect(() => {
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
        className="absolute inset-y-0 right-0 flex w-full flex-col justify-center pr-[8vw] pl-8 md:w-1/2"
      >
        <ul className="flex flex-col gap-5">
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
                className="font-heading text-4xl font-medium tracking-tight text-secondary-foreground transition-colors hover:text-primary md:text-5xl"
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
              className="group flex items-center gap-2 font-heading text-4xl font-medium tracking-tight text-secondary-foreground transition-colors hover:text-primary md:text-5xl"
            >
              Search
              <IconArrowUpRight className="size-8 opacity-40 transition-opacity group-hover:opacity-100" />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
