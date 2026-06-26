'use client'

import { createContext, type PropsWithChildren, useContext, useLayoutEffect } from 'react'
import type tunnel from 'tunnel-rat'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import { useWebGLStore } from '@/lib/webgl/store'

export type CanvasContextValue = {
  WebGLTunnel?: ReturnType<typeof tunnel>
  DOMTunnel?: ReturnType<typeof tunnel>
}

export const CanvasContext = createContext<CanvasContextValue>({})

type CanvasProps = PropsWithChildren<{
  /**
   * Activates GlobalCanvas (mounted in root layout) and exposes tunnel context for this subtree.
   */
  root?: boolean
  /** Enable WebGL on devices flagged as low-power (coarse pointer, no hover). */
  force?: boolean
}>

export function Canvas({ children, root = false, force = false }: CanvasProps) {
  const { hasGPU } = useDeviceDetection()
  const shouldRender = root && (hasGPU || force)

  // Atomic selectors: a bare useWebGLStore() subscribes this provider to the whole
  // store, re-rendering the wrapped subtree on every active toggle (perf-zustand-selectors).
  const activate = useWebGLStore((s) => s.activate)
  const setActive = useWebGLStore((s) => s.setActive)
  const getWebGLTunnel = useWebGLStore((s) => s.getWebGLTunnel)
  const getDOMTunnel = useWebGLStore((s) => s.getDOMTunnel)

  const globalWebGLTunnel = shouldRender ? getWebGLTunnel() : null
  const globalDOMTunnel = shouldRender ? getDOMTunnel() : null

  useLayoutEffect(() => {
    if (!shouldRender) return
    activate()
    setActive(true)
    return () => setActive(false)
  }, [shouldRender, activate, setActive])

  const tunnelsReady = globalWebGLTunnel && globalDOMTunnel

  const contextValue: CanvasContextValue =
    shouldRender && tunnelsReady
      ? { WebGLTunnel: globalWebGLTunnel, DOMTunnel: globalDOMTunnel }
      : {}

  return <CanvasContext.Provider value={contextValue}>{children}</CanvasContext.Provider>
}

export function useCanvas(): CanvasContextValue {
  return useContext(CanvasContext)
}
