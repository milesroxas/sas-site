'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDeviceDetection } from '@/hooks/use-device-detection'

/**
 * Readiness wiring for the DOM-first / WebGL-on-top media pattern (home hero,
 * IndustryWork media): the ordinary DOM element paints first and stays mounted
 * as the fallback (reduced motion, absent GPUs, lost contexts), then a WebGL
 * canvas loading the same `src` cross-fades in once its first texture is on
 * the GPU. `enabled` gates the canvas on GPU support and a usable source;
 * `ready` flips via `handleReady` (wire it to the canvas's `onReady`) and
 * resets whenever the canvas is disabled, so the DOM layer is the one showing
 * whenever WebGL can't be.
 *
 * `ready` deliberately survives source swaps: the texture hooks keep the
 * previous frame on screen until the next media is on the GPU, so dropping
 * back to the DOM layer mid-swap would only flash.
 */
export function useWebglMediaLayer(src: string | undefined): {
  enabled: boolean
  ready: boolean
  handleReady: () => void
} {
  const { hasGPU } = useDeviceDetection()
  const [ready, setReady] = useState(false)
  const enabled = hasGPU && Boolean(src)

  useEffect(() => {
    if (!enabled) setReady(false)
  }, [enabled])

  const handleReady = useCallback(() => setReady(true), [])

  return { enabled, ready, handleReady }
}
