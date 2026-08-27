'use client'

import type { ReactNode } from 'react'
import {
  fullViewportSectionClassName,
  mediaSectionYClassName,
  type SectionTheme,
  themeClasses,
} from '@/blocks/shared/section'
import { ScrollReveal, type ScrollRevealVariant } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

/**
 * Full-viewport shell for work-page composition blocks. The entrance itself —
 * `data-reveal` text drop, `data-reveal="media"` top-down mask reveal, replay
 * on each pass — lives in `shared/ui/scroll-reveal`; this wrapper only
 * supplies the surface, viewport height, theme, and the block's reveal
 * `variant` (`intro` for text-only shapes, `underMedia` when copy sits with a
 * media reveal).
 *
 * `media` uses the looser Y rhythm (`mediaSectionYClassName`) so neighboring
 * images don't crowd. Text-only blocks keep the shared band padding.
 *
 * `as="div"` is for blocks that render their own `<section>` root; the shell
 * then only supplies the surface, viewport height, and entrance.
 */
export function RevealSection({
  as = 'section',
  theme = 'light',
  variant,
  media = false,
  className,
  children,
}: {
  as?: 'section' | 'div'
  theme?: SectionTheme | null
  variant?: ScrollRevealVariant
  media?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <ScrollReveal
      as={as}
      variant={variant}
      className={cn(
        fullViewportSectionClassName,
        media && mediaSectionYClassName,
        themeClasses[theme || 'light'],
        className,
      )}
    >
      {children}
    </ScrollReveal>
  )
}
