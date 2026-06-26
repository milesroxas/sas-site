'use client'

import { OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import cn from 'clsx'
import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import { useWebGLStore } from '@/lib/webgl/store'
import { createRenderer } from '@/lib/webgl/utils/create-renderer'
import { detectGPUCapability } from '@/lib/webgl/utils/gpu-detection'
import { Preload } from '../preload'
import { RAF } from '../raf'
import s from './global-canvas.module.css'

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
  const { isActivated, isActive, getWebGLTunnel, getDOMTunnel } = useWebGLStore()
  const [rendererType, setRendererType] = useState<'webgpu' | 'webgl' | null>(null)

  const capability = detectGPUCapability()

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
        dpr={[1, capability.dpr]}
        orthographic
        frameloop="never"
        linear
        flat
        {...(typeof document !== 'undefined' && {
          eventSource: document.documentElement,
        })}
        eventPrefix="client"
        resize={{ scroll: false, debounce: 500 }}
        style={{ pointerEvents: isActive ? 'all' : 'none' }}
      >
        <OrthographicCamera makeDefault position={[0, 0, 5000]} near={0.001} far={10000} zoom={1} />
        <RAF render={shouldRender} />
        <Suspense>
          <WebGLTunnel.Out />
        </Suspense>
        <Preload />
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
