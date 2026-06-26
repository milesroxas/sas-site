'use client'

import { LazyGlobalCanvas } from '@/lib/webgl/components/global-canvas'

/** Mount once in the root layout so WebGL routes can activate without remounting the GL context. */
export function GlobalCanvasRoot() {
  return <LazyGlobalCanvas />
}
