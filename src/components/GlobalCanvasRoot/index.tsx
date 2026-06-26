'use client'

import { LazyGlobalCanvas } from '@/lib/webgl/components/global-canvas'

/** Mount once in the root layout so WebGL routes can activate without remounting the GL context. */
export function GlobalCanvasRoot() {
  // Isolate the persistent canvas from page transitions (see view-transition.css)
  // so the live GL backdrop doesn't freeze + cross-fade on every navigation.
  return <LazyGlobalCanvas className="vt-global-canvas" />
}
