'use client'

import type { ReactNode } from 'react'
import { type SectionTheme, themeClasses } from '@/blocks/shared/section'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

/**
 * Full-viewport shell for work-page composition blocks. The entrance itself —
 * `data-reveal` text rise, `data-reveal="media"` scale settle, replay on each
 * pass — lives in `shared/ui/scroll-reveal`; this wrapper only supplies the
 * surface, viewport height, and theme.
 *
 * `as="div"` is for blocks that render their own `<section>` root; the shell
 * then only supplies the surface, viewport height, and entrance.
 */
export function RevealSection({
  as = 'section',
  theme = 'light',
  className,
  children,
}: {
  as?: 'section' | 'div'
  theme?: SectionTheme | null
  className?: string
  children: ReactNode
}) {
  return (
    <ScrollReveal
      as={as}
      className={cn(
        'flex min-h-[calc(100svh-var(--footer-height))] flex-col justify-center overflow-clip py-16 md:py-24',
        themeClasses[theme || 'light'],
        className,
      )}
    >
      {children}
    </ScrollReveal>
  )
}
