'use client'

import type { LenisOptions } from 'lenis'
import type React from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { SmoothScroll } from '@/lib/interactions/smooth-scroll'

function shouldPreventLenisSmooth(node: HTMLElement | null): boolean {
  if (!node) return false
  if (node.dataset.lenisPrevent !== undefined) return true
  if (node.closest('[data-lenis-prevent]')) return true
  if (node.closest('[role="dialog"]')) return true
  if (node.nodeName === 'VERCEL-LIVE-FEEDBACK') return true
  return false
}

/** Defaults tuned for full-site scroll: touch sync, tempus RAF, and safe prevent targets. */
export const rootLenisOptions: LenisOptions = {
  lerp: 0.09,
  wheelMultiplier: 1,
  touchMultiplier: 1.15,
  syncTouch: true,
  smoothWheel: true,
  anchors: true,
  autoToggle: true,
  prevent: (node) => shouldPreventLenisSmooth(node),
}

export const SmoothScrollProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) {
    return <>{children}</>
  }

  return (
    <SmoothScroll root options={rootLenisOptions}>
      {children}
    </SmoothScroll>
  )
}
