import type { ReactNode, Ref } from 'react'
import { cn } from '@/utilities/ui'

/**
 * Page widths. Tokens live in `globals.css` (`--max-width-content-*`).
 *
 * - default: 96rem / 1536px + gutters — the page column (header/footer too)
 * - full: edge to edge, no gutters — viewport bleed
 * - narrow: 40rem / 640px — single-column reading
 */
export const containerWidthClasses = {
  default: 'container',
  narrow: 'container container-narrow',
  full: 'container-full',
} as const

export type ContainerWidth = keyof typeof containerWidthClasses

export const Container = ({
  children,
  width = 'default',
  className,
  ref,
}: {
  children: ReactNode
  width?: ContainerWidth | null
  className?: string
  ref?: Ref<HTMLDivElement>
}) => (
  <div className={cn(containerWidthClasses[width || 'default'], className)} ref={ref}>
    {children}
  </div>
)
