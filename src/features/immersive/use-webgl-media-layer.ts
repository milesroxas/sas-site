'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDeviceDetection } from '@/hooks/use-device-detection'

/**
 * Readiness wiring for the DOM-first / WebGL-on-top media pattern (home hero,
 * IndustryWork media): the ordinary DOM element paints first and stays mounted
 * as the fallback (reduced motion, absent GPUs, lost contexts), then a WebGL
 * canvas loading the same `src` cross-fades in once its first texture is on
 * the GPU. `enabled` gates the canvas on GPU support, a usable source, and
 * an optional `active` flag (defer the canvas while a clip/scale reveal is
 * still compositing); `ready` flips via `handleReady` (wire it to the
 * canvas's `onReady`) and is true only for the `src` that last announced,
 * so a source swap (or a disabled canvas) never reveals an empty WebGL
 * buffer — sampling an unbound `uMap` paints opaque black.
 *
 * `ready` resets when `active` goes false: unmounting the canvas mid-motion
 * must not remount it at full opacity before the next texture is on the GPU.
 */
export function useWebglMediaLayer(
  src: string | undefined,
  active = true,
): {
  enabled: boolean
  ready: boolean
  handleReady: () => void
} {
  const { hasGPU } = useDeviceDetection()
  const [readySrc, setReadySrc] = useState<string | undefined>(undefined)
  const enabled = active && hasGPU && Boolean(src)
  const ready = enabled && readySrc === src

  useEffect(() => {
    if (!enabled) setReadySrc(undefined)
  }, [enabled])

  const handleReady = useCallback(() => {
    if (src) setReadySrc(src)
  }, [src])

  return { enabled, ready, handleReady }
}
