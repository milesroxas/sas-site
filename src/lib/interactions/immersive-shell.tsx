'use client'

import cn from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'
import { Canvas } from '@/lib/webgl/components/canvas'

export type ImmersiveShellProps = {
  children: ReactNode
  /** Activates GlobalCanvas and tunnel targets for WebGL / DOM overlay content in this subtree. */
  webgl?: boolean
} & HTMLAttributes<HTMLDivElement>

/** Optional GPU layer for a subtree. Site-wide smooth scroll is provided by `SmoothScrollProvider`. */
export function ImmersiveShell({
  children,
  webgl = false,
  className,
  ...props
}: ImmersiveShellProps) {
  return (
    <Canvas root={webgl}>
      <div className={cn(className)} {...props}>
        {children}
      </div>
    </Canvas>
  )
}
