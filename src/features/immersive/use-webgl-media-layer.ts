'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import { GPU_PRIORITY } from '@/lib/webgl/gpu-budget'
import { useGpuLease } from '@/lib/webgl/use-gpu-lease'

/**
 * Readiness wiring for the DOM-first / WebGL-on-top media pattern (home hero,
 * IndustryWork media): the ordinary DOM element paints first and stays mounted
 * as the fallback (reduced motion, absent GPUs, lost contexts, a full GPU
 * budget), then a WebGL canvas loading the same `src` cross-fades in once its
 * first texture is on the GPU. `enabled` gates the canvas on GPU support, a
 * usable source, an optional `active` flag (defer the canvas while a
 * clip/scale reveal is still compositing), admission on the document GPU
 * budget (a `lens` lease at the owner's `priority`), and no context loss so
 * far; `ready` flips via `handleReady` (wire it to the canvas's `onReady`)
 * and is true only for the `src` that last announced, so a source swap (or
 * a disabled canvas) never reveals an empty WebGL buffer: sampling an
 * unbound `uMap` paints opaque black.
 *
 * `ready` resets when `active` goes false: unmounting the canvas mid-motion
 * must not remount it at full opacity before the next texture is on the GPU.
 *
 * Wire `handleContextLost` to the canvas's `onContextLost`: a real loss (a
 * GPU reset, never R3F's teardown) disables the layer for this owner's life,
 * so the DOM media is what stays on screen. No retry; the next mount is a
 * fresh attempt.
 */
export function useWebglMediaLayer(
  src: string | undefined,
  active = true,
  priority: number = GPU_PRIORITY.block,
): {
  enabled: boolean
  ready: boolean
  handleReady: () => void
  handleContextLost: () => void
} {
  const { hasGPU } = useDeviceDetection()
  const [readySrc, setReadySrc] = useState<string | undefined>(undefined)
  const [lost, setLost] = useState(false)
  const wanted = active && hasGPU && Boolean(src) && !lost
  const id = useId()
  const enabled = useGpuLease(id, wanted, 'lens', priority)
  const ready = enabled && readySrc === src

  useEffect(() => {
    if (!enabled) setReadySrc(undefined)
  }, [enabled])

  const handleReady = useCallback(() => {
    if (src) setReadySrc(src)
  }, [src])

  const handleContextLost = useCallback(() => setLost(true), [])

  return { enabled, ready, handleReady, handleContextLost }
}
