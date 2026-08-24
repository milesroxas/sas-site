'use client'

import type { LenisOptions } from 'lenis'
import 'lenis/dist/lenis.css'
import type { LenisRef } from 'lenis/react'
import { ReactLenis } from 'lenis/react'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useTempus } from 'tempus/react'

export type SmoothScrollProps = {
  root?: boolean
  options?: LenisOptions
  children?: ReactNode
}

/** Lenis advanced on the tempus clock (`autoRaf: false`) so it can share timing with WebGL RAF. */
export function SmoothScroll({ root = true, options = {}, children }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef>(null)

  useTempus(({ time }) => {
    lenisRef.current?.lenis?.raf(time)
  })

  return (
    <ReactLenis
      ref={lenisRef}
      root={root}
      options={{
        ...options,
        // Lenis prefers `lerp` over `duration` when both are set — only apply
        // the lerp fallback when the caller tuned neither.
        ...(options.lerp === undefined && options.duration === undefined ? { lerp: 0.16 } : {}),
        autoRaf: false,
        anchors: true,
        autoToggle: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
