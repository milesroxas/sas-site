export type GPUCapability = {
  hasWebGPU: boolean
  hasWebGL2: boolean
  hasWebGL1: boolean
  hasGPU: boolean
  preferredRenderer: 'webgpu' | 'webgl2' | 'webgl1' | 'none'
  dpr: number
  isLowPower: boolean
}

let cachedCapability: GPUCapability | null = null

export function detectGPUCapability(): GPUCapability {
  if (cachedCapability) {
    return cachedCapability
  }

  if (typeof window === 'undefined') {
    return {
      hasWebGPU: false,
      hasWebGL2: false,
      hasWebGL1: false,
      hasGPU: false,
      preferredRenderer: 'none',
      dpr: 1,
      isLowPower: false,
    }
  }

  const hasWebGPU = 'gpu' in navigator

  let hasWebGL2 = false
  try {
    const canvas = document.createElement('canvas')
    hasWebGL2 = !!canvas.getContext('webgl2')
  } catch {
    hasWebGL2 = false
  }

  let hasWebGL1 = false
  try {
    const canvas = document.createElement('canvas')
    hasWebGL1 = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    hasWebGL1 = false
  }

  let preferredRenderer: GPUCapability['preferredRenderer'] = 'none'
  if (hasWebGPU) {
    preferredRenderer = 'webgpu'
  } else if (hasWebGL2) {
    preferredRenderer = 'webgl2'
  } else if (hasWebGL1) {
    preferredRenderer = 'webgl1'
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const isLowPower = window.matchMedia('(any-pointer: coarse) and (hover: none)').matches

  cachedCapability = {
    hasWebGPU,
    hasWebGL2,
    hasWebGL1,
    hasGPU: hasWebGPU || hasWebGL2 || hasWebGL1,
    preferredRenderer,
    dpr,
    isLowPower,
  }

  return cachedCapability
}

export function isWebGPUAvailable(): boolean {
  if (typeof window === 'undefined') return false
  return 'gpu' in navigator
}
