'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * Keeps an element mounted until its CSS exit has finished.
 *
 * The enter is `@starting-style`, the exit is an ordinary transition off
 * `data-open`, so both are interruptible and CSS stays the only timing source.
 * The running transitions are read through `getAnimations` rather than a
 * timer: reduced motion swaps the transition list and nothing here changes.
 * Reopening mid-exit cancels the pending unmount and the transition retargets
 * from where it is.
 *
 * `animating` is true for the length of either run, for a `will-change` that
 * lasts exactly as long as the tween (docs/animations.md).
 */
export function usePresence(ref: RefObject<HTMLElement | null>, open: boolean) {
  const [mounted, setMounted] = useState(open)
  const [animating, setAnimating] = useState(false)
  if (open && !mounted) setMounted(true)

  // `mounted` is a dependency so the enter is observed once the node exists.
  useEffect(() => {
    const element = ref.current
    if (!mounted || !element) return
    // No Web Animations (jsdom, very old engines): nothing to wait for.
    const running =
      typeof element.getAnimations === 'function' ? element.getAnimations({ subtree: true }) : []
    let cancelled = false
    const settle = () => {
      if (cancelled) return
      setAnimating(false)
      if (!open) setMounted(false)
    }
    if (running.length === 0) {
      settle()
    } else {
      setAnimating(true)
      Promise.allSettled(running.map((animation) => animation.finished)).then(settle)
    }
    return () => {
      cancelled = true
    }
  }, [ref, open, mounted])

  return { mounted, animating }
}
