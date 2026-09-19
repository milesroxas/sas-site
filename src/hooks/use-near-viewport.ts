'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * Whether the element is near the viewport. Starts `false`: callers wait
 * until visibility is known rather than assuming it, and without an observer
 * (jsdom) it stays `false`.
 *
 * `once` latches on the first approach and stops observing: for work that is
 * loaded when the element comes near and never unloaded (a lazy chunk), as
 * opposed to work that pauses whenever it leaves (a live canvas).
 */
export function useNearViewport(
  ref: RefObject<HTMLElement | null>,
  margin = '10%',
  { once = false }: { once?: boolean } = {},
): boolean {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver !== 'function') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry?.isIntersecting ?? false
        if (once && !intersecting) return
        setNear(intersecting)
        if (once) observer.disconnect()
      },
      { rootMargin: margin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, margin, once])
  return near
}
