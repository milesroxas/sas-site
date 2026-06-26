import type { WebGLRenderer } from 'three'
import { detectGPUCapability, isWebGPUAvailable } from './gpu-detection'

export type RendererType = 'webgpu' | 'webgl'

export type CreateRendererOptions = {
  canvas: HTMLCanvasElement
  alpha?: boolean
  antialias?: boolean
  powerPreference?: 'high-performance' | 'low-power'
  precision?: 'highp' | 'mediump' | 'lowp'
  stencil?: boolean
  depth?: boolean
  forceWebGL?: boolean
}

export type RendererResult = {
  renderer: WebGLRenderer
  type: RendererType
  isWebGPU: boolean
}

export async function createRenderer(options: CreateRendererOptions): Promise<RendererResult> {
  const {
    canvas,
    alpha = true,
    antialias = true,
    powerPreference = 'high-performance',
    precision = 'highp',
    stencil = false,
    depth = true,
    forceWebGL = false,
  } = options

  const capability = detectGPUCapability()

  if (!forceWebGL && isWebGPUAvailable() && !capability.isLowPower) {
    try {
      const { WebGPURenderer } = await import('three/webgpu')

      const renderer = new WebGPURenderer({
        canvas,
        alpha,
        antialias: antialias && capability.dpr < 2,
        powerPreference,
        forceWebGL: false,
      })

      await renderer.init()

      if (process.env.NODE_ENV === 'development') {
        console.info('Using WebGPU renderer')
      }

      return {
        renderer: renderer as unknown as WebGLRenderer,
        type: 'webgpu',
        isWebGPU: true,
      }
    } catch (error) {
      console.warn('WebGPU renderer failed, falling back to WebGL:', error)
    }
  }

  const { WebGLRenderer } = await import('three')

  const renderer = new WebGLRenderer({
    canvas,
    alpha,
    antialias: antialias && capability.dpr < 2,
    powerPreference,
    precision,
    stencil,
    depth,
  })

  if (process.env.NODE_ENV === 'development') {
    console.info('Using WebGL renderer')
  }

  return {
    renderer,
    type: 'webgl',
    isWebGPU: false,
  }
}
