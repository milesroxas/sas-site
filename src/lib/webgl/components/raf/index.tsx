'use client'

import { useThree } from '@react-three/fiber'
import { useTempus } from 'tempus/react'

type RAFProps = {
  render?: boolean
}

/**
 * Drives the R3F frame loop when Canvas uses `frameloop="never"`.
 * Pausing `render` stops CPU/GPU work while keeping the GL context alive (with GlobalCanvas).
 */
export function RAF({ render = true }: RAFProps) {
  const advance = useThree((state) => state.advance)

  useTempus(
    ({ time }) => {
      if (render) {
        advance(time / 1000)
      }
    },
    { priority: 1 },
  )

  return null
}
