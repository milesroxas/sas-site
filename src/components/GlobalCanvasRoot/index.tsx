'use client'

import dynamic from 'next/dynamic'
import { useWebGLStore } from '@/lib/webgl/store'

/**
 * A real import boundary: the canvas module (and Three, R3F, drei with it)
 * is fetched only once a route activates the global canvas. The store is a
 * light zustand module, so a route that never mounts a WebGL consumer ships
 * no renderer chunk from this owner.
 */
const GlobalCanvas = dynamic(
  () => import('@/lib/webgl/components/global-canvas').then((module) => module.GlobalCanvas),
  { ssr: false },
)

/** Mount once in the root layout so WebGL routes can activate without remounting the GL context. */
export function GlobalCanvasRoot() {
  const isActivated = useWebGLStore((state) => state.isActivated)
  if (!isActivated) return null
  // Isolate the persistent canvas from page transitions (see view-transition.css)
  // so the live GL backdrop doesn't freeze + cross-fade on every navigation.
  return <GlobalCanvas className="vt-global-canvas" />
}
