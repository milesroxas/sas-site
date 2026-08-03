'use client'

import { useLenis } from 'lenis/react'
import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'

type ArchiveRailProps = {
  children: ReactNode
  className?: string
}

/**
 * Vertical scroll drives a horizontal filmstrip. A viewport-tall sticky pin
 * holds the row while the page scrolls through the overflow width — Lenis's
 * lerp supplies the smooth scrub.
 */
export function ArchiveRail({ children, className }: ArchiveRailProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const maxScrollRef = useRef(0)
  const [maxScroll, setMaxScroll] = useState(0)

  const measure = useCallback(() => {
    const pin = pinRef.current
    const track = trackRef.current
    if (!pin || !track) return

    const next = Math.max(0, track.scrollWidth - pin.clientWidth)
    maxScrollRef.current = next
    setMaxScroll((prev) => (prev === next ? prev : next))
  }, [])

  const scrub = useCallback(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const overflow = maxScrollRef.current
    if (!section || !track) return

    if (overflow <= 0) {
      track.style.transform = 'translate3d(0,0,0)'
      return
    }

    const stickyTop = getStickyTop()
    const progress = Math.min(
      1,
      Math.max(0, (stickyTop - section.getBoundingClientRect().top) / overflow),
    )
    track.style.transform = `translate3d(${-progress * overflow}px,0,0)`
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return

    measure()
    scrub()

    const pin = pinRef.current
    const track = trackRef.current
    const ro = new ResizeObserver(() => {
      measure()
      scrub()
    })
    if (pin) ro.observe(pin)
    if (track) ro.observe(track)
    window.addEventListener('resize', measure)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure, prefersReducedMotion, scrub, children])

  const lenis = useLenis(() => {
    if (prefersReducedMotion) return
    scrub()
  }, [prefersReducedMotion, scrub])

  useEffect(() => {
    if (prefersReducedMotion || lenis) return

    const onScroll = () => scrub()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lenis, prefersReducedMotion, scrub])

  if (prefersReducedMotion) {
    return (
      <div className={cn('no-scrollbar snap-x overflow-x-auto scroll-ps-gutter', className)}>
        <div className="flex w-max gap-6 ps-gutter pe-gutter md:gap-8 lg:gap-16">{children}</div>
      </div>
    )
  }

  const canScrub = maxScroll > 0

  return (
    <section
      aria-label="Post archive"
      className={cn('relative', className)}
      ref={sectionRef}
      style={
        canScrub
          ? ({
              // Pin viewport height + overflow distance so the scrub can finish
              // even when the archive is the last block on a short page.
              height: `calc(100svh - var(--header-height) - var(--footer-height) + ${maxScroll}px)`,
            } satisfies CSSProperties)
          : undefined
      }
    >
      <div
        className={cn(
          'overflow-hidden',
          canScrub &&
            'sticky top-(--header-height) flex h-[calc(100svh-var(--header-height)-var(--footer-height))] items-center',
        )}
        ref={pinRef}
      >
        <div
          className="flex w-max gap-6 ps-gutter pe-gutter will-change-transform md:gap-8 lg:gap-16"
          ref={trackRef}
        >
          {children}
        </div>
      </div>
    </section>
  )
}

function getStickyTop(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim()
  if (raw.endsWith('rem')) {
    const rem = Number.parseFloat(raw)
    if (!Number.isNaN(rem)) {
      return rem * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    }
  }
  const px = Number.parseFloat(raw)
  return Number.isNaN(px) ? 0 : px
}
