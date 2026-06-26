'use client'

import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { detectGPUCapability, type GPUCapability } from '@/lib/webgl/utils/gpu-detection'

const defaultCapability: GPUCapability = {
  hasWebGPU: false,
  hasWebGL2: false,
  hasWebGL1: false,
  hasGPU: false,
  preferredRenderer: 'none',
  dpr: 1,
  isLowPower: false,
}

export function useDeviceDetection() {
  const isReducedMotion = usePrefersReducedMotion()

  const [gpuCapability, setGpuCapability] = useState<GPUCapability>(defaultCapability)

  useEffect(() => {
    setGpuCapability(detectGPUCapability())
  }, [])

  const hasGPU = gpuCapability.hasGPU && !gpuCapability.isLowPower && !isReducedMotion

  return {
    isReducedMotion,
    hasGPU,
    hasWebGPU: gpuCapability.hasWebGPU,
    hasWebGL: gpuCapability.hasWebGL2 || gpuCapability.hasWebGL1,
    gpuCapability,
    isLowPowerMode: gpuCapability.isLowPower,
    dpr: gpuCapability.dpr,
  }
}
