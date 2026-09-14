'use client'

import { useThree } from '@react-three/fiber'
import { useEffect, useId } from 'react'
import { type GpuLeaseKind, trackGpuContext } from '@/lib/webgl/gpu-budget'

/** The WebGPU renderer's loss hook; the classic renderer has none. */
type DeviceLossHost = { onDeviceLost: (info: unknown) => void }

const hasDeviceLossHook = (renderer: object): renderer is DeviceLossHost =>
  'onDeviceLost' in renderer && typeof renderer.onDeviceLost === 'function'

/**
 * One subscriber per Canvas: it registers the live context in the document
 * census for as long as the renderer exists, and reports a real loss of that
 * context (`webglcontextlost`, or the WebGPU device-lost hook) to its owner.
 *
 * Loss is a failure only while the Canvas is alive. R3F tears an unmounted
 * canvas down with `forceContextLoss()` about 500ms after unmount, which
 * fires the same event; a listener left behind would report a routine
 * release, such as a suspension or a route change, as a loss. As a child of
 * the Canvas this effect's cleanup runs with the tree, before that synthetic
 * loss arrives, and it costs the owner no state and no re-render.
 *
 * The loss is not prevented: owners fall back to their DOM layer and stop.
 * A restored context would resume a loop the owner explicitly gave up.
 */
export function ContextGuard({ kind, onLost }: { kind: GpuLeaseKind; onLost?: () => void }) {
  const id = useId()
  const gl = useThree((state) => state.gl)
  useEffect(() => trackGpuContext(id, kind), [id, kind])
  useEffect(() => {
    if (!onLost) return
    const canvas = gl.domElement
    canvas.addEventListener('webglcontextlost', onLost)
    if (!hasDeviceLossHook(gl)) return () => canvas.removeEventListener('webglcontextlost', onLost)
    const previous = gl.onDeviceLost
    gl.onDeviceLost = (info) => {
      previous.call(gl, info)
      onLost()
    }
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost)
      gl.onDeviceLost = previous
    }
  }, [gl, onLost])
  return null
}
