'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

/**
 * Outgoing-set fade before the filtered set enters. Pairs with the
 * `.filter-swap` transition in globals.css — exit stays faster than enter.
 */
export const FILTER_SWAP_EXIT_MS = 150

/** Cap the enter stagger so late items don't trail on big result sets. */
export const FILTER_SWAP_MAX_STAGGER_STEPS = 8

/**
 * State machine behind an in-place filter change: `apply` records the new
 * selection immediately (controls repaint on the spot) while `rendered` — what
 * the result set currently shows — lags by the exit fade, so the outgoing set
 * fades before the incoming one staggers in. Reduced motion swaps in place.
 * `hasFiltered` separates the first paint (scroll-reveal stagger) from swaps
 * (the faster `.filter-swap-item` enter).
 */
export function useFilterSwap<T>(initial: T) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [selected, setSelected] = useState(initial)
  /** What the result set currently shows — lags `selected` by the exit fade. */
  const [rendered, setRendered] = useState(initial)
  const [exiting, setExiting] = useState(false)
  const [hasFiltered, setHasFiltered] = useState(false)
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (swapTimer.current) clearTimeout(swapTimer.current)
    },
    [],
  )

  const apply = (next: T) => {
    setSelected(next)
    setHasFiltered(true)
    if (swapTimer.current) clearTimeout(swapTimer.current)
    if (prefersReducedMotion) {
      setExiting(false)
      setRendered(next)
      return
    }
    setExiting(true)
    swapTimer.current = setTimeout(() => {
      setRendered(next)
      setExiting(false)
    }, FILTER_SWAP_EXIT_MS)
  }

  return { selected, rendered, exiting, hasFiltered, apply }
}
