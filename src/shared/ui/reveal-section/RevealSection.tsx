'use client'

import cn from 'clsx'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

export type RevealSectionProps = {
  children: ReactNode
  /** Extra delay after intersect (for staggered lists). */
  delayMs?: number
  /** IntersectionObserver root margin (e.g. trigger before fully in view). */
  rootMargin?: string
  /** Keep listening for re-entry (e.g. carousels). Default: fire once. */
  once?: boolean
} & HTMLAttributes<HTMLElement>

/**
 * Scroll-driven section entrance: opacity + translate with reduced-motion fallback.
 */
export function RevealSection({
  children,
  className,
  style,
  delayMs = 0,
  rootMargin = '0px 0px -12% 0px',
  once = true,
  ...rest
}: RevealSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { rootMargin, threshold: [0, 0.08, 0.15] },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [once, rootMargin, prefersReducedMotion])

  return (
    <section
      ref={ref}
      className={cn('reveal-section', className)}
      {...(visible ? { 'data-visible': 'true' as const } : {})}
      style={
        {
          ...style,
          ...(delayMs ? { '--reveal-delay': `${delayMs}ms` } : {}),
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </section>
  )
}
