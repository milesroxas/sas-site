import type { ReactNode, Ref } from 'react'
import { cn } from '@/utilities/ui'

/**
 * Horizontal content widths for layout blocks.
 *
 * - narrow: reading / forms (~768px)
 * - standard: default marketing content (~1280px)
 * - expansive: cinematic full-bleed — gutters only, no max-width
 *
 * Tokens live in `globals.css` (`--width-content-*`). Change once there.
 */
export const containerWidthClasses = {
  narrow: 'container-narrow',
  standard: 'container-standard',
  expansive: undefined,
} as const

export type ContainerWidth = keyof typeof containerWidthClasses

/** Guttered page container with an optional content max-width. */
export const Container = ({
  children,
  width = 'expansive',
  className,
  ref,
}: {
  children: ReactNode
  width?: ContainerWidth | null
  className?: string
  ref?: Ref<HTMLDivElement>
}) => (
  <div
    className={cn('container', containerWidthClasses[width || 'expansive'], className)}
    ref={ref}
  >
    {children}
  </div>
)
