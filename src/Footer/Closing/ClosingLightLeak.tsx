'use client'

import { useEffect, useState } from 'react'
import { LightLeak } from '@/features/immersive'
import { FOOTER_CLOSING_GATE_SELECTOR } from './curtain'

/**
 * The band's film light leak, mounted only while the curtain is open.
 *
 * `LightLeak` parks its own render loop when its box scrolls off screen — but
 * this band is pinned to the viewport from the first paint, so that gate never
 * fires and the shader would burn frames for the whole session behind an
 * opaque article. The band's flow marker knows better: it enters the fold when
 * the band starts to uncover, and the extended root keeps it counted for a
 * screen past that, which covers the rest of the page. Scroll a screen back up
 * and the canvas goes away again.
 *
 * No visual surface of its own — the leak's look is `LightLeak`'s defaults, and
 * the band's story (`Features/FooterClosing`) renders it in place.
 */
export function ClosingLightLeak() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const marker = document.querySelector(FOOTER_CLOSING_GATE_SELECTOR)
    // No marker (a story or test that renders the band bare): nothing can
    // cover the band, so the leak belongs on screen.
    if (!marker) {
      setOpen(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => setOpen(entry?.isIntersecting ?? true), {
      rootMargin: '100% 0px 10% 0px',
    })
    observer.observe(marker)
    return () => observer.disconnect()
  }, [])

  return open ? <LightLeak /> : null
}
