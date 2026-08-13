import type { ReactNode, Ref } from 'react'
import { cn } from '@/utilities/ui'

/**
 * Horizontal section widths. Always applies `.container` (full viewport + the
 * shared `--spacing-gutter`, aligned with header/footer `px-gutter`).
 *
 * - full: site frame — gutters only, no max-width
 * - default: 80rem / 1280px — marketing grids
 * - narrow: 48rem / 768px — reading, forms
 *
 * Tokens live in `globals.css` (`--max-width-content-*`). Change once there.
 */
export const containerWidthClasses = {
  full: undefined,
  default: 'max-w-content-default',
  narrow: 'max-w-content-narrow',
} as const

export type ContainerWidth = keyof typeof containerWidthClasses

export const Container = ({
  children,
  width = 'full',
  className,
  ref,
}: {
  children: ReactNode
  width?: ContainerWidth | null
  className?: string
  ref?: Ref<HTMLDivElement>
}) => (
  <div className={cn('container', containerWidthClasses[width || 'full'], className)} ref={ref}>
    {children}
  </div>
)
