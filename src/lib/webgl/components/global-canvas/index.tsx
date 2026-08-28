'use client'

import { OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import cn from 'clsx'
import dynamic from 'next/dynamic'
import { Suspense, useMemo, useState } from 'react'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'
import { useWebGLStore } from '@/lib/webgl/store'
import { createRenderer } from '@/lib/webgl/utils/create-renderer'
import { detectGPUCapability } from '@/lib/webgl/utils/gpu-detection'
import { Preload } from '../preload'
import { RAF } from '../raf'
import s from './global-canvas.module.css'

const CAMERA_POSITION: [number, number, number] = [0, 0, 5000]
// Hoisted so JSX never allocates a fresh object per render (perf-avoid-inline-objects).
const RESIZE_OPTIONS = { ...CANVAS_RESIZE, scroll: false, debounce: 500 } as const

// Dev-only stats overlay (drei's stats-gl). Lazy + NODE_ENV-gated so the panel is
// tree-shaken from the production bundle. r3f-perf is avoided here: its bundled
// binary woff asset fails to compile under Turbopack.
const StatsGl =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('@react-three/drei').then((m) => m.StatsGl), { ssr: false })
    : null

export type GlobalCanvasProps = {
  render?: boolean
  alpha?: boolean
  className?: string
  forceWebGL?: boolean
}

export function GlobalCanvas({
  render = true,
  alpha = true,
  className,
  forceWebGL = false,
}: GlobalCanvasProps) {
  // Atomic selectors instead of a whole-store subscription (perf-zustand-selectors);
  // the tunnel getters are stable module fns, so selecting them never re-renders.
  const isActivated = useWebGLStore((st) => st.isActivated)
  const isActive = useWebGLStore((st) => st.isActive)
  const getWebGLTunnel = useWebGLStore((st) => st.getWebGLTunnel)
  const getDOMTunnel = useWebGLStore((st) => st.getDOMTunnel)
  const [rendererType, setRendererType] = useState<'webgpu' | 'webgl' | null>(null)

  const capability = detectGPUCapability()
  const dpr = useMemo<[number, number]>(() => [1, capability.dpr], [capability.dpr])

  if (!isActivated) {
    return null
  }

  if (!capability.hasGPU) {
    if (process.env.NODE_ENV === 'development') {
      console.info('No GPU detected. WebGL/WebGPU canvas disabled.')
    }
    return null
  }

  const WebGLTunnel = getWebGLTunnel()
  const DOMTunnel = getDOMTunnel()
  const shouldRender = render && isActive

  return (
    <div
      className={cn(s.globalCanvas, className)}
      style={{
        visibility: isActive ? 'visible' : 'hidden',
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <Canvas
        gl={async (props) => {
          const { renderer, type } = await createRenderer({
            canvas: props.canvas as HTMLCanvasElement,
            alpha,
            antialias: capability.dpr < 2,
            powerPreference: 'high-performance',
            stencil: true,
            depth: true,
            forceWebGL,
          })
          setRendererType(type)
          return renderer
        }}
        dpr={dpr}
        orthographic
        frameloop="never"
        linear
        flat
        {...(typeof document !== 'undefined' && {
          eventSource: document.documentElement,
        })}
        eventPrefix="client"
        resize={RESIZE_OPTIONS}
        style={{ pointerEvents: isActive ? 'all' : 'none' }}
      >
        <OrthographicCamera
          makeDefault
          position={CAMERA_POSITION}
          near={0.001}
          far={10000}
          zoom={1}
        />
        <RAF render={shouldRender} />
        <Suspense>
          <WebGLTunnel.Out />
        </Suspense>
        <Preload />
        {/* stats-gl reads the WebGL context; skip under the WebGPU path (use forceWebGL to inspect). */}
        {StatsGl && rendererType === 'webgl' && <StatsGl trackGPU />}
      </Canvas>
      <DOMTunnel.Out />
      {process.env.NODE_ENV === 'development' && rendererType && (
        <div className={s.rendererBadge}>{rendererType === 'webgpu' ? 'WebGPU' : 'WebGL'}</div>
      )}
    </div>
  )
}

export const LazyGlobalCanvas = dynamic(() => Promise.resolve({ default: GlobalCanvas }), {
  ssr: false,
})
